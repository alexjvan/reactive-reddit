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

export function enqueueSubs(settings, postQueue, subs, setPostQueueHasData) {
    let early = new Date();
    early.setMinutes(early.getMinutes() - settings.waitBeforeReGrabbingInMinutes);
    let earlyepoch = Math.floor(early / 1000);

    (subs ?? []).forEach(sub => {
      if (!sub.reachedEnd) {
        postQueue.enqueue({
          sub: sub.name,
          ba: sub.ba.aftert3,
          pre: false
        }, 1);
      }

      if (sub.ba.beforeutc !== undefined && sub.ba.beforeutc < earlyepoch) {
        postQueue.enqueue({
          sub: sub.name,
          ba: sub.ba.beforet3,
          iterations: 0,
          pre: true
        }, 2);
      }
    });

    if ((subs ?? []).length > 0) {
      setPostQueueHasData(true);
    }
  }