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

  const [groups, setGroups] = useState(() => getFromStorage('', 'groups', [{name: 'Default', active: true}], emptyValidation));
  const [activeGroup, setActiveGroup] = useState(null);

  const [subs, setSubs] = useState(() => getFromStorage(activeGroup, 'subs', [], resumeRetrieval, postQueue, setPostQueueHasData));
  const [filters, setFilters] = useState(() => getFromStorage(activeGroup, 'filters', [], emptyValidation));
  const [minimizedUsers, setMinimizedUsers] = useState(() => getFromStorage(activeGroup, 'minUsers', [], emptyValidation))
  const [posts, setPosts] = useState(() => getFromStorage(activeGroup, 'posts', [], postValidation, subs, filters));
  const grabber = useRef();

  const [extraDisplay, setExtraDisplay] = useState(null);

  // Load objs off group
  useEffect(
    () => {
      groups.forEach((group) => {
        if(group.active) {
          setActiveGroup(group.name);
        }
      });
    },
    [groups]
  );
  // Set group-data
  // Shouldn't need to re-save, since everything is saved automatically
  useEffect(
    () => {
      setSubs(getFromStorage(activeGroup, 'subs', [], resumeRetrieval, postQueue, setPostQueueHasData));
      setFilters(getFromStorage(activeGroup, 'filters', [], emptyValidation));
      setMinimizedUsers(getFromStorage(activeGroup, 'minUsers', [], emptyValidation))
      setPosts(getFromStorage(activeGroup, 'posts', [], postValidation, subs, filters));
    },
    [activeGroup]
  );

  // Save Objs
  useEffect(
    () => putInStorage('', 'groups', groups),
    [groups]
  )
  useEffect(
    () => putInStorage(activeGroup, 'subs', padSubs(subs, posts)),
    [subs]
  );
  // TODO: Create some way to not constantly be updating this during retrieval
  //    Either listen to setPostQueueHasData (better approach, needs error code handling to be done first)
  //    or maybe check value against value 1 second ago. If different, don't set
  //      this runs into issue with multiple firing off, how do you garuntee that any of them will catch it
  useEffect(
    () => putInStorage(activeGroup, 'posts', shrinkPosts(posts)),
    [posts]
  );
  useEffect(
    () => putInStorage(activeGroup, 'filters', reduceFilters(filters)),
    [filters]
  );
  useEffect(
    () => putInStorage(activeGroup, 'minUsers', minimizedUsers),
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
  }, [activeGroup, subs, posts, filters]);
  useEffect(() => {
    postQueue.clear();
    setPostQueueHasData(false); // This /should/ help with switching to/from groups

    if(subs.length > 0) {
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
    }
  }, [activeGroup]);

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
        groups={groups}
        setGroups={setGroups}
        activeGroup={activeGroup}
        setActiveGroup={setActiveGroup}
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
