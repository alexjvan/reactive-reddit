import { GrabberTypeBackfill, GrabberTypeContinual } from "../constants";

export default class UserRetriever {
    constructor(
        settings,
        processedUsers,
        usersSubs,
        setUsersSubs
    ) {
        this.settings = settings;
        this.processedUsers = processedUsers;
        this.usersSubs = usersSubs;
        this.setUsersSubs = setUsersSubs;
    }

    grabLoop() {
        setTimeout(() => {
            let next = this.selectUser();

            if (next === undefined || next === null) {
                return;
            }

            let userData = this.getUser(next);

            let postInfo = undefined;
            let grabType = undefined;
            if (userData.reachedEnd) {
                grabType = GrabberTypeContinual;
                postInfo = userData.ba.beforet3;
            } else if (userData.ba.aftert3 !== undefined) {
                grabType = GrabberTypeBackfill;
                postInfo = userData.ba.aftert3;
            }

            this.fetchUser(
                next,
                postInfo,
                grabType
            );
        }, 250); // Timeout to stop reddit from freaking out
    }

    selectUser() {
        let users = this.processedUsers.filter(u => !u.disabled).map(u => u.username);

        let unRetrieved = users.filter(u => !this.usersSubs.map(us => us.username).includes(u));

        if (unRetrieved.length > 0) {
            return unRetrieved[0];
        } else {
            let retrieval = this.usersSubs.sort((a, b) => a.lastGrab - b.lastGrab);
            if (retrieval.length > 0) {
                return retrieval[0];
            } else {
                return undefined;
            }
        }
    }

    fetchUser(
        user,
        postInfo,
        postType
    ) {
        let baseUrl = 'https://api.reddit.com/user/' + user + '/submitted.json';
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
                        this.finishRetrieval(user, "403 error, assuming private.", false, false);
                    } else if (resp.status === 404) {
                        // TODO: Remove user info on 404? If they no longer exist?
                        this.finishRetrieval(user, `404 error.`, false);
                    } else if (resp.status === 429) {
                        console.log("429 error, rate limited, waiting until next interval.");
                        this.finishRetrieval(user, `Error code ${resp.status}.`, false, false);
                    } else {
                        console.log(`Uncaught error code: ${resp.status}`);
                        console.log(resp);
                        this.finishRetrieval(user, `Error code ${resp.status}.`, false, true);
                    }
                    return;
                }

                return resp.json();
            })
            .then(resp => {
                if (!resp) return;
                this.processFetch(
                    postType,
                    user,
                    resp
                );
            })
            .catch(error => {
                // For some reason 403 + 429 errors are getting caught here instead of above?
                this.finishRetrieval(user, `Transit Error.`, false, false);
            })
    }

    processFetch(
        postType,
        user,
        data
    ) {
        const setting = this.getUser(user);

        if (data.data === undefined ||
            data.data.children === undefined ||
            data.data.children.length === 0) {
            this.finishRetrieval(user, "No data returned.", postType !== GrabberTypeContinual, true);
            return;
        }

        let retrievedPosts = data.data.children;
        let direction = (postType === GrabberTypeContinual) ? data.data.before : data.data.after;

        let processed = retrievedPosts.map(post => {
            let data = post.data;

            return {
                sub: data.subreddit,
                t3: data.name
            };
        });

        const preExistingPosts = setting.subs.flatMap(s => s.t3);

        let filtered = processed.filter(p => !preExistingPosts.includes(p.t3));

        if (filtered.length === 0) {
            this.finishRetrieval(user, "0 posts, assuming loop.", postType !== GrabberTypeContinual, true);
            return;
        }

        let grouped = Object.groupBy(filtered, post => post.sub);
        let addable = Object.entries(grouped).map(([name, posts]) => {
            return {
                subname: name,
                t3s: posts.map(p => p.t3)
            };
        });

        this.setUsersSubs(prev => prev.map(us => {
            if (us.username === setting.username) {
                let newBa = { ...us.ba };
                if (postType === GrabberTypeContinual) {
                    newBa.beforet3 = processed[0].t3;
                } else if (postType === GrabberTypeBackfill) {
                    if (us.ba.beforet3 === undefined) {
                        newBa.beforet3 = processed[0].t3;
                    }
                    newBa.aftert3 = processed[processed.length - 1].t3;
                }

                return {
                    ...us,
                    ba: newBa,
                    subs: [...us.subs, ...addable]
                };
            }
            return us;
        }));

        if (direction === undefined || direction === null) {
            this.finishRetrieval(user, `No more ${(postType === GrabberTypeContinual ? 'before' : 'after')}.`, postType !== GrabberTypeContinual, true);
            return;
        }

        this.grabLoop();
    }

    getUser(user) {
        let preExisting = this.usersSubs.find(us => us.username === user);

        if (!preExisting) {
            let newUser = {
                username: user,
                lastGrab: new Date(1990, 1, 1),
                subs: [],
                reachedEnd: false,
                ba: {
                    beforet3: undefined,
                    aftert3: undefined
                }
            };
            this.setUsersSubs((prev) => [...prev, newUser]);

            return newUser;
        } else {
            return preExisting;
        }
    }

    finishRetrieval(
        user,
        reason,
        setEnd,
        grabAnother
    ) {
        let now = new Date();
        console.log("-=-=-=-=-=-=-=-=-=-=-");
        console.log("Stopping User Retrieval");
        console.log(`Reason: ${reason}`);
        console.log(`Time: ${now.toLocaleString()}`)
        console.log("-=-=-=-=-=-=-=-=-=-=-");
        this.setUsersSubs((prev) => prev.map((csub) => {
            if (csub.username === user) {
                return {
                    ...csub,
                    reachedEnd: setEnd ? true : csub.reachedEnd,
                    lastGrab: new Date()
                };
            }
            return csub;
        }));
        if (grabAnother) {
            this.grabLoop();
        }
    }
}