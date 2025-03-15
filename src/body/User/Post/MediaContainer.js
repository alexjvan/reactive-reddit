import { useEffect, useMemo, useState } from 'react';

const imgSuffixes = ['.jpeg', '.jpg', '.gif', '.png'];
const videoSuffixes = ['.mp4', '.webm'];

export function isImageLink(url) {
    return urlSuffixIn(url, imgSuffixes);
}

export function isVideoLink(url) {
    return urlSuffixIn(url, videoSuffixes);
}

function urlSuffixIn(url, array) {
    for(let i = 0; i < array.length; i++) {
        if(url.endsWith(array[i])) return true;
    }
    return false;
}

export default function MediaContainer({
    textMedia,
    postObj
}) {
    const [imageIndex, setImageIndex] = useState(0);

    const mediaMetadata = 
        postObj.media_metadata
            ? Object.entries(postObj.media_metadata).map(([_, value]) => value.o[0].u)
            : []
    const mediaPreviewImages = 
        postObj.preview 
            ? postObj.preview.images.map((imgs) => imgs.source.url) 
            : [];
    const mediaCrossPost = getCrossPostMedia();
    const secureMedia = 
        postObj.secure_media_embed
            ? postObj.secure_media_embed.media_domain_url 
                ? [postObj.secure_media_embed.media_domain_url]
                : []
            : [];
    const media = useMemo(
        () => mergeMedia(), 
        [mediaCrossPost, mediaMetadata, mediaPreviewImages, secureMedia, textMedia]
    );

    function getCrossPostMedia() {
        if(postObj.crosspost_parent === undefined) return [];

        let grabbing = postObj.crosspost_parent_list[0];

        if(grabbing === undefined) return [];

        const metadata = 
            grabbing.media_metadata
                ? Object.entries(grabbing.media_metadata).map(([_, value]) => value.o[0].u)
                : []
        const previewImages = 
            grabbing.preview 
                ? grabbing.preview.images.map((imgs) => imgs.source.url) 
                : [];
        const secure = 
            grabbing.secure_media_embed
                ? grabbing.secure_media_embed.media_domain_url 
                    ? [grabbing.secure_media_embed.media_domain_url]
                    : []
                : [];
        return [...new Set([...metadata, ...previewImages, ...secure])];
    }

    function mergeMedia() {
        const merged = [...mediaMetadata, ...mediaPreviewImages, ...mediaCrossPost, ...secureMedia, ...textMedia];

        return [...new Set(merged.map((url) => {
            if(url.startsWith('https://external-i.redd.it')) {
                return url.split('?')[0].replace('external-i.redd.it', 'i.redd.it');
            } else if(url.startsWith('https://external-preview.redd.it')) {
                return url.split('?')[0].replace('external-preview.redd.it', 'i.redd.it');
            } else if (url.startsWith('https://preview.redd.it')) {
                return url.split('?')[0].replace('preview.redd.it', 'i.redd.it');
            } else if(url.startsWith('https://i.redd.it')) {
                return url.split('?')[0];
            } else if(
                url.endsWith('.jpg') ||
                url.endsWith('.png')
            ) {
                // Do nothing, don't log
            } else {
                console.log('Non-recognized URL in media metadata:', url);
            }
            return url;
        }))];
    }

    // UseEffect for click handling for <a> tags in <div> elements (I hate react)
    useEffect(() => {
        const handleClick = (event) => {
            const target = event.target;
            if (target.classList.contains("findableImage")) {
                const link = target.getAttribute("data-link");
                
                for(let i = 0; i < media.length; i++) {
                    if(media[i] === link) {
                        setImageIndex(i);
                        break;
                    }
                }
            }
        };

        document.addEventListener("click", handleClick);
        return () => {
            document.removeEventListener("click", handleClick);
        };
    }, []);

    function prevImage() {
        setImageIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1));
    }

    function nextImage() {
        setImageIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1));
    }

    // Memoize the image selector to avoid re-rendering on every state change
    const imageSelectors = useMemo(() => (
        media.map((_, index) => (
            <a 
                key={index}
                className="post-imageselector-chooser clickable" 
                style={{backgroundColor: (index === imageIndex ? '#30e8ff' : 'white')}}
                onClick={() => setImageIndex(index)} 
            />
        ))
    ), [media.length, imageIndex]);

    const currentMedia = media[imageIndex];

    return (media.length !== 0 &&
        <div className="post-images">
            <div className="post-imagescontainer">
                {media.length > 1 && (
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
