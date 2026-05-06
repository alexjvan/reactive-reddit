import { useEffect, useMemo, useRef, useState } from 'react';
import './MediaContainer.css';
import './ValidatedImage.js';
import { isImageLink, isVideoLink, removeDuplicates } from '../../../app/postHelpers/imageHelpers';
import { ImageDuplicateState } from './ImageDuplicateState.js';
import ValidatedImage from './ValidatedImage.js';

export default function MediaContainer({
    t3,
    username,
    processedMedia,
    fromPopOut,
    startIndex,
    setProcessedUsers,
    setPopOutMedia,
    imageDuplicateState,
    setImageDuplicateState
}) {
    const [imageIndex, setImageIndex] = useState(startIndex ?? 0);
    const containerRef = useRef(null);

    let displaying = (processedMedia ?? []);

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

    useEffect(() =>{
        switch(imageDuplicateState) {
            case ImageDuplicateState.NOT_AVAILABLE:
                if(displaying.length > 1) {
                    setImageDuplicateState(ImageDuplicateState.AVAILABLE);
                }
                break;
            case ImageDuplicateState.AVAILABLE:
                if(displaying.length < 2) {
                    setImageDuplicateState(ImageDuplicateState.NOT_AVAILABLE);
                }
                break;
            case ImageDuplicateState.PERFORM_CHECK:
                setImageDuplicateState(ImageDuplicateState.CHECKING);
                console.log("Running check on old= " + displaying.length);
                duplicateCheck();
                break;
        }
    }, [displaying, imageDuplicateState]);

    async function duplicateCheck() {
        var filtered = await removeDuplicates(displaying);
        console.log("check done, new= " + filtered.length);
        setProcessedUsers(current => current.map(u => {
            if (u.username !== username) return u;
            return {
                ...u,
                posts: u.posts.map(p => {
                    if (p.t3 !== t3) return p;
                    return {
                        ...p,
                        media: filtered
                    };
                })
            }
        }));
        setImageDuplicateState(ImageDuplicateState.AVAILABLE);
    }

    function prevImage() {
        setImageIndex(prev => (prev === 0 ? displaying.length - 1 : prev - 1));
    }

    function nextImage() {
        setImageIndex(prev => (prev === displaying.length - 1 ? 0 : prev + 1));
    }

    function removeImage(url) {
        setProcessedUsers(current => current.map(u => {
            if (u.username !== username) return u;
            return {
                ...u,
                posts: u.posts.map(p => {
                    if (p.t3 !== t3) return p;

                    return {
                        ...p,
                        media: (p.media || []).filter(m => m !== url)
                    };
                })
            }
        }));
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

    let currentDisplay =
        isImageLink(currentMedia)
            ? <ValidatedImage
                key={currentMedia} // For some reason the key as the index doesn't trigger a reload? But the url does
                src={currentMedia}
                alt={`Media item ${imageIndex + 1}`}
                fromPopOut={fromPopOut}
                callback={() => removeImage(currentMedia)}
            />
            : isVideoLink(currentMedia)
                ? <video
                    key={currentMedia}
                    className={`post-displayvideo ${fromPopOut ? "popout" : ""}`}
                    src={currentMedia}
                    loading="lazy"
                    controls
                />
                : null

    return (displaying.length !== 0 &&
        <div className="post-images" ref={containerRef}>
            <div className="post-imagescontainer">
                {displaying.length > 1 &&
                    <button className="post-prevImage" onClick={prevImage}>
                        &lt;
                    </button>
                }
                {fromPopOut
                    ? currentDisplay
                    : <a className="post-mediawrapper" onClick={() => setPopOutMedia({
                        t3: t3,
                        username: username,
                        processedMedia: processedMedia,
                        currentIndex: imageIndex
                    })}>
                        {currentDisplay}
                    </a>
                }
                {displaying.length > 1 &&
                    <button className="post-nextImage" onClick={nextImage}>
                        &gt;
                    </button>
                }
            </div>
            <div className="post-imageselector">
                {imageSelectors}
            </div>
        </div>
    );
}
