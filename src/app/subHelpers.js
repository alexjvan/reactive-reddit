import { randSixHash } from "./colors";

export function newSubWithName(name) {
    let newSub = {};
    
    newSub.name = name;
    newSub.color = randSixHash();
    newSub.ba = {};
    newSub.ba.beforet3 = undefined;
    newSub.ba.beforeutc = undefined;
    newSub.ba.aftert3 = undefined;
    newSub.ba.afterutc = undefined;
    newSub.reachedEnd = false;

    return newSub;
}

export function getSub(subs, name) {
    for (let i = 0; i < subs.length; i++) {
        if (subs[i].name === name) return subs[i];
    }
    return undefined;
}