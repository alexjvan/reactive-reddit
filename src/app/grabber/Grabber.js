import { cleanPost } from "./postFunctions";
import { filterCheck } from "../filters";
import { getSub } from "../subHelpers";

export default class Grabber {
    constructor(
        subs,
        setSubs,
        posts,
        setPosts,
        postQueue,
        setPostQueueHasData,
        filters
    ) {
        this.subs = subs;
        this.setSubs = setSubs;
        this.posts = posts;
        this.setPosts = setPosts;
        this.postQueue = postQueue;
        this.setPostQueueHasData = setPostQueueHasData;
        this.filters = filters;
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
            .then(resp => resp.json())
            .then(resp => {
                // TODO: Error code handling
                //      404, remove sub
                //      429, no need to do anything, give up
                this.processFetch(
                    postType,
                    sub,
                    resp,
                    iterations
                );
            })
            .catch(error => console.log(error)) // I don't think this actually does anything, but we will keep it for now
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
                    this.finishRetrieval(sub, "No data returned.", postType !== 'Continual');
                }
            } else {
                this.finishRetrieval(sub, "No data returned.", postType !== 'Continual');
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
            let applicableFilters = this.filters.find((filter) => filterCheck(filter, returning));
            returning.filteredFor = [applicableFilters].filter((x) => x !== undefined);
            return returning;
        });

        const preExistingPosts = new Set(this.posts.map(p => p.name));
        let filtered = processed.filter(p => !preExistingPosts.has(p.name)); // Don't know why this is necessary, but it eliminates duplicate posts. Invesigate eventually, low pri
        if (postType === 'Backfill') {
            if (setting.ba.afterutc) {
                filtered = filtered.filter(p => p.created_utc < setting.ba.beforeutc);
            }
        } else if (setting.ba.created_utc) {
            filtered = filtered.filter(p => p.created_utc > setting.ba.beforeutc);
        }

        if (filtered.length === 0) {
            this.finishRetrieval(sub, "0 posts, assuming loop.", postType !== 'Continual');
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
            this.finishRetrieval(sub, "No more " + (postType === 'Continual' ? 'before' : 'after') + ".", postType !== 'Continual');
            return;
        }

        this.grabLoop({
            sub: sub,
            ba: direction,
            iterations: iterations + 1,
            pre: postType === 'Continual',
            ba: postType === 'Savior'
        }, postType === 'Continual' ? 2 : 1);
    }

    // Exported since this is used in sub-validation
    

    finishRetrieval(
        sub,
        reason,
        setEnd
    ) {
        console.log("-=-=-=-=-=-=-=-=-=-=-");
        console.log("Stopping Retrieval");
        console.log("Sub: " + sub);
        console.log("Reason: " + reason);
        console.log("-=-=-=-=-=-=-=-=-=-=-");
        if (setEnd) {
            this.setSubs((prev) => prev.map((csub) => {
                if (csub.name === sub) {
                    csub.reachedEnd = true;
                }
                return csub;
            }));
        }
        this.grabLoop();
    }
}
