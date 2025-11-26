import { useState } from 'react';

export default function ValidatedImage({
    src,
    alt,
    callback
}) {
    const [isValid, setIsValid] = useState(true);

    const handleLoad = (e) => {
        const img = e.target;
        if (img.naturalWidth === 130 && img.naturalHeight === 60) {
            setIsValid(false);
            callback();
        }
    };

    return isValid &&
        <img
            className="post-displayimage"
            src={src}
            alt={alt}
            onLoad={handleLoad}
            onError={() => setIsValid(false)}
            loading="lazy"
        />;
}