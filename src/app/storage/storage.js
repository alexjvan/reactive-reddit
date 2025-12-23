import { GrabberCategoryFilters, GrabberCategoryPosts, GrabberCategoryProcessedUsers, GrabberCategorySubs } from '../constants';

const lzstring = require('lz-string');

export function getFromStorage(group, key, fallback, validation, extraOne, extraTwo) {
    let stored = localStorage.getItem(group + key);
    if (!stored) return fallback; // `null` or `''` case handled here

    let decoded = lzstring.decompress(stored);
    if (!decoded) return fallback;

    try {
        let data = JSON.parse(decoded);
        return validation ? validation(data, fallback, extraOne, extraTwo) : data;
    } catch (error) {
        console.error(`Error parsing localStorage key "${group + key}":`, error);
        return fallback;
    }
}

// TODO: Pushing to storage is causing HUGE lag spikes
export function putInStorage(group, key, obj) {
    // No longer remove undefined objects, since they will probably be undefined during load (might fix deletion issues)
    if (obj === null || obj === undefined)
        return;

    try {
        localStorage.setItem(group + key, lzstring.compress(JSON.stringify(obj)));
    } catch (error) {
        console.error(`Error storing key "${group + key}" in localStorage:`, error);
    }
}

export function removeGroupFromStorage(group) {
    const keys = [GrabberCategorySubs, GrabberCategoryFilters, GrabberCategoryPosts, GrabberCategoryProcessedUsers];
    keys.forEach(key => {
        removeItemFromStorage(group + key);
    });
}

export function removeItemFromStorage(group, key) {
    localStorage.removeItem(group + key);
}
