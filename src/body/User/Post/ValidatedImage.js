import { useState } from 'react';

export default function ValidatedImage({
    src,
    alt,
    fromPopOut,
    callback
}) {
    const [isValid, setIsValid] = useState(true);

    const handleLoad = (e) => {
        const img = e.target;
        if (img.naturalWidth === 130 && img.naturalHeight === 60) {
            invalidate();
        }
    };

    function invalidate() {
        setIsValid(false);
        callback();
    }

    return isValid &&
        <img
            className={`post-displayimage ${fromPopOut ? "popout" : ""}`}
            src={src}
            alt={alt}
            onLoad={handleLoad}
            onError={() => invalidate()}
        />;
}