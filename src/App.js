import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import PriorityQueue from './app/PriorityQueue.js';
import usePrevious from './app/usePrevious.js';
import Grabber from './app/grabber/Grabber.js';
import { getFromStorage, putInStorage } from './app/storage/storage.js';
import { emptyValidation, padSubs, postValidation, reduceFilters, resumeRetrieval, shrinkPosts } from './app/storage/validators.js';
import Body from './body/Body.js';
import ExtraContent from './extra-content/ExtraContent.js';
import Foot from './footer/Foot.js';
import Head from './header/Head.js';

// TODO: Save snapshot of storage to disk
// TODO: Create way to load-from initial load-state
export default function App() {
  // Static Vars
  const defaultSetting = {
    grabIntervalInMinutes: 15,
    postTypes: 'all',
    retrieveOnSubAddition: false,
    waitBeforeReGrabbingInMinutes: 15
  }; // TODO

  // Class Obj variables
  const [postQueue,] = useState(new PriorityQueue());
  const [postQueueHasData, setPostQueueHasData] = useState(false);
  const [extraDisplay, setExtraDisplay] = useState(null);

  // Load from Storage on init
  // TODO: Lots of empty validations here. I should add some
  const [settings, setSettings] = useState(() => getFromStorage('', 'settings', defaultSetting, emptyValidation))
  const [groups, setGroups] = useState(() => getFromStorage('', 'groups', [{ name: 'Default', active: true }], emptyValidation));
  const [activeGroup, setActiveGroup] = useState(null);
  const previousActiveGroup = usePrevious(activeGroup);

  // Round 2 grabs
  const [subs, setSubs] = useState(undefined);
  const [filters, setFilters] = useState(undefined);
  const [minimizedUsers, setMinimizedUsers] = useState(undefined);
  const [posts, setPosts] = useState(undefined);
  const grabber = useRef();

  // Load objs off group
  useEffect(
    () => {
      groups.forEach((group) => {
        if (group.active) {
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
      if (!activeGroup) return;

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
  );
  useEffect(
    () => {
      if (subs) {
        putInStorage(activeGroup, 'subs', padSubs(subs, posts));
      }
    },
    [subs]
  );
  // TODO: Create some way to not constantly be updating this during retrieval
  //    Either listen to setPostQueueHasData (better approach, needs error code handling to be done first)
  //    or maybe check value against value 1 second ago. If different, don't set
  //      this runs into issue with multiple firing off, how do you garuntee that any of them will catch it
  useEffect(
    () => {
      if (posts && posts.length > 0) {
        putInStorage(activeGroup, 'posts', shrinkPosts(posts))
      }
    },
    [posts]
  );
  useEffect(
    () => {
      if (filters && filters.length > 0) {
        putInStorage(activeGroup, 'filters', reduceFilters(filters))
      }
    },
    [filters]
  );
  useEffect(
    () => {
      if (minimizedUsers && minimizedUsers.length > 0) {
        putInStorage(activeGroup, 'minUsers', minimizedUsers)
      }
    },
    [minimizedUsers]
  );

  // Update grabber
  useEffect(() => {
    if (grabber.current) {
      grabber.current.subs = subs;
      grabber.current.posts = posts;
      grabber.current.filters = filters;
    } else if (subs !== undefined && posts !== undefined && filters !== undefined) {
      // TODO: This might be a good place to populate the postQueue
      grabber.current = new Grabber(
        subs,
        setSubs,
        posts,
        setPosts,
        postQueue,
        setPostQueueHasData,
        filters
      );
    }
  }, [subs, posts, filters]);
  // Update postQueue on group switch
  useEffect(() => {
    // TODO: I am too exhausted to think straight
    //    This code here is causing problems. Whats happening is on first load, this is supposed to load the queue data. However, that queue data doesn't exist when activeGroup is set.
    //    Even if, the previousActiveGroup stuff is throwing off since we discard first run. 
    //    In reality, we need something that waits until all 3 are properly set, because its the same problem when switching groups
    // Discard race conditions on-load
    if (previousActiveGroup === null || previousActiveGroup === undefined) {
      return;
    }

    postQueue.clear();
    setPostQueueHasData(false); // This /should/ help with switching to/from groups

    if ((subs ? subs : []).length > 0) {
      let early = new Date();
      early.setMinutes(early.getMinutes() - settings.waitBeforeReGrabbingInMinutes);
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
  // Timer for search calls

  const [postInterval, setPostInterval] = useState(undefined);
  useEffect(() => {
    if (postInterval) return;

    var interval = setInterval(function () {
      if (postQueue.isEmpty()) {
        let early = new Date();
        early.setMinutes(early.getMinutes() - settings.waitBeforeReGrabbingInMinutes);
        let earlyepoch = Math.floor(early / 1000);

        (subs ? subs : []).forEach((sub) => {
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
    }, settings.grabIntervalInMinutes * 60 * 1000);

    setPostInterval(interval);
  }, []);

  return <>
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
      posts={posts}
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
      setPosts={setPosts}
    />
  </>;
}
