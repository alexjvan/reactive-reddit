import { useDeepCompareMemo } from 'use-deep-compare';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { isImageLink, isVideoLink } from '../../../app/postHelpers/imageHelpers';

export default function MediaContainer({
    imageCache,
    setImageCache,
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
                ? post.preview.images.map((imgs) => imgs.source.url)
                : []),
            ...(post.secure_media_embed
                ? post.secure_media_embed.media_domain_url
                    ? [post.secure_media_embed.media_domain_url]
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

    const [validatedImages, setValidatedImages] = useState([]);
    useEffect(() => {
        async function validateImages() {
            const validImages = await Promise.all(
                media.map(async (url) => {
                    if (imageCache.has(url)) return imageCache.get(url);
                    try {
                        const validUrl = await new Promise((resolve) => {
                            const img = new Image();
                            img.onload = () => {
                                // TODO
                                // Reddit "image deleted" placeholder is 130x60
                                // This will catch other images, but at this point I have tried so many things I am happy with this
                                if (img.naturalWidth === 130 && img.naturalHeight === 60) {
                                    resolve(null);
                                } else {
                                    resolve(url);
                                }
                            };
                            img.onerror = () => resolve(null);
                            img.src = url;
                        });

                        setImageCache((current) => {
                            const newCache = new Map(current);
                            newCache.set(url, validUrl);
                            return newCache;
                        });
                        return validUrl;
                    } catch {
                        setImageCache((current) => {
                            const newCache = new Map(current);
                            newCache.set(url, null);
                            return newCache;
                        });
                        return null;
                    }
                })
            );

            setValidatedImages(validImages.filter(Boolean));
        }

        if (media.length) validateImages();
    }, [media]);

    const displaying = validatedImages;

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

    // TODO: 
    // - https://www.redditmedia.com/mediaembed/*
    //    The ONE I have of this is a video? Is it always? How do I actually see what this is?
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
                        console.log('Non-recognized URL in media metadata:', url);
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

    const imageSelectors = useMemo(() => (
        displaying.map((_, index) =>
            <a
                key={index}
                className="post-imageselector-chooser clickable"
                style={{ backgroundColor: (index === imageIndex ? 'var(--accent)' : 'white') }}
                onClick={() => setImageIndex(index)}
            />
        )
    ), [displaying.length, imageIndex]);

    const currentMedia = displaying[imageIndex];

    return (displaying.length !== 0 &&
        <div className="post-images" ref={containerRef}>
            <div className="post-imagescontainer">
                {displaying.length > 1 && (
                    <>
                        <button className="post-prevImage" onClick={prevImage}>
                            &lt;
                        </button>
                        <button className="post-nextImage" onClick={nextImage}>
                            &gt;
                        </button>
                    </>
                )}
                {isImageLink(currentMedia)
                    ? <img
                        key={imageIndex}
                        className="post-displayimage"
                        src={currentMedia}
                        alt={`Media item ${imageIndex + 1}`}
                        loading="lazy"
                    />
                    : <video
                        key={imageIndex}
                        className="post-displayvideo"
                        src={currentMedia}
                        loading="lazy"
                        controls
                    />
                }

            </div>
            <div className="post-imageselector">
                {imageSelectors}
            </div>
        </div>
    );
}
