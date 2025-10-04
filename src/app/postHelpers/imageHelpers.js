import { ImageSuffixes, VideoSuffixes } from "../../app/constants";

export function isImageLink(url) {
    return urlSuffixIn(url, ImageSuffixes);
}

export function isVideoLink(url) {
    return urlSuffixIn(url, VideoSuffixes);
}

function urlSuffixIn(url, array) {
    for (let i = 0; i < array.length; i++) {
        if (url.endsWith(array[i])) return true;
    }
    return false;
}