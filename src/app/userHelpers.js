import { SettingRemoveInactiveUserTime } from "./constants";
import { daysFrom } from "./timeHelpers";

export function isUserOutdated(user, settings) {
    if (!settings) return false;

    return daysFrom(user.earliestPost * 1000) >= settings[SettingRemoveInactiveUserTime.fieldName];
}

export function isUserOutdatedFromPosts(posts, settings) {
    if (!settings) return false;
    if (posts.length === 0) return true;

    let earliestPost = [...posts].sort((a, b) => b.date - a.date)[0];

    return daysFrom(earliestPost.date * 1000) >= settings[SettingRemoveInactiveUserTime.fieldName];
}