import { useEffect, useRef, useState } from 'react';
import './App.css';
import {
  DefaultGroups,
  DefaultSaveData,
  DefaultSettings,
  GrabberCategoryDontRecommendSubs,
  GrabberCategoryGroups,
  GrabberCategoryFilters,
  GrabberCategoryPosts,
  GrabberCategoryProcessedUsers,
  GrabberCategorySaveData,
  GrabberCategorySettings,
  GrabberCategorySubs,
  GrabberCategoryUsersSubs
} from './app/constants.js';
import PriorityQueue from './app/grabber/PriorityQueue.js';
import { enqueueSubs } from './app/subHelpers.js';
import usePrevious from './app/usePrevious.js';
import Grabber from './app/grabber/Grabber.js';
import UserRetriever from './app/grabber/UserRetriever.js';
import { postIntake } from './app/postHelpers/postFunctions.js';
import { getFromStorage, putInStorage } from './app/storage/storage.js';
import {
  emptyValidation,
  padSubs,
  processedUsersValidation,
  reduceFilters,
  removeInactiveUsers,
  resumeRetrieval,
  saveDataRetrieval,
  saveDataStorage,
  settingsValidation,
  shrinkUsers
} from './app/storage/validators.js';
import Body from './body/Body.js';
import ExtraContent from './extra-content/ExtraContent.js';
import Foot from './footer/Foot.js';
import Head from './header/Head.js';
import PopOutMediaContainer from './pop-out-media/PopOutMediaContainer.js';

// TODO: Create way to load-from initial load-state
//    Requires snapshotting storage to disk
// TODO: "Storage Managed Items"
//    Automatically pulls/pushes items when updated, etc. Get rid of all this code in this file
export default function App() {
  // Class Obj variables
  const [postQueue,] = useState(new PriorityQueue());
  const [postQueueHasData, setPostQueueHasData] = useState(false);
  const [extraDisplay, setExtraDisplay] = useState(null);
  const [popoutMedia, setPopOutMedia] = useState(null);

  // Load from Storage on init
  const [settings, setSettings] = useState(() => getFromStorage('', GrabberCategorySettings, DefaultSettings, settingsValidation));
  const [saveData, setSaveData] = useState(() => getFromStorage('', GrabberCategorySaveData, saveDataRetrieval(DefaultSaveData), saveDataRetrieval))
  const [groups, setGroups] = useState(() => getFromStorage('', GrabberCategoryGroups, DefaultGroups, emptyValidation));
  const [usersSubs, setUsersSubs] = useState(() => getFromStorage('', GrabberCategoryUsersSubs, [], emptyValidation));
  const [activeGroup, setActiveGroup] = useState(null);
  const previousActiveGroup = usePrevious(activeGroup);

  // Round 2 grabs
  const [subs, setSubs] = useState(undefined);
  const [filters, setFilters] = useState(undefined);
  const [posts, setPosts] = useState(undefined);
  const [processedUsers, setProcessedUsers] = useState(undefined);
  const [dontRecommendSubs, setDontRecommendSubs] = useState(undefined);
  const grabber = useRef();
  const userRetriever = useRef();

  // Load objs off group
  useEffect(() => {
    groups.forEach(group => {
      if (group.active) {
        setActiveGroup(group.name);
      }
    });
  }, [groups]);
  // Set group-data
  // Shouldn't need to re-save, since everything is saved automatically
  useEffect(() => {
    if (!activeGroup) return;

    setSubs(getFromStorage(activeGroup, GrabberCategorySubs, [], resumeRetrieval, postQueue, setPostQueueHasData));
    setFilters(getFromStorage(activeGroup, GrabberCategoryFilters, [], emptyValidation));
    setProcessedUsers(getFromStorage(activeGroup, GrabberCategoryProcessedUsers, [], processedUsersValidation, settings, filters));
    setPosts(getFromStorage(activeGroup, GrabberCategoryPosts, [], emptyValidation));
    setDontRecommendSubs(getFromStorage(activeGroup, GrabberCategoryDontRecommendSubs, [], emptyValidation));
  }, [activeGroup]);

  // Save Objs
  useEffect(() => putInStorage('', GrabberCategorySettings, settings), [settings]);
  useEffect(() => putInStorage('', GrabberCategorySaveData, saveDataStorage(saveData)), [saveData]);
  useEffect(() => putInStorage('', GrabberCategoryGroups, groups), [groups]);
  useEffect(() => {
    const timer = setTimeout(() => {
      putInStorage('', GrabberCategoryUsersSubs, removeInactiveUsers(usersSubs, processedUsers));
    }, 1000);

    return () => clearTimeout(timer);
  }, [usersSubs]);
  useEffect(() => {
    if (subs) {
      putInStorage(activeGroup, GrabberCategorySubs, padSubs(subs, posts));
    }
  }, [activeGroup, subs]);

  // I didn't realize how slow queue processing was - will save this until I transition to full post processing
  useEffect(() => {
    if (posts) {
      const timer = setTimeout(() => {
        putInStorage(activeGroup, GrabberCategoryPosts, posts);
      }, 1250);

      return () => clearTimeout(timer);
    }
  }, [activeGroup, posts]);
  useEffect(() => {
    if (processedUsers) {
      const timer = setTimeout(() => {
        putInStorage(activeGroup, GrabberCategoryProcessedUsers, shrinkUsers(processedUsers, settings));
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [activeGroup, processedUsers]);
  useEffect(() => {
    if (filters) {
      putInStorage(activeGroup, GrabberCategoryFilters, reduceFilters(filters));
    }
  }, [activeGroup, filters]);
  useEffect(() => {
    if (dontRecommendSubs && dontRecommendSubs.length > 0) {
      putInStorage(activeGroup, GrabberCategoryDontRecommendSubs, dontRecommendSubs);
    }
  }, [activeGroup, dontRecommendSubs]);

  // Update grabber
  useEffect(() => {
    if (grabber.current) {
      grabber.current.subs = subs;
      grabber.current.filters = filters;
      grabber.current.settings = settings;
      grabber.current.postQueue = postQueue;
    } else if (subs !== undefined && filters !== undefined) {
      grabber.current = new Grabber(
        settings,
        subs,
        setSubs,
        setPosts,
        postQueue,
        setPostQueueHasData,
        filters,
        setFilters
      );
    }
  }, [settings, subs, postQueue, filters]);
  // Update UserRetriever
  useEffect(() => {
    if (userRetriever.current) {
      userRetriever.current.processedUsers = processedUsers;
      userRetriever.current.usersSubs = usersSubs;
      userRetriever.current.settings = settings;
    } else if (settings !== undefined && processedUsers !== undefined && usersSubs !== undefined) {
      userRetriever.current = new UserRetriever(
        settings,
        processedUsers,
        usersSubs,
        setUsersSubs
      );
    }
  }, [settings, processedUsers, usersSubs]);
  // Update postQueue on group switch
  useEffect(() => {
    // Discard race conditions on-load
    if (previousActiveGroup === null || previousActiveGroup === undefined) {
      return;
    }

    postQueue.clear();
    setPostQueueHasData(false); // This /should/ help with switching to/from groups

    if ((subs ?? []).length > 0) {
      enqueueSubs(settings, postQueue, subs, setPostQueueHasData);
    }
  }, [activeGroup]);

  // Run search
  useEffect(() => {
    if (grabber.current && postQueueHasData && !postQueue.isEmpty()) {
      grabber.current.grabLoop();
    }
  }, [postQueueHasData]);

  // Timer for search calls
  const [postInterval, setPostInterval] = useState(undefined);
  useEffect(() => {
    if (postInterval) {
      clearInterval(postInterval);
    }

    var newInterval = setInterval(function () {
      if (postQueue.isEmpty()) {
        enqueueSubs(settings, postQueue, subs, setPostQueueHasData);
      } else {
        grabber.current.grabLoop();
      }
    }, settings.grabIntervalInMinutes * 60 * 1000);

    setPostInterval(newInterval);
  }, [settings.grabIntervalInMinutes, subs]);

  // Run user retrieval after posts have all been grabbed
  useEffect(() => {
    if (userRetriever.current && !postQueueHasData) {
      userRetriever.current.grabLoop();
    }
  }, [postQueueHasData]);

  // Posts -> ProcessedUsers
  const processingRef = useRef(undefined);
  useEffect(() => {
    if (processingRef.current) return;

    setPosts(prev => {
      if (!prev || prev.length === 0)
        return prev;

      processingRef.current = prev[0];

      return prev.slice(1);
    });
  }, [posts, processingRef]);
  useEffect(() => {
    if (!processingRef.current) return;

    let t3 = processingRef.current.name;

    setProcessedUsers(postIntake(processingRef.current, settings, filters, subs));

    queueMicrotask(() => {
      processingRef.current = undefined;
      setPosts(prev => prev.filter(p => p.name !== t3)); // Not needed - but this helps trigger another refresh
    });
  }, [posts, processingRef]);

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
      processedUsers={processedUsers}
      setProcessedUsers={setProcessedUsers}
    />
    <Body
      settings={settings}
      processedUsers={processedUsers}
      setProcessedUsers={setProcessedUsers}
      setFilters={setFilters}
      setPopOutMedia={setPopOutMedia}
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
      postQueueHasData={postQueueHasData}
      setPostQueueHasData={setPostQueueHasData}
      setPosts={setPosts}
      processedUsers={processedUsers}
      setProcessedUsers={setProcessedUsers}
      usersSubs={usersSubs}
      dontRecommendSubs={dontRecommendSubs}
      setDontRecommendSubs={setDontRecommendSubs}
    />
    <PopOutMediaContainer
      popOutMedia={popoutMedia}
      setPopOutMedia={setPopOutMedia}
      setProcessedUsers={setProcessedUsers}
    />
  </>;
}
