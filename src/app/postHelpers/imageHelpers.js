import { ImageSuffixes, VideoSuffixes } from "../../app/constants";

// TODO
// RedditMedia is popping up as Non-Recognized, but why isn't imgur and postimg?

// TODO: 
// I have created PHP webpage retriever + parsers before, not 100% sure how I would do that with react
//     But it seems like with most of these this is what I am going to have to do 
//
// - https://www.redditmedia.com/mediaembed/*
//    The ONE I have of this is a video? Is it always? How do I actually see what this is?
// - https://imgur.com/a/*
//     Imgur albums, series of images, how do I get this?
//     Need api key for the official api - I don't want to deal with that
// - https://redgifs.com
//      Need api key for the official api - I don't want to deal with that
// - https://postimg.cc/*
//     - Don't see any sort of official api for this
// - https://i.postimg.cc/*/<actual-image-link>
//     These are weird, if you actually go to the link it removes the /<actual-image-link> part and just shows the image?
export function alterLink(url, author) {
    if (url.startsWith('https://external-i.redd.it')) {
        return url.split('?')[0].replace('external-i.redd.it', 'i.redd.it');
    } else if (url.startsWith('https://external-preview.redd.it')) {
        return url.split('?')[0].replace('external-preview.redd.it', 'i.redd.it');
    } else if (url.startsWith('https://preview.redd.it')) {
        return url.split('?')[0].replace('preview.redd.it', 'i.redd.it');
    } else if (url.startsWith('https://i.redd.it')) {
        return url.split('?')[0];
    } else if (url.startsWith('//static1.e621.net')) {
        return `https:${url}`;
    } else if (isImageLink(url) || isVideoLink(url)) {
        // Do nothing, don't log
        return url;
    } else {
        console.log('Non-recognized URL in media metadata for user ' + author + ': ', url);
        return null; // The hope here is to not try and force a website link into an image or video tag
    }
}

export function isImageLink(url) {
    return urlSuffixIn(url, ImageSuffixes);
}

export function isVideoLink(url) {
    return urlSuffixIn(url, VideoSuffixes);
}

function urlSuffixIn(url, array) {
    if (url === undefined || url === null) return false;
    for (let i = 0; i < array.length; i++) {
        if (url.endsWith(array[i])) return true;
    }
    return false;
}