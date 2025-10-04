import { useMemo } from 'react';
import './ExtraContent.css';
import Help from './help/Help';
import Settings from './settings/Settings';
import Stats from './stats/Stats';
import { DefaultGroups, ExtraContentHelp, ExtraContentSettings, ExtraContentStats } from '../app/constants';

export default function ExtraContent({
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
    posts,
    setPosts,
    setMinimizedUsers
}) {
    const help = useMemo(() => {
        return <Help />;
    }, []);

    const postsPerSub = useMemo(
        () => grabPostsPerSub(),
        [posts, subs]
    );

    function grabPostsPerSub() {
        let postSubs = (posts ?? []).filter((p) => !p.disabled && p.filteredFor.length === 0).map((p) => p.subreddit);
        let reduced = postSubs.reduce((acc, curr) => {
            acc[curr] = (acc[curr] || 0) + 1;
            return acc;
        }, {});

        // Fill missing subs with 0 count
        (subs ?? []).forEach((s) => {
            const existingKey = Object.keys(reduced).find(
                (k) => k.toLowerCase() === s.name.toLowerCase()
            );

            const key = existingKey ?? s.name;
            if (!reduced[key]) reduced[key] = 0;
        });

        // Sort entries by count in descending order
        return Object.entries(reduced)
            .sort((a, b) => b[1] - a[1])
            .map(([sub, count]) => ({ sub, count }));
    }

    function clearAllContent() {
        setPosts([]);
        setFilters([]);
        setMinimizedUsers([]);
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
            posts={posts}
            setPosts={setPosts}
            postsPerSub={postsPerSub}
        />;
    }, [settings, setSettings,
        groups, setGroups,
        activeGroup,
        subs, setSubs,
        filters, setFilters,
        posts, setPosts,
        postsPerSub]);

    const stats = useMemo(() => {
        return <Stats
            settings={settings}
            setFilters={setFilters}
            posts={posts}
            setPosts={setPosts}
            postsPerSub={postsPerSub}
        />;
    }, [settings, setFilters, posts, setPosts, postsPerSub]);

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
