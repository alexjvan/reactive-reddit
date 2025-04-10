const imgSuffixes = ['.jpeg', '.jpg', '.gif', '.png'];
const videoSuffixes = ['.mp4', '.webm'];

export function isImageLink(url) {
    return urlSuffixIn(url, imgSuffixes);
}

export function isVideoLink(url) {
    return urlSuffixIn(url, videoSuffixes);
}

function urlSuffixIn(url, array) {
    for (let i = 0; i < array.length; i++) {
        if (url.endsWith(array[i])) return true;
    }
    return false;
}