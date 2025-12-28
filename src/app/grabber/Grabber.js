import { GrabberTypeBackfill, GrabberTypeContinual, GrabberTypeSavior } from "../constants";
import { cleanPost } from "../postHelpers/postFunctions";
import { getSub } from "../subHelpers";

// TODO: Try and generic-ize Grabber + Post Retriever
export default class Grabber {
    constructor(
        settings,
        subs,
        setSubs,
        setPosts,
        postQueue,
        setPostQueueHasData,
        filters,
        setFilters
    ) {
        this.settings = settings;
        this.subs = subs;
        this.setSubs = setSubs;
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
                next.pre ? GrabberTypeContinual : next.savior ? GrabberTypeSavior : GrabberTypeBackfill,
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
            if (postType === GrabberTypeContinual) {
                url = baseUrl + '?before=' + postInfo;
            } else {
                url = baseUrl + '?after=' + postInfo;
            }
        } else {
            url = baseUrl;
        }

        fetch(url)
            .then(resp => {
                if (!resp.ok) {
                    if (resp.status === 403) {
                        // This is a really weird case - not sure why these pop up?
                        this.finishRetrieval(sub, "403 error, assuming private.", false, true);
                    } else if (resp.status === 404) {
                        if (this.settings.removeSubOn404) {
                            console.log(`Removing ${sub} due to 404 error.`);
                            this.setSubs(prev => prev.filter(csub => csub.name !== sub));
                        }
                        this.finishRetrieval(sub, `404 error${this.settings.removeSubOn404 ? ', removing sub' : ''}.`, false);
                    } else if (resp.status === 429) {
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
                if (!resp) return;
                this.processFetch(
                    postType,
                    sub,
                    resp,
                    iterations
                );
            })
            .catch(error => {
                // For some reason 403 + 429 errors are getting caught here instead of above?
                console.log(error);
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
            if (postType === GrabberTypeContinual && iterations === 0) {
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
                    this.finishRetrieval(sub, "No data returned.", postType !== GrabberTypeContinual, true);
                }
            } else {
                this.finishRetrieval(sub, "No data returned.", postType !== GrabberTypeContinual, true);
            }
            return;
        }

        let retrievedPosts = data.data.children;
        let direction = (postType === GrabberTypeContinual) ? data.data.before : data.data.after;

        // Creating deltas so we aren't constantly trying to change the posts during retrieval
        let processed = retrievedPosts.map(post => {
            let returning = post.data;
            cleanPost(returning);
            returning.disabled = false;
            returning.duplicates = 0;

            return returning;
        });

        if (postType === GrabberTypeBackfill) {
            if (setting.ba.afterutc) {
                processed = processed.filter(p => p.created_utc < setting.ba.beforeutc);
            }
        } else if (setting.ba.created_utc) {
            processed = processed.filter(p => p.created_utc > setting.ba.beforeutc);
        }

        if (processed.length === 0) {
            this.finishRetrieval(sub, "0 posts, assuming loop.", postType !== GrabberTypeContinual, true);
            return;
        }

        this.setPosts(prev => [...prev, ...processed]);

        // Set before-after appropriately
        let updatedBa = { ...(setting.ba || {}) };
        let updatedReachedEnd = setting.reachedEnd;

        switch (postType) {
            case GrabberTypeContinual:
                updatedBa.beforeutc = processed[0].created_utc;
                updatedBa.beforet3 = processed[0].name;
                break;
            case GrabberTypeSavior:
                // Only for the first
                //  Reset after to grab anything missed
                if (processed[0].created_utc > (setting.ba?.beforeutc || 0)) {
                    updatedBa.beforeutc = processed[0].created_utc;
                    updatedBa.beforet3 = processed[0].name;
                    updatedBa.afterutc = processed[processed.length - 1].created_utc;
                    updatedBa.aftert3 = processed[processed.length - 1].name;
                    updatedReachedEnd = false;
                }
                break;
            case GrabberTypeBackfill:
                if (setting.ba?.beforeutc === undefined) {
                    updatedBa.beforeutc = processed[0].created_utc;
                    updatedBa.beforet3 = processed[0].name;
                }
                updatedBa.afterutc = processed[processed.length - 1].created_utc;
                updatedBa.aftert3 = processed[processed.length - 1].name;
                break;
        }

        // Update the sub entry in subs immutably
        this.setSubs(prev => prev.map(s => {
            if (s.name !== sub) return s;
            return { ...s, ba: updatedBa, reachedEnd: updatedReachedEnd };
        }));

        if (direction === undefined || direction === null) {
            this.finishRetrieval(sub, `No more ${(postType === GrabberTypeContinual ? 'before' : 'after')}.`, postType !== GrabberTypeContinual, true);
            return;
        }

        this.grabLoop({
            sub: sub,
            ba: direction,
            iterations: iterations + 1,
            pre: postType === GrabberTypeContinual,
            savior: postType === GrabberTypeSavior
        }, postType === GrabberTypeContinual ? 2 : 1);
    }

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
            this.setSubs(prev => prev.map(csub => {
                if (csub.name === sub) {
                    return { ...csub, reachedEnd: true };
                }
                return csub;
            }));
        }
        if (grabAnother) {
            this.grabLoop();
        }
    }
}
