import SHA256 from "crypto-js/sha256";
import WordArray from "crypto-js/lib-typedarrays";
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
        // The hope here is to not try and force a website link into an image or video tag
        // However, now that I am not processing on every load - this means these are lost. This was a mistake in hindsight.
        //   To fix, I probably need to tuple-ize this response and store un-parsable links
        // This would be a pro-active fix, I don't know if I have a way to retroactively fix this
        //   I have considered a button to "re-process" posts
        //     Thought process behind this is to move EVERYTHING from processed back to retrieved
        //     Not sure how much data I purged from the original post that would be lost + unparsable again
        //   The other option would be to try and re-retrieve from text, but once again - media might already have been deleted (need to check code)
        return null; 
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

export async function removeDuplicates(mediaArray) {
    const unique = [];
    const seenHashes = new Map();
    for(var i = 0; i < mediaArray.length; i++) {
        var item = mediaArray[i];
        if(isImageLink(item)) {
            try {
                var hash = await hashImage(item);
                if(seenHashes.has(hash)) {
                    console.log("Duplicate found, removing: " + item + " as duplicate of " + seenHashes.get(hash));
                } else {
                    seenHashes.set(hash, item);
                    unique.push(item);
                }
            } catch (error) {
                console.error("Error hashing image: " + item, error);
                unique.push(item); // If there's an error hashing, just keep the image to be safe
            }
        } else {
            // TODO: What to do here? Video Duplicate Check?
            unique.push(item);
        }
    }
    return unique;
}

async function hashImage(url) {
    const res = await fetch("/api/corscall?url=" + encodeURIComponent(url));
    const buffer = await res.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);

    return SHA256(WordArray.create(uint8Array)).toString();
}