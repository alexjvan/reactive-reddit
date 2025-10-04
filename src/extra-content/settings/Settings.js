import { useMemo } from 'react';
import './Settings.css';
import GroupsDisplay from './GroupsDisplay.js';
import GroupInternalsDisplay from './GroupInternalsDisplay.js';
import SettingDisplay from './SettingDisplay.js';

export default function Settings({
    settings,
    setSettings,
    groups,
    setGroups,
    activeGroup,
    subs,
    setSubs,
    filters,
    setFilters,
    posts,
    setPosts,
    postsPerSub
}) {
    const settingsDisplay = useMemo(
        () => <SettingDisplay
            settings={settings}
            setSettings={setSettings}
        />,
        [settings, setSettings]
    );

    const groupsDisplay = useMemo(() =>
        <GroupsDisplay
            groups={groups}
            setGroups={setGroups}
            activeGroup={activeGroup}
            subs={subs}
            filters={filters}
            posts={posts}
            clearFilters={clearFilters}
        />,
        [groups, setGroups, activeGroup, subs, filters, posts, clearFilters]
    );

    const groupInternalsDisplay = useMemo(() =>
        <GroupInternalsDisplay
            settings={settings}
            subs={subs}
            setSubs={setSubs}
            filters={filters}
            setFilters={setFilters}
            setPosts={setPosts}
            postsPerSub={postsPerSub}
            clearFilters={clearFilters}
        />,
        [subs, setSubs, filters, setPosts, postsPerSub, clearFilters]
    );

    function clearFilters() {
        setFilters([]);
        setPosts((prev) => prev.map((post) => {
            post.filteredFor = [];
            return post;
        }));
    }

    return <div id="settings">
        {settingsDisplay}
        {groupsDisplay}
        {groupInternalsDisplay}
    </div>;
}
