import { useDeepCompareMemo } from 'use-deep-compare';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './MediaContainer.css';
import './ValidatedImage.js';
import { isImageLink, isVideoLink } from '../../../app/postHelpers/imageHelpers';
import ValidatedImage from './ValidatedImage.js';

export default function MediaContainer({
    username,
    textMedia,
    postObj,
    setPosts
}) {
    const [imageIndex, setImageIndex] = useState(0);
    const containerRef = useRef(null);

    const extractMedia = useCallback((post) => {
        if (!post) return [];
        return [
            ...(post.media_metadata
                ? Object.entries(post.media_metadata).map(([_, value]) =>
                    value.o
                        ? typeof value.o[0] === "string"
                            ? value.o[0]
                            : value.o[0].u
                        : value.s
                            ? value.s[0]
                            : value.hlsUrl
                )
                : []),
            ...(post.preview
                ? post.preview.images 
                    ? post.preview.images.map((imgs) => imgs.source.url)
                    : []
                : []),
            ...(post.preview
                ? post.preview.reddit_video_preview
                    ? [post.preview.reddit_video_preview.fallback_url] // Interestingly, this isn't a list?
                    : []
                : []),
            ...(post.secure_media_embed
                ? post.secure_media_embed.media_domain_url
                    ? [post.secure_media_embed.media_domain_url]
                    : post.secure_media_embed.content
                        ? [post.secure_media_embed.content.match(/src="([^"]+)"/)?.[1]].filter(Boolean)
                        : []
                : [])
        ]
    }, []);

    const embeddedMedia = useMemo(() => extractMedia(postObj), [postObj]);
    const mediaCrossPost = useMemo(() => (postObj.crosspost_parent && postObj.crosspost_parent_list ? extractMedia(postObj.crosspost_parent_list[0]) : []), [postObj]);

    const media = useDeepCompareMemo(
        () => mergeMedia(),
        [mediaCrossPost, embeddedMedia, textMedia]
    );

    const [removedImages, setRemovedImages] = useState([]);

    const displaying = useMemo(
        () => media.filter((url) => !removedImages.includes(url)), 
        [media, removedImages]
    );

    useEffect(() => {
        setPosts(prev =>
            prev.map(p => {
                if (p.name !== postObj.name) return p;
                const hasMedia = displaying.length > 0;
                if (p.hasMedia === hasMedia) return p; // prevent no-op updates
                return { ...p, hasMedia };
            })
        );
    }, [displaying.length]);

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
    function mergeMedia() {
        const merged = [...embeddedMedia, ...mediaCrossPost, ...textMedia];

        // Array from set to remove duplicates
        return [...new Set(
            merged
                .filter(i => i !== undefined)
                .map((url) => {
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
                    } else {
                        console.log('Non-recognized URL in media metadata for user ' +
                            username + ': ', url);
                        return null; // The hope here is to not try and force a website link into an image or video tag
                    }
                    return url;
                })
                .filter((i) => i !== null)
        )];
    }

    useEffect(() => {
        function handleImageClick(event) {
            const link = event.target.getAttribute("data-link");
            if (link) {
                const index = displaying.indexOf(link);
                if (index !== -1) setImageIndex(index);
            }
        }

        const container = containerRef.current;
        if (!container) return;

        container.addEventListener("click", handleImageClick);
        return () => container.removeEventListener("click", handleImageClick);
    }, [displaying]);

    function prevImage() {
        setImageIndex((prev) => (prev === 0 ? displaying.length - 1 : prev - 1));
    }

    function nextImage() {
        setImageIndex((prev) => (prev === displaying.length - 1 ? 0 : prev + 1));
    }

    function removeImage(url) {
        setRemovedImages((current) => [...current, url]);
    }

    const imageSelectors = useMemo(() => {
        const total = displaying.length;

        if (total === 0) return [];

        const rows = Math.ceil(total / 50); // Max 50 items per row

        const perRow = Math.ceil(total / rows);

        return displaying.map((_, index) => (
            <a
                key={index}
                className="post-imageselector-chooser clickable"
                style={{
                    backgroundColor: index === imageIndex ? 'var(--accent)' : 'white',
                    flex: `1 1 calc(100% / ${perRow} - 10px)`,
                }}
                onClick={() => setImageIndex(index)}
            />
        ));
    }, [displaying.length, imageIndex]);

    const currentMedia = displaying[imageIndex];

    // Ensure imageIndex stays within bounds when the available displaying media changes.
    useEffect(() => {
        if (displaying.length === 0) {
            setImageIndex(0);
            return;
        }
        setImageIndex((prev) => Math.min(prev, displaying.length - 1));
    }, [displaying.length]);

    return (displaying.length !== 0 &&
        <div className="post-images" ref={containerRef}>
            <div className="post-imagescontainer">
                {displaying.length > 1 &&
                    <>
                        <button className="post-prevImage" onClick={prevImage}>
                            &lt;
                        </button>
                        <button className="post-nextImage" onClick={nextImage}>
                            &gt;
                        </button>
                    </>
                }
                {isImageLink(currentMedia)
                    ? <ValidatedImage
                        key={currentMedia} // For some reason the key as the index doesn't trigger a reload? But the url does
                        src={currentMedia}
                        alt={`Media item ${imageIndex + 1}`}
                        callback={() => removeImage(currentMedia)}
                    />
                    : isVideoLink(currentMedia) 
                        ? <video
                            key={currentMedia}
                            className="post-displayvideo"
                            src={currentMedia}
                            loading="lazy"
                            controls
                        />
                        : null
                }
            </div>
            <div className="post-imageselector">
                {imageSelectors}
            </div>
        </div>
    );
}
