/* eslint-env worker */

import { isImageLink } from "../postHelpers/imageHelpers";

onmessage = async (e) => {
    const { username, t3, media } = e.data;

    let returning = [];
    let seenHashes = [];

    await Promise.all(
        media.map(async (m) => {
            if (!isImageLink(m)) {
                returning.push(m);
                return;
            }

            const hash = await hashImage(m);

            if (!seenHashes.has(hash)) {
                seenHashes.add(hash);
                returning.push(m);
            }
        })
    );

    postMessage({
        username: username,
        t3: t3,
        media: returning
    });
}

async function hashImage(url) {
    const res = await fetch(url);
    const buffer = await res.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);

    return [...new Uint8Array(hashBuffer)]
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
}