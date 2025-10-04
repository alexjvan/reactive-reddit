import { GrabberCategoryFilters, GrabberCategoryMinUsers, GrabberCategoryPosts, GrabberCategorySubs } from '../constants';

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

export function putInStorage(group, key, obj) {
    if (obj === null || obj === undefined) {
        localStorage.removeItem(group + key); // Clean up storage for null values
        return;
    }

    try {
        localStorage.setItem(group + key, lzstring.compress(JSON.stringify(obj)));
    } catch (error) {
        console.error(`Error storing key "${group + key}" in localStorage:`, error);
    }
}

export function removeGroupFromStorage(group) {
    const keys = [GrabberCategorySubs, GrabberCategoryFilters, GrabberCategoryPosts, GrabberCategoryMinUsers];
    keys.forEach((key) => {
        removeItemFromStorage(group + key);
    });
}

export function removeItemFromStorage(group, key) {
    localStorage.removeItem(group + key);
}
