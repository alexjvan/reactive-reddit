import { randSixHash } from "../colors";
import {
    FilterCategoryAuthor,
    FilterCategoryTag,
    FilterCategoryText,
    FilterCategoryTextOrTitle,
    FilterCategoryTitle
} from "../constants";
import { addFiltersAsRequested } from "../filters";
import { isUserOutdated } from "../userHelpers";

export function emptyValidation(data, fallback) {
    return data;
}

export function mapConverter(data, fallback) {
    return new Map(Object.entries(data));
}

// --- FILTERS ---
export function reduceFilters(filters) {
    return removeInternalFilters(filters).sort(function (a, b) {
        return sortPrioirty(a.category) - sortPrioirty(b.category);
    });
}

function removeInternalFilters(filters) {
    // Group by category and desire, since we need those to match
    const grouped = {};

    for (const filter of filters) {
        let key = `${filter.category}&&${filter.desired}`;
        if (!grouped[key]) {
            grouped[key] = [];
        }
        grouped[key].push(filter);
    }

    const reduced = [];

    for (const groupKey in grouped) {
        let group = grouped[groupKey];

        const keeping = group
            // Sort smallest to biggest, so we can search pre-existing filters
            .sort((a, b) => a.filter.length - b.filter.length)
            .reduce((keep, filter) => {
                // Tags are exact matches, only check for exact matches
                if (filter.category === 'Tag') {
                    const exists = keep.find(f => f.filter === filter.filter);
                    if (exists) {
                        exists.count += filter.count;
                    } else {
                        keep.push({ ...filter });
                    }
                } else {
                    const exists = keep.find(f => f.filter.includes(filter.filter));
                    if (exists) {
                        exists.count += filter.count;
                    } else {
                        keep.push({ ...filter });
                    }
                }
                return keep;
            }, []);

        reduced.push(...keeping);
    }

    return reduced;
}

function sortPrioirty(category) {
    switch (category) {
        case FilterCategoryTag:
            return 10;
        case FilterCategoryAuthor:
            return 20;
        case FilterCategoryTitle:
            return 30;
        case FilterCategoryText:
            return 40;
        case FilterCategoryTextOrTitle:
            return 50;
        default:
            return 1000;
    }
}

// --- PROCESSED USERS ---
export function processedUsersValidation(processedUsers, fallback, settings, filters) {
    return processedUsers.map(u => {
        let missedFilteredPosts = [];
        let newPosts = u.posts
            .map(p => {
                let nowApplicable = addFiltersAsRequested(settings, filters, p, true);

                if (nowApplicable.length > 0) {
                    missedFilteredPosts.push({
                        filteredFor: nowApplicable,
                        post: p
                    });
                    return undefined;
                } else {
                    return p;
                }
            })
            .filter(p => p !== undefined)
            .sort((a, b) => b.date - a.date);
        let newEarliestPost = newPosts.length > 0 ? newPosts[0].date : 0;

        return {
            ...u,
            posts: newPosts,
            filteredPosts: missedFilteredPosts,
            earliestPost: newEarliestPost
        };
    });
}

export function shrinkUsers(processedUsers, settings) {
    return processedUsers
        .map(user => {
            if (user.disabled) return undefined;

            if (user.posts.length === 0) return undefined;

            if (isUserOutdated(user, settings)) return undefined;

            // It seems like this //might// pull filteredPosts out of the object? - Need to validate
            const { filteredPosts, ...userWithoutFilteredPosts } = user;
            return userWithoutFilteredPosts;
        })
        .filter(u => u !== undefined);
}

// --- SAVE DATA ---
export function saveDataRetrieval(data, fallback) {
    return data.split('.');
}

export function saveDataStorage(data) {
    return data.join('.');
}

// --- SETTINGS ---
export function settingsValidation(data, fallback) {
    Object.entries(fallback).forEach(([key, value]) => {
        if (data[key] === undefined) {
            data[key] = value;
        }
    });

    Object.entries(data).forEach(([key, value]) => {
        if (fallback[key] === undefined) {
            delete data[key];
        }
    });

    return data;
}

// --- SUBS ---
const dontGrabMinutes = 15;

export function resumeRetrieval(data, fallback, postQueue, setPostQueueHasData) {
    let included = []; // Array to no have duplicate subs
    let returning = data.map(sub => {
        if (included.includes(sub.name)) {
            return undefined;
        }
        let color = sub.color;
        if (color === undefined) color = randSixHash();

        included.push(sub.name);

        return { ...sub, color };
    });

    let sorted = returning
        .filter(s => s !== undefined)
        // Prioritize searching for more frequently used subs
        .sort((a, b) => (b.postCount ? b.postCount : 0) - (a.postCount ? a.postCount : 0));

    // To cut back on number of calls, don't re-request if retrieved in the last x minutes
    let early = new Date();
    early.setMinutes(early.getMinutes() - dontGrabMinutes);
    let earlyepoch = Math.floor(early / 1000);

    sorted.forEach(sub => {
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
    return subs.map(sub => {
        let returning = sub;
        returning.postCount = posts.filter(p => p.subreddit === sub.name).length;
        return returning;
    });
}

// --- UsersSubs ---
export function removeInactiveUsers(usersSubs, processedUsers) {
    if (!usersSubs || !processedUsers) return usersSubs;

    let activeUsers = new Set(
        processedUsers
            .filter(u => !u.disabled)
            .map(u => u.name)
    );

    return usersSubs.filter(us => activeUsers.has(us.username));
}