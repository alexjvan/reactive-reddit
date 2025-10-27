import { useEffect, useRef, useState } from 'react';
import './App.css';
import { 
  DefaultGroups, 
  DefaultSettings,
  GrabberCategoryGroups,
  GrabberCategoryFilters,
  GrabberCategoryImageCache,
  GrabberCategoryMinUsers,
  GrabberCategoryPosts,
  GrabberCategorySettings,
  GrabberCategorySubs,
  GrabberCategoryUsersSubs
} from './app/constants.js';
import PriorityQueue from './app/grabber/PriorityQueue.js';
import usePrevious from './app/usePrevious.js';
import Grabber from './app/grabber/Grabber.js';
import UserRetriever from './app/grabber/UserRetriever.js';
import { getFromStorage, putInStorage } from './app/storage/storage.js';
import {
  emptyValidation,
  mapConverter,
  padSubs,
  postValidation,
  reduceFilters,
  resumeRetrieval,
  settingsValidation,
  shrinkPosts
} from './app/storage/validators.js';
import Body from './body/Body.js';
import ExtraContent from './extra-content/ExtraContent.js';
import Foot from './footer/Foot.js';
import Head from './header/Head.js';

// TODO: Save snapshot of storage to disk
// TODO: Create way to load-from initial load-state
//    Requires snapshotting storage to disk
// TODO: Tooltips, how to use the app, help page
export default function App() {
  // Class Obj variables
  const [postQueue,] = useState(new PriorityQueue());
  const [postQueueHasData, setPostQueueHasData] = useState(false);
  const [extraDisplay, setExtraDisplay] = useState(null);

  // Load from Storage on init
  const [settings, setSettings] = useState(() => getFromStorage('', GrabberCategorySettings, DefaultSettings, settingsValidation));
  const [groups, setGroups] = useState(() => getFromStorage('', GrabberCategoryGroups, DefaultGroups, emptyValidation));
  const [imageCache, setImageCache] = useState(() => getFromStorage('', GrabberCategoryImageCache, new Map(), mapConverter));
  const [usersSubs, setUsersSubs] = useState(() => getFromStorage('', GrabberCategoryUsersSubs, [], emptyValidation));
  const [activeGroup, setActiveGroup] = useState(null);
  const previousActiveGroup = usePrevious(activeGroup);

  // Round 2 grabs
  const [subs, setSubs] = useState(undefined);
  const [filters, setFilters] = useState(undefined);
  const [minimizedUsers, setMinimizedUsers] = useState(undefined);
  const [posts, setPosts] = useState(undefined);
  const grabber = useRef();
  const userRetriever = useRef();

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

      setSubs(getFromStorage(activeGroup, GrabberCategorySubs, [], resumeRetrieval, postQueue, setPostQueueHasData));
      setFilters(getFromStorage(activeGroup, GrabberCategoryFilters, [], emptyValidation));
      setMinimizedUsers(getFromStorage(activeGroup, GrabberCategoryMinUsers, [], emptyValidation))
      setPosts(getFromStorage(activeGroup, GrabberCategoryPosts, [], postValidation, subs, filters));
    },
    [activeGroup]
  );

  // Save Objs
  useEffect(
    () => putInStorage('', GrabberCategorySettings, settings),
    [settings]
  );
  useEffect(
    () => putInStorage('', GrabberCategoryGroups, groups),
    [groups]
  );
  useEffect(
    () => {
      // TODO: Limit by media items in posts
      putInStorage('', GrabberCategoryImageCache, imageCache)
    },
    [imageCache]
  );
  useEffect(
    () => {
      // TODO: Limit by active users
      putInStorage('', GrabberCategoryUsersSubs, usersSubs)
    },
    [usersSubs]
  );
  useEffect(
    () => {
      if (subs) {
        putInStorage(activeGroup, GrabberCategorySubs, padSubs(subs, posts));
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
        putInStorage(activeGroup, GrabberCategoryPosts, shrinkPosts(posts))
      }
    },
    [posts]
  );
  useEffect(
    () => {
      if (filters && filters.length > 0) {
        putInStorage(activeGroup, GrabberCategoryFilters, reduceFilters(filters))
      }
    },
    [filters]
  );
  useEffect(
    () => {
      if (minimizedUsers && minimizedUsers.length > 0) {
        putInStorage(activeGroup, GrabberCategoryMinUsers, minimizedUsers)
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
      grabber.current = new Grabber(
        settings,
        subs,
        setSubs,
        posts,
        setPosts,
        postQueue,
        setPostQueueHasData,
        filters,
        setFilters
      );
    }
  }, [subs, posts, filters]);
  // Update UserRetriever
  useEffect(() => {
    if (userRetriever.current) {
      userRetriever.current.posts = posts;
      userRetriever.current.usersSubs = usersSubs;
    } else if (posts !== undefined && usersSubs !== undefined) {
      userRetriever.current = new UserRetriever(
        settings,
        posts,
        usersSubs,
        setUsersSubs
      );
    }
  }, [posts, usersSubs]);
  // Update postQueue on group switch
  useEffect(() => {
    // Discard race conditions on-load
    if (previousActiveGroup === null || previousActiveGroup === undefined) {
      return;
    }

    postQueue.clear();
    setPostQueueHasData(false); // This /should/ help with switching to/from groups

    if ((subs ?? []).length > 0) {
      enqueueSubs();
    }
  }, [activeGroup]);

  // Run search
  useEffect(
    () => {
      if (postQueueHasData && !postQueue.isEmpty()) {
        grabber.current.grabLoop();
      }
    },
    [postQueueHasData]
  );

  // Timer for search calls
  const [postInterval, setPostInterval] = useState(undefined);
  useEffect(() => {
    if (postInterval) {
      clearInterval(postInterval);
    }

    var newInterval = setInterval(function () {
      if (postQueue.isEmpty()) {
        enqueueSubs();
      } else {
        grabber.current.grabLoop();
      }
    }, settings.grabIntervalInMinutes * 60 * 1000);

    setPostInterval(newInterval);
  }, [settings.grabIntervalInMinutes, subs]);

  function enqueueSubs() {
    let early = new Date();
    early.setMinutes(early.getMinutes() - settings.waitBeforeReGrabbingInMinutes);
    let earlyepoch = Math.floor(early / 1000);

    (subs ?? []).forEach((sub) => {
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

  // Run user retrieval after posts have all been grabbed
  useEffect(
    () => {
      if(userRetriever.current && !postQueueHasData) {
        userRetriever.current.grabLoop();
      }
    },
    [postQueueHasData]
  );

  return <>
    <Head
      settings={settings}
      setSettings={setSettings}
      groups={groups}
      setGroups={setGroups}
      activeGroup={activeGroup}
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
      settings={settings}
      imageCache={imageCache}
      setImageCache={setImageCache}
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
      postQueue={postQueue}
      settings={settings}
      setSettings={setSettings}
      extraDisplay={extraDisplay}
      setExtraDisplay={setExtraDisplay}
      groups={groups}
      setGroups={setGroups}
      activeGroup={activeGroup}
      subs={subs}
      setSubs={setSubs}
      filters={filters}
      setFilters={setFilters}
      posts={posts}
      setPosts={setPosts}
      usersSubs={usersSubs}
      setMinimizedUsers={setMinimizedUsers}
    />
  </>;
}
