import { useMemo } from 'react';
import './ExtraContent.css';
import Help from './help/Help';
import Settings from './settings/Settings';
import Stats from './stats/Stats';
import { DefaultGroups, ExtraContentHelp, ExtraContentSettings, ExtraContentStats } from '../app/constants';

export default function ExtraContent({
    postQueue,
    settings,
    setSettings,
    extraDisplay,
    setExtraDisplay,
    groups,
    setGroups,
    activeGroup,
    subs,
    setSubs,
    filters,
    setFilters,
    postQueueHasData,
    setPostQueueHasData,
    setPosts,
    processedUsers,
    setProcessedUsers,
    usersSubs,
    dontRecommendSubs,
    setDontRecommendSubs
}) {
    const help = useMemo(() => <Help />, []);

    const postsPerSub = useMemo(() => grabPostsPerSub(), [processedUsers, subs]);

    function grabPostsPerSub() {
        let postSubs = (processedUsers ?? [])
            .filter(u => !u.disabled)
            .flatMap(u => u.posts)
            .filter(p => !p.disabled)
            .flatMap(p => p.subs)
            .map(s => s.name)
            .reduce((acc, curr) => {
                acc[curr] = (acc[curr] || 0) + 1;
                return acc;
            }, {});

        // Fill missing subs with 0 count
        (subs ?? []).forEach(s => {
            const existingKey = Object.keys(postSubs).find(
                (k) => k.toLowerCase() === s.name.toLowerCase()
            );

            const key = existingKey ?? s.name;
            if (!postSubs[key]) postSubs[key] = 0;
        });

        // Sort entries by count in descending order
        return Object.entries(postSubs)
            .sort((a, b) => b[1] - a[1])
            .map(([sub, count]) => ({ sub, count }));
    }

    function clearAllContent() {
        setPosts([]);
        setProcessedUsers([]);
        setFilters([]);
        setSubs([]);
        setGroups(DefaultGroups);
    }

    const clearAll = useMemo(() =>
        <button className='clearall clickable' onClick={clearAllContent}>
            Clear All
        </button>,
        []
    );

    const settingsDisplay = useMemo(() => {
        return <Settings
            settings={settings}
            setSettings={setSettings}
            groups={groups}
            setGroups={setGroups}
            activeGroup={activeGroup}
            subs={subs}
            setSubs={setSubs}
            filters={filters}
            setFilters={setFilters}
            setPosts={setPosts}
            processedUsers={processedUsers}
            setProcessedUsers={setProcessedUsers}
            postsPerSub={postsPerSub}
        />;
    }, [settings,
        groups, activeGroup,
        subs,
        filters,
        processedUsers,
        postsPerSub]);

    const stats = useMemo(() => {
        return <Stats
            postQueue={postQueue}
            settings={settings}
            subs={subs}
            setSubs={setSubs}
            setFilters={setFilters}
            postQueueHasData={postQueueHasData}
            setPostQueueHasData={setPostQueueHasData}
            processedUsers={processedUsers}
            setProcessedUsers={setProcessedUsers}
            postsPerSub={postsPerSub}
            usersSubs={usersSubs}
            dontRecommendSubs={dontRecommendSubs}
            setDontRecommendSubs={setDontRecommendSubs}
        />;
    }, [postQueue,
        settings,
        subs,
        postQueueHasData,
        processedUsers,
        postsPerSub,
        usersSubs,
        dontRecommendSubs]);

    return (extraDisplay &&
        <div id="extrapage">
            <div id="extraheader">
                <div id="extratitle">{extraDisplay}</div>
                <div id="extra-right">
                    <div id="extrainteraction">
                        {extraDisplay === ExtraContentSettings && clearAll}
                    </div>
                    <button id="extraclose" className="clickable" onClick={() => setExtraDisplay(null)}>X</button>
                </div>
            </div>
            <div id="extracontent">
                {extraDisplay === ExtraContentHelp && help}
                {extraDisplay === ExtraContentSettings && settingsDisplay}
                {extraDisplay === ExtraContentStats && stats}
            </div>
        </div>
    );
}
