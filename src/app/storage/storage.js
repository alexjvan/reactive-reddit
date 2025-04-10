const lzstring = require('lz-string');

export function getFromStorage(key, fallback, validation, extraOne, extraTwo) {
    let stored = localStorage.getItem(key);
    if (!stored) return fallback; // `null` or `''` case handled here

    let decoded = lzstring.decompress(stored);
    if (!decoded) return fallback;

    try {
        let data = JSON.parse(decoded);
        return validation ? validation(data, fallback, extraOne, extraTwo) : data;
    } catch (error) {
        console.error(`Error parsing localStorage key "${key}":`, error);
        return fallback;
    }
}

export function putInStorage(key, obj) {
    if (obj === null || obj === undefined) {
        localStorage.removeItem(key); // Clean up storage for null values
        return;
    }

    try {
        localStorage.setItem(key, lzstring.compress(JSON.stringify(obj)));
    } catch (error) {
        console.error(`Error storing key "${key}" in localStorage:`, error);
    }
}
