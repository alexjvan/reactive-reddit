import { useEffect, useMemo, useState } from 'react';
import { isImageLink, isVideoLink } from '../../../app/postHelpers/imageHelpers';
import { useCallback } from 'react';

export default function MediaContainer({
    textMedia,
    postObj
}) {
    const [imageIndex, setImageIndex] = useState(0);

    const extractMedia = useCallback((post) => {
        if (!post) return [];
        return [
            ...(post.media_metadata
                ? Object.entries(post.media_metadata).map(([_, value]) => 
                    value.o 
                        ? typeof value.o[0] === "string"
                            ? value.o[0]
                            : value.o[0].u 
                        : value.s[0]
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
    });

    const embeddedMedia = useMemo(() => extractMedia(postObj), [postObj]);
    const mediaCrossPost = useMemo(() => (postObj.crosspost_parent && postObj.crosspost_parent_list ? extractMedia(postObj.crosspost_parent_list[0]) : []), [postObj]);

    const media = useMemo(
        () => mergeMedia(),
        [mediaCrossPost, embeddedMedia, textMedia]
    );

    // TODO: Re-enable after create a way to save processed posts
    // const [validatedImages, setValidatedImages] = useState([]);
    // useEffect(() => {
    //     const cache = new Map();

    //     async function validateImages(){
    //         const validImages = await Promise.all(
    //             media.map(async (url) => {
    //                 if (cache.has(url)) return cache.get(url);
    //                 try {
    //                     const response = await fetch(url, { method: 'HEAD' });
    //                     if (response.ok) { // TODO: We probably only need to check its not 404? Other 400-error codes may be a side-effect (Ex: 429)
    //                         cache.set(url, url);
    //                         return url;
    //                     }
    //                 } catch (error) {
    //                     console.error(`Error fetching ${url}:`, error);
    //                 }
    //                 cache.set(url, null);
    //                 return null;
    //             })
    //         );
    //         setValidatedImages(validImages.filter(Boolean));
    //     }

    //     validateImages();
    // }, [media]);

    const displaying = media;

    function mergeMedia() {
        const merged = [...embeddedMedia, ...mediaCrossPost, ...textMedia];

        // Array from set to remove duplicates
        return [...new Set(
            merged.map((url) => {
                if (url.startsWith('https://external-i.redd.it')) {
                    return url.split('?')[0].replace('external-i.redd.it', 'i.redd.it');
                } else if (url.startsWith('https://external-preview.redd.it')) {
                    return url.split('?')[0].replace('external-preview.redd.it', 'i.redd.it');
                } else if (url.startsWith('https://preview.redd.it')) {
                    return url.split('?')[0].replace('preview.redd.it', 'i.redd.it');
                } else if (url.startsWith('https://i.redd.it')) {
                    return url.split('?')[0];
                } else if (url.startsWith('//static1.e621.net')) {
                    return "https:" + url;
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

    // UseEffect for click handling for <a> tags in <div> elements (I hate react)
    useEffect(() => {
        function handleImageClick(event) {
            const link = event.target.getAttribute("data-link");
            if (link) {
                const index = displaying.indexOf(link);
                if (index !== -1) setImageIndex(index);
            }
        };

        document.querySelector(".post-images")?.addEventListener("click", handleImageClick);
        return () => document.querySelector(".post-images")?.removeEventListener("click", handleImageClick);
    }, []);

    function prevImage() {
        setImageIndex((prev) => (prev === 0 ? displaying.length - 1 : prev - 1));
    }

    function nextImage() {
        setImageIndex((prev) => (prev === displaying.length - 1 ? 0 : prev + 1));
    }

    const imageSelectors = useMemo(() => (
        displaying.map((_, index) => (
            <a
                key={index}
                className="post-imageselector-chooser clickable"
                style={{ backgroundColor: (index === imageIndex ? '#30e8ff' : 'white') }}
                onClick={() => setImageIndex(index)}
            />
        ))
    ), [displaying.length, imageIndex]);

    const currentMedia = displaying[imageIndex];

    return (displaying.length !== 0 &&
        <div className="post-images">
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
