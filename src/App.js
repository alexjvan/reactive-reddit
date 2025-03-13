import React, { useEffect, useState } from 'react';
import './App.css';
import { randSixHash } from './app/colors.js';
import { filterCheck } from './app/filters.js';
import PriorityQueue from './app/PriorityQueue.js';
import { getFromStorage, putInStorage } from './app/storage.js';
import { cleanPost } from './app/grabber/postFunctions.js';
import Body from './body/Body.js';
import ExtraContent from './extra-content/ExtraContent.js';
import Foot from './footer/Foot.js';
import Head from './header/Head.js';

export default function App() {

  const dontGrabMinutes = 15;

  const [postQueue, setPostQueue] = useState(new PriorityQueue());
  const [postQueueHasData, setPostQueueHasData] = useState(false);
  const [subs, setSubs] = useState(() => getFromStorage('subs', [], resumeRetrieval));
  const [filters, setFilters] = useState(() => getFromStorage('filters', [], emptyValidation));
  const [minimizedUsers, setMinimizedUsers] = useState(() => getFromStorage('minUsers', [], emptyValidation))
  const [posts, setPosts] = useState(() => getFromStorage('posts', [], postValidation));

  const [extraDisplay, setExtraDisplay] = useState(null);

  function resumeRetrieval(data, fallback) {
    let included = [];
    let returning = data.map((sub) => {
      if(included.includes(sub.name)) {
        return undefined;
      }
      if(sub.color === undefined) sub.color = randSixHash();
      if(sub.grabbing) sub.grabbing = false;

      included.push(sub.name);

      return sub;
    });

    let sorted = returning
      .filter((s) => s !== undefined)
      // Prioritize searching for more frequently used subs
      .sort((a, b) => (b.postCount ? b.postCount : 0) - (a.postCount ? a.postCount : 0));

    // To cut back on number of calls, don't re-request if retrieved in the last x minutes
    let early = new Date();
    early.setMinutes(early.getMinutes() - dontGrabMinutes);
    let earlyepoch = Math.floor(early / 1000);

    sorted.forEach((sub) => {
      if(!sub.reachedEnd) {
        postQueue.enqueue({
          sub: sub.name,
          ba: sub.ba.aftert3,
          pre: false
        }, 1);
      }
      if(sub.ba.beforeutc !== undefined && sub.ba.beforeutc < earlyepoch) {
        postQueue.enqueue({
          sub: sub.name,
          ba: sub.ba.beforet3,
          iterations: 0,
          pre: true
        }, 2);
      }
    });

    setPostQueueHasData(true);

    return sorted;
  }

  function postValidation(data, fallback) {
    return data.map((post) => {
      if(post.selftext_html !== undefined) delete post.selftext_html;
      if(post.color === undefined) post.color = getSub(post.subreddit).color;
      if(post.duplicates === undefined) post.duplicates = 0;
      let filteredFor = filters.find((filter) => filterCheck(filter, post));
      post.filteredFor = [filteredFor].filter((x) => x !== undefined);
      cleanPost(post);
      return post;
    });
  }

  function emptyValidation(data, fallback) {
    return data;
  }

  // Save Objs
  useEffect(
    () => putInStorage('subs', padSubs(subs)),
    [subs]
  );
  useEffect(
    () => putInStorage('posts', shrinkPosts(posts)),
    [posts]
  );
  useEffect(
    () => putInStorage('filters', filters),
    [filters]
  );
  useEffect(
    () => putInStorage('minUsers', minimizedUsers),
    [minimizedUsers]
  );

  function padSubs(subs) {
    return subs.map((sub) => {
      let returning = sub;
      returning.postCount = posts.filter((p) => p.subreddit === sub.name).length;
      return returning;
    })
  }

  function shrinkPosts(posts) {
    return posts
      .filter((post) => !post.disabled && post.filteredFor.length === 0);
  }

  function reduceFilters(filters) {
    // TODO: Remove duplicate filters, filters in filters
    //    ex: Filter "Hotdog" not needed if "Dog" also exists
    // TODO: Sort by Category: Tag, Author, Title, Text, Text||Title
  }

  // Run search
  useEffect(
    () => {
      if(!postQueue.isEmpty()) {
        grabLoop();
      }
    },
    [postQueueHasData]
  );
  useEffect(() => {
    setInterval(function() {
      if(postQueue.isEmpty()) {
          let early = new Date();
          early.setMinutes(early.getMinutes() - dontGrabMinutes);
          let earlyepoch = Math.floor(early / 1000);

          subs.forEach((sub) => {
            if(!sub.reachedEnd) {
              postQueue.enqueue({
                sub: sub.name,
                ba: sub.ba.aftert3,
                pre: false
              }, 1);
            }
            if(sub.ba.beforeutc !== undefined && sub.ba.beforeutc < earlyepoch) {
              postQueue.enqueue({
                sub: sub.name,
                ba: sub.ba.beforet3,
                iterations: 0,
                pre: true
              }, 2);
            }
          });
      }
      grabLoop();
    }, 15 * 60 * 1000) // Every 15m
  }, []);

  function grabLoop() {
    setTimeout(() => {
      let next = postQueue.dequeue();

      if(next === undefined || next === null) return;

      if(next.pre === true) {
        preRetrieveLoop(next.sub, next.ba, next.iterations);
      } else if(next.savior === true) {
        saviorLoop(next.sub, next.ba);
      } else {
        retrieveLoop(next.sub, next.ba);
      }
    }, 250);
  }

  // TODO: Move each grabber to their own file
  function preRetrieveLoop(sub, post, iterations) {
    let url = 'https://api.reddit.com/r/'+sub+'/new.json' + (post !== undefined ? '?before=' + post : '');

    fetch(url)
      .then(resp => resp.json())
      .then(json => preprocessData(sub, json, iterations))
      .catch(error => console.log(error));
  }

  function preprocessData(sub, data, iterations) {
    let setting = getSub(sub);
    if(data.data === undefined || 
      data.data.children === undefined || 
      data.data.children.length === 0) {

      if(iterations === 0) {
        let prev = new Date(setting.ba.beforeutc);
        let now = new Date();
        let timeDifference = now.getTime() - prev.getTime();
        let dayDifference = Math.round(timeDifference / 86400000);
        if(dayDifference >= 3) {
          console.log("No data returned. Attempting savior for: " + sub);
          saviorLoop(sub);
        }
      } else {
        finishRetrieval(setting, "No data returned.", false);
        return;
      }
    }
    let retrievedPosts = data.data.children;
    let before = data.data.before;

    let processed = retrievedPosts
      .filter((post) => post.data.created_utc > setting.ba.beforeutc)
      .map((post) => {
        let returning = post.data;
        cleanPost(returning);
        returning.disabled = false;
        returning.duplicates = 0;
        returning.color = setting.color;
        let applicableFilters = filters.find((filter) => filterCheck(filter, returning));
        returning.filteredFor = [applicableFilters].filter((x) => x !== undefined);
        return returning;
      });

    // Looping sub
    if(setting.ba.beforeutc !== undefined) {
      processed = processed.filter((post) => post.created_utc > setting.ba.beforeutc);
    }
    if(processed.length === 0) {
      finishRetrieval(setting, "0 posts, assuming loop.", false);
      return;
    }

    setPosts((previous) => [
      ...previous,
      ...processed
    ]);

    setting.ba.beforeutc = processed[0].created_utc;
    setting.ba.beforet3 = processed[0].name;

    // End conditions
    if(before === undefined || before === null) {
      finishRetrieval(setting, "No more before.", false);
      return;
    }

    postQueue.enqueue({
      sub: sub,
      ba: before,
      iterations: iterations + 1,
      pre: true
    }, 2);
    grabLoop();
  }

  function saviorLoop(sub, post) {
    let url = 'https://api.reddit.com/r/'+sub+'/new.json' + (post !== undefined ? '?after=' + post : '');

    fetch(url)
      .then(resp => resp.json())
      .then(json => processSavior(sub, json))
      .catch(error => console.log(error));
  }

  function processSavior(sub, data) {
    let setting = getSub(sub);
    if(data.data === undefined || 
      data.data.children === undefined || 
      data.data.children.length === 0) {
      finishRetrieval(setting, "No data returned.", true);
      return;
    }
    let retrievedPosts = data.data.children;
    let after = data.data.after;

    let processed = retrievedPosts
      .filter((post) => post.data.created_utc > setting.ba.beforeutc)
      .map((post) => {
        let returning = post.data;
        cleanPost(returning);
        returning.disabled = false;
        returning.duplicates = 0;
        returning.color = setting.color;
        let applicableFilters = filters.find((filter) => filterCheck(filter, returning));
        returning.filteredFor = [applicableFilters].filter((x) => x !== undefined);
        return returning;
      });

    // Looping sub
    if(processed.length === 0) {
      finishRetrieval(setting, "0 posts, finished savior.", false);
      return;
    }

    setPosts((previous) => [
      ...previous,
      ...processed
    ]);

    // Only for the first
    //  Reset after to grab anything missed
    if(processed[0].created_utc > setting.ba.beforeutc) {
      setting.ba.beforeutc = processed[0].created_utc;
      setting.ba.beforet3 = processed[0].name;
      setting.ba.afterutc = processed[processed.length - 1].created_utc;
      setting.ba.aftert3 = processed[processed.length - 1].name;
      setting.reachedEnd = false;
    }

    if(after === undefined || after === null) {
      finishRetrieval(setting, "No more after.", true);
      return;
    }

    postQueue.enqueue({
      sub: sub,
      ba: after,
      savior: true
    }, 1);
    grabLoop();
  }

  function retrieveLoop(sub, post) {
    let url = 'https://api.reddit.com/r/'+sub+'/new.json' + (post !== undefined ? '?after=' + post : '');

    fetch(url)
      .then(resp => resp.json())
      .then(json => processData(sub, json))
      .catch(error => console.log(error));
  }

  function processData(sub, data) {
    let setting = getSub(sub);
    if(data.data === undefined || 
      data.data.children === undefined || 
      data.data.children.length === 0) {
      finishRetrieval(setting, "No data returned.", true);
      return;
    }
    let retrievedPosts = data.data.children;
    let after = data.data.after;

    let processed = retrievedPosts
      .map((post) => {
        let returning = post.data;
        cleanPost(returning);
        returning.disabled = false;
        returning.duplicates = 0;
        returning.color = setting.color;
        let applicableFilters = filters.find((filter) => filterCheck(filter, returning));
        returning.filteredFor = [applicableFilters].filter((x) => x !== undefined);
        return returning;
      });

    // Looping sub
    if(setting.ba.afterutc !== undefined) {
      processed = processed.filter((post) => post.created_utc < setting.ba.afterutc);
    }
    if(processed.length === 0) {
      finishRetrieval(setting, "0 posts, assuming loop.", true);
      return;
    }

    setPosts((previous) => [
      ...previous,
      ...processed
    ]);

    if(setting.ba.beforeutc === undefined) {
      setting.ba.beforeutc = processed[0].created_utc;
      setting.ba.beforet3 = processed[0].name;
    }
    setting.ba.afterutc = processed[processed.length - 1].created_utc;
    setting.ba.aftert3 = processed[processed.length - 1].name;

    if(after === undefined || after === null) {
      finishRetrieval(setting, "No more after.", true);
      return;
    }

    postQueue.enqueue({
      sub: sub,
      ba: after
    }, 1);
    grabLoop();
  }
  
  function finishRetrieval(sub, reason, setEnd) {
    console.log("-=-=-=-=-=-=-=-=-=-=-");
    console.log("Stopping Retrieval");
    console.log("Sub: " + sub.name);
    console.log("Reason: " + reason);
    console.log("-=-=-=-=-=-=-=-=-=-=-");
    if(setEnd === true) {
      setSubs((prev) => prev.map((csub) => {
        if(csub.name === sub.name) {
          csub.reachedEnd = true;
        }
        return csub;
      }));
    }
    grabLoop();
  }

  function getSub(name) {
    for(let i = 0; i < subs.length; i++) {
      if(subs[i].name === name) return subs[i];
    }
    return undefined;
  }

  return (
    <>
      <Head
        subs={subs}
        setSubs={setSubs}
        filters={filters}
        setFilters={setFilters}
        postQueue={postQueue}
        postQueueHasData={postQueueHasData}
        setPostQueueHasData={setPostQueueHasData}
        setPosts={setPosts}
      />
      <Body
        posts={posts}
        setPosts={setPosts}
        setFilters={setFilters}
        minimizedUsers={minimizedUsers}
        setMinimizedUsers={setMinimizedUsers}
      />
      <Foot
        setExtraDisplay = {setExtraDisplay} 
      />
      <ExtraContent
        extraDisplay={extraDisplay}
        setExtraDisplay={setExtraDisplay}
        subs={subs}
        setSubs={setSubs}
        filters={filters}
        setFilters={setFilters}
        posts={posts}
      />
    </>
  );
}
