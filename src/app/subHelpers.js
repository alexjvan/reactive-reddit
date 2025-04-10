export function getSub(subs, name) {
    for (let i = 0; i < subs.length; i++) {
        if (subs[i].name === name) return subs[i];
    }
    return undefined;
}