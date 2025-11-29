import { useMemo, useRef, useState } from 'react';
import './Settings.css';
import GroupsDisplay from './GroupsDisplay.js';
import GroupInternalsDisplay from './GroupInternalsDisplay.js';
import SettingDisplay from './SettingDisplay.js';
import {
    AllSettingsPages,
    GrabberCategoryGroups,
    GrabberCategorySubs,
    GrabberCategoryFilters,
    GrabberCategoryPosts,
    GrabberCategoryUsersSubs,
    GrabberCategoryDontRecommendSubs,
    GrabberCategoryMinUsers,
    GrabberCategorySettings,
    SettingsPageContent,
    SettingsPageSettings
} from '../../app/constants.js';
import { putInStorage, getFromStorage } from '../../app/storage/storage.js';
import { emptyValidation, settingsValidation } from '../../app/storage/validators.js';

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
    const fileInputRef = useRef();

    function exportSave() {
        const save = {};

        save.settings = getFromStorage('', GrabberCategorySettings, {}, settingsValidation);
        const groupsMeta = getFromStorage('', GrabberCategoryGroups, [], emptyValidation);
        save.groups = groupsMeta;
        save.usersSubs = getFromStorage('', GrabberCategoryUsersSubs, [], emptyValidation);

        const groupsData = {};
        (groupsMeta || []).forEach((g) => {
            groupsData[g.name] = {
                subs: getFromStorage(g.name, GrabberCategorySubs, [], emptyValidation),
                filters: getFromStorage(g.name, GrabberCategoryFilters, [], emptyValidation),
                posts: getFromStorage(g.name, GrabberCategoryPosts, [], emptyValidation),
                minUsers: getFromStorage(g.name, GrabberCategoryMinUsers, [], emptyValidation),
                dontRecommendSubs: getFromStorage(g.name, GrabberCategoryDontRecommendSubs, [], emptyValidation)
            };
        });
        save.groupData = groupsData;

        const blob = new Blob([JSON.stringify(save, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reactive-reddit-save-${new Date().toISOString()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    function triggerImport() {
        fileInputRef.current.value = null;
        fileInputRef.current.click();
    }

    function importSaveFile(evt) {
        const file = evt.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.settings) {
                    putInStorage('', GrabberCategorySettings, data.settings);
                    setSettings(data.settings);
                }
                if (data.groups) {
                    setGroups(data.groups.map(g => ({ name: g.name, active: g.active })));
                }
                if(data.groupData) {
                    Object.entries(data.groupData).forEach(([groupName, groupData]) => {
                        if (groupData.subs) putInStorage(groupName, GrabberCategorySubs, groupData.subs);
                        if (groupData.filters) putInStorage(groupName, GrabberCategoryFilters, groupData.filters);
                        if (groupData.posts) putInStorage(groupName, GrabberCategoryPosts, groupData.posts);
                        if (groupData.minUsers) putInStorage(groupName, GrabberCategoryMinUsers, groupData.minUsers);
                        if (groupData.dontRecommendSubs) putInStorage(groupName, GrabberCategoryDontRecommendSubs, groupData.dontRecommendSubs);
                    });
                }
                if (data.usersSubs) {
                    putInStorage('', GrabberCategoryUsersSubs, data.usersSubs);
                }

                // Instead of trying to in-place replace everything, just reloading the page to trigger the update
                //    Not only does this save effort, this saves A LOT of time trying to load everything
                window.location.reload();
            } catch (err) {
                console.error('Error importing save file', err);
                alert('Invalid save file');
            }
        };
        reader.readAsText(file);
    }

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

    const settingsFooter = useMemo(
        () => <div id="settings-footer">
            <button className='clickable'
                onClick={exportSave}
            >
                Export Save
            </button>
            <button className='clickable'
                onClick={triggerImport}
                style={{ marginLeft: '8px' }}
            >
                Import Save
            </button>
            <input
                ref={fileInputRef}
                type='file'
                accept='.json,application/json'
                style={{ display: 'none' }}
                onChange={importSaveFile}
            />
        </div>,
        []
    );

    const pageDisplay = useMemo(
        () => <div id='settings-content'>
            {
                settingsPage === SettingsPageSettings
                    ? settingsDisplay
                    : settingsPage === SettingsPageContent
                        ? pageContentDisplay
                        : null
            }
        </div>,
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
        {settingsFooter}
    </div>;
}
