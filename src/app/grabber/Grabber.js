import { cleanPost } from "./postFunctions";
import { addFiltersAsRequested } from "../filters";
import { getSub } from "../subHelpers";

export default class Grabber {
    constructor(
        settings,
        subs,
        setSubs,
        posts,
        setPosts,
        postQueue,
        setPostQueueHasData,
        filters,
        setFilters
    ) {
        this.settings = settings;
        this.subs = subs;
        this.setSubs = setSubs;
        this.posts = posts;
        this.setPosts = setPosts;
        this.postQueue = postQueue;
        this.setPostQueueHasData = setPostQueueHasData;
        this.filters = filters;
        this.setFilters = setFilters;
    }

    grabLoop(adding, priority) {
        if (adding !== undefined) {
            this.postQueue.enqueue(adding, priority);
        }

        setTimeout(() => {
            let next = this.postQueue.dequeue();

            if (next === undefined || next === null) {
                this.setPostQueueHasData(false);
                return;
            }

            this.fetchSub(
                next.pre ? 'Continual' : next.savior ? 'Savior' : 'Backfill',
                next.sub,
                next.ba,
                next.iterations
            );
        }, 250); // Timeout to stop reddit from freaking out
    }

    fetchSub(
        postType,   // The type of grabber to call
        sub,        // The sub trying to be retrieved
        postInfo,   // Any post info to include in the retrieval (before/after)
        iterations // Number of current iterations of retrievals (used for pre/savior)
    ) {
        let baseUrl = 'https://api.reddit.com/r/' + sub + '/new.json';
        let url;
        if (postInfo !== undefined) {
            if (postType === 'Continual') {
                url = baseUrl + '?before=' + postInfo;
            } else {
                url = baseUrl + '?after=' + postInfo;
            }
        } else {
            url = baseUrl;
        }

        fetch(url)
            .then(resp => {
                if(!resp.ok) {
                    if(resp.status === 403) {
                        // This is a really weird case - not sure why these pop up?
                        this.finishRetrieval(sub, "403 error, assuming private.", false, false);
                    } else if(resp.status === 404) {
                        if(this.settings.removeSubOn404) {
                            console.log(`Removing ${sub} due to 404 error.`);
                            this.setSubs((prev) => prev.filter((csub) => csub.name !== sub));
                        }
                        this.finishRetrieval(sub, `404 error${this.settings.removeSubOn404 ? ', removing sub' : ''}.`, false);
                    } else if(resp.status === 429) {
                        console.log("429 error, rate limited, waiting until next interval.");
                        this.finishRetrieval(sub, `Error code ${resp.status}.`, false, false);
                    } else {
                        console.log(`Uncaught error code: ${resp.status}`);
                        console.log(resp);
                        this.finishRetrieval(sub, `Error code ${resp.status}.`, false, true);
                    }
                    return;
                }

                return resp.json();
            })
            .then(resp => {
                if(!resp) return;
                this.processFetch(
                    postType,
                    sub,
                    resp,
                    iterations
                );
            })
            .catch(error => {
                // For some reason 403 + 429 errors are getting caught here instead of above?
                this.finishRetrieval(sub, `Transit Error.`, false, false);
            })
    }

    processFetch(
        postType,
        sub,
        data,
        iterations
    ) {
        const setting = getSub(this.subs, sub);

        if (data.data === undefined ||
            data.data.children === undefined ||
            data.data.children.length === 0) {
            if (postType === 'Continual' && iterations === 0) {
                const prev = new Date(setting.ba.beforeutc * 1000);
                const now = new Date();
                const dayDifference = Math.round((now - prev) / 86400000);
                if (dayDifference >= 3) {
                    console.log(`No data returned. Attempting savior for: ${sub}`);
                    this.grabLoop({
                        sub: sub,
                        savior: true
                    }, 1);
                } else {
                    this.finishRetrieval(sub, "No data returned.", postType !== 'Continual', true);
                }
            } else {
                this.finishRetrieval(sub, "No data returned.", postType !== 'Continual', true);
            }
            return;
        }

        let retrievedPosts = data.data.children;
        let direction = (postType === 'Continual') ? data.data.before : data.data.after;

        let processed = retrievedPosts.map((post) => {
            let returning = post.data;
            cleanPost(returning);
            returning.disabled = false;
            returning.duplicates = 0;
            returning.color = setting.color;
            returning.filteredFor = addFiltersAsRequested(this.settings, this.filters, returning);

            if(returning.filteredFor.length > 0) {
                this.setFilters((prev) => prev.map((filter) => {
                    filter.count = filter.count + (returning.filteredFor.includes(filter.filter) ? 1 : 0);
                    return filter;
                }));
            }

            return returning;
        });

        const preExistingPosts = new Set(this.posts.map(p => p.name));
        let filtered = processed.filter(p => !preExistingPosts.has(p.name)); // TODO: Don't know why this is necessary, but it eliminates duplicate posts. Invesigate eventually, low pri
        if (postType === 'Backfill') {
            if (setting.ba.afterutc) {
                filtered = filtered.filter(p => p.created_utc < setting.ba.beforeutc);
            }
        } else if (setting.ba.created_utc) {
            filtered = filtered.filter(p => p.created_utc > setting.ba.beforeutc);
        }

        if (filtered.length === 0) {
            this.finishRetrieval(sub, "0 posts, assuming loop.", postType !== 'Continual', true);
            return;
        }

        this.setPosts(prev => [...prev, ...filtered]);

        // Set before-after appropriately
        switch (postType) {
            case 'Continual':
                setting.ba.beforeutc = processed[0].created_utc;
                setting.ba.beforet3 = processed[0].name;
                break;
            case 'Savior':
                // Only for the first
                //  Reset after to grab anything missed
                if (processed[0].created_utc > setting.ba.beforeutc) {
                    setting.ba.beforeutc = processed[0].created_utc;
                    setting.ba.beforet3 = processed[0].name;
                    setting.ba.afterutc = processed[processed.length - 1].created_utc;
                    setting.ba.aftert3 = processed[processed.length - 1].name;
                    setting.reachedEnd = false;
                }
                break;
            case 'Backfill':
                if (setting.ba.beforeutc === undefined) {
                    setting.ba.beforeutc = processed[0].created_utc;
                    setting.ba.beforet3 = processed[0].name;
                }
                setting.ba.afterutc = processed[processed.length - 1].created_utc;
                setting.ba.aftert3 = processed[processed.length - 1].name;
                break;
        }

        if (direction === undefined || direction === null) {
            this.finishRetrieval(sub, `No more ${(postType === 'Continual' ? 'before' : 'after')}.`, postType !== 'Continual', true);
            return;
        }

        this.grabLoop({
            sub: sub,
            ba: direction,
            iterations: iterations + 1,
            pre: postType === 'Continual',
            savior: postType === 'Savior'
        }, postType === 'Continual' ? 2 : 1);
    }

    // Exported since this is used in sub-validation
    finishRetrieval(
        sub,
        reason,
        setEnd,
        grabAnother
    ) {
        let now = new Date();
        console.log("-=-=-=-=-=-=-=-=-=-=-");
        console.log("Stopping Retrieval");
        console.log(`Sub: ${sub}`);
        console.log(`Reason: ${reason}`);
        console.log(`Time: ${now.toLocaleString()}`)
        console.log("-=-=-=-=-=-=-=-=-=-=-");
        if (setEnd) {
            this.setSubs((prev) => prev.map((csub) => {
                if (csub.name === sub) {
                    csub.reachedEnd = true;
                }
                return csub;
            }));
        }
        if(grabAnother) {
            this.grabLoop();
        }
    }
}
