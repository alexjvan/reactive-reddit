import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import PriorityQueue from './app/PriorityQueue.js';
import Grabber from './app/grabber/Grabber.js';
import { getFromStorage, putInStorage } from './app/storage/storage.js';
import { emptyValidation, padSubs, postValidation, reduceFilters, resumeRetrieval, shrinkPosts } from './app/storage/validators.js';
import Body from './body/Body.js';
import ExtraContent from './extra-content/ExtraContent.js';
import Foot from './footer/Foot.js';
import Head from './header/Head.js';

export default function App() {
  const dontGrabMinutes = 15;

  const [postQueue,] = useState(new PriorityQueue());
  const [postQueueHasData, setPostQueueHasData] = useState(false);
  
  // TODO: Groups
  const [subs, setSubs] = useState(() => getFromStorage('subs', [], resumeRetrieval, postQueue, setPostQueueHasData));
  const [filters, setFilters] = useState(() => getFromStorage('filters', [], emptyValidation));
  const [minimizedUsers, setMinimizedUsers] = useState(() => getFromStorage('minUsers', [], emptyValidation))
  const [posts, setPosts] = useState(() => getFromStorage('posts', [], postValidation, subs, filters));
  const grabber = useRef();

  const [extraDisplay, setExtraDisplay] = useState(null);

  // Save Objs
  useEffect(
    () => putInStorage('subs', padSubs(subs, posts)),
    [subs]
  );
  // TODO: Create some way to not constantly be updating this during retrieval
  //    Either listen to setPostQueueHasData (better approach, needs error code handling to be done first)
  //    or maybe check value against value 1 second ago. If different, don't set
  //      this runs into issue with multiple firing off, how do you garuntee that any of them will catch it
  useEffect(
    () => putInStorage('posts', shrinkPosts(posts)),
    [posts]
  );
  useEffect(
    () => putInStorage('filters', reduceFilters(filters)),
    [filters]
  );
  useEffect(
    () => putInStorage('minUsers', minimizedUsers),
    [minimizedUsers]
  );

  // Update grabber
  useEffect(() => {
    grabber.current = new Grabber(
      subs, 
      setSubs, 
      posts, 
      setPosts, 
      postQueue, 
      setPostQueueHasData, 
      filters
    );
  }, []);
  useEffect(() => {
    if (grabber.current) {
      grabber.current.subs = subs;
      grabber.current.posts = posts;
      grabber.current.filters = filters;
    }
  }, [subs, posts, filters]);

  // Run search
  useEffect(
    () => {
      if (!postQueue.isEmpty()) {
        grabber.current.grabLoop();
      }
    },
    [postQueueHasData]
  );
  useEffect(() => {
    setInterval(function () {
      if (postQueue.isEmpty()) {
        let early = new Date();
        early.setMinutes(early.getMinutes() - dontGrabMinutes);
        let earlyepoch = Math.floor(early / 1000);

        subs.forEach((sub) => {
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

        setPostQueueHasData(true);
      } else {
        grabber.current.grabLoop();
      }
    }, 15 * 60 * 1000) // Every 15m
    // TODO: Configure this time in settings (requires settings)
  }, []);

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
        setExtraDisplay={setExtraDisplay}
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
