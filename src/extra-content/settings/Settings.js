import { useMemo, useState } from 'react';
import './Settings.css';
import GroupsDisplay from './GroupsDisplay.js';
import GroupInternalsDisplay from './GroupInternalsDisplay.js';
import SettingDisplay from './SettingDisplay.js';
import { AllSettingsPages, SettingsPageContent, SettingsPageSettings } from '../../app/constants.js';

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
    const [settingsPage, setSettingsPage] = useState(AllSettingsPages[0]);

    const settingsTabs = useMemo(
        () => <div id='settings-tabs'>
            {AllSettingsPages.map((page) =>
                <button 
                    key={`allSettings-${page}`}
                    className={'settings-tab' + (settingsPage === page ? ' active' : '')}
                    onClick={() => setSettingsPage(page)}
                >
                    {page}
                </button>
            )}
        </div>, 
        [settingsPage]
    );

    const settingsDisplay = useMemo(
        () => <SettingDisplay
            settings={settings}
            setSettings={setSettings}
        />,
        [settings, setSettings]
    );

    const pageContentDisplay = useMemo(
        () => <>
            <GroupsDisplay
                groups={groups}
                setGroups={setGroups}
                activeGroup={activeGroup}
                subs={subs}
                filters={filters}
                posts={posts}
                clearFilters={clearFilters}
            />
            <GroupInternalsDisplay
                settings={settings}
                subs={subs}
                setSubs={setSubs}
                filters={filters}
                setFilters={setFilters}
                setPosts={setPosts}
                postsPerSub={postsPerSub}
                clearFilters={clearFilters}
            />
        </>,
        [settings, groups, activeGroup, subs, filters, posts, postsPerSub, clearFilters]
    );

    const pageDisplay = useMemo(
        () => {
            switch (settingsPage) {
                case SettingsPageSettings:
                    return settingsDisplay;
                case SettingsPageContent:
                    return pageContentDisplay;
            }
        },
        [settingsPage, settingsDisplay, pageContentDisplay]
    );

    function clearFilters() {
        setFilters([]);
        setPosts((prev) => prev.map((post) => {
            post.filteredFor = [];
            return post;
        }));
    }

    return <div id="settings">
        {settingsTabs}
        {pageDisplay}
    </div>;
}
