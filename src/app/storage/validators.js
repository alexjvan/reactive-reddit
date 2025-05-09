import { filterCheck } from "../filters";
import { getSub } from "../subHelpers";
import { cleanPost } from "../grabber/postFunctions";
import { randSixHash } from "../colors";

export function emptyValidation(data, fallback) {
    return data;
}

// --- SUBS ---
const dontGrabMinutes = 15;

export function resumeRetrieval(data, fallback, postQueue, setPostQueueHasData) {
    let included = [];
    let returning = data.map((sub) => {
        if (included.includes(sub.name)) {
            return undefined;
        }
        if (sub.color === undefined) sub.color = randSixHash();

        included.push(sub.name);

        return sub;
    });

    let sorted = returning
        .filter(s => s !== undefined)
        // Prioritize searching for more frequently used subs
        .sort((a, b) => (b.postCount ? b.postCount : 0) - (a.postCount ? a.postCount : 0));

    // To cut back on number of calls, don't re-request if retrieved in the last x minutes
    let early = new Date();
    early.setMinutes(early.getMinutes() - dontGrabMinutes);
    let earlyepoch = Math.floor(early / 1000);

    sorted.forEach((sub) => {
        if (!sub.reachedEnd) {
            postQueue.enqueue({
                sub: sub.name,
                ba: sub.ba.aftert3,
                pre: false
            }, 1);
        }
        if (sub.ba.beforeutc !== undefined && sub.ba.beforeutc < earlyepoch) {
            postQueue.enqueue({
                sub: sub.name,
                ba: sub.ba.beforet3,
                iterations: 0,
                pre: true
            }, 2);
        }
    });

    setPostQueueHasData(true);

    return sorted;
}

export function padSubs(subs, posts) {
    return subs.map((sub) => {
        let returning = sub;
        returning.postCount = posts.filter(p => p.subreddit === sub.name).length;
        return returning;
    })
}

// --- POSTS ---
export function shrinkPosts(posts) {
    return posts
        .filter(post => !post.disabled && post.filteredFor.length === 0);
}

// --- FILTERS ---
export function postValidation(data, fallback, subs, filters) {
    return data.map((post) => {
        if (post.selftext_html !== undefined) delete post.selftext_html;
        if (post.color === undefined) post.color = getSub(subs, post.subreddit).color;
        if (post.duplicates === undefined) post.duplicates = 0;
        let filteredFor = filters.find(filter => filterCheck(filter, post));
        post.filteredFor = [filteredFor].filter(x => x !== undefined);
        cleanPost(post);
        return post;
    });
}

export function reduceFilters(filters) {
    return removeInternalFilters(filters).sort(function (a, b) {
        return sortPrioirty(a.category) - sortPrioirty(b.category);
    });
}

function removeInternalFilters(filters) {
    // Group by category and desire, since we need those to match
    const grouped = {};

    for(const filter of filters) {
        let key = filter.category + "&&" + filter.desired;
        if(!grouped[key]) {
            grouped[key] = [];
        }
        grouped[key].push(filter);
    }

    const reduced = [];

    for(const groupKey in grouped) {
        let group = grouped[groupKey];

        const keeping = group
            // Sort smallest to biggest, so we can search pre-existing filters
            .sort((a, b) => b.filter.length - a.filter.length)
            .reduce((keep, filter) => {
                const exists = keep.find(f => f.filter.includes(filter.filter));
                if(exists) {
                    exists.count += filter.count;
                } else {
                    keep.push({...filter});
                }
                return keep;
            }, []);

        reduced.push(...keeping);
    }

    return reduced;
}

function sortPrioirty(category) {
    switch (category) {
        case "Tag":
            return 10;
        case "Author":
            return 20;
        case "Title":
            return 30;
        case "Text":
            return 40;
        case "Text||Title":
            return 50;
        default:
            return 1000;
    }
}