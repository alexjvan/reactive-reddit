import { useMemo, useRef, useState } from 'react';
import './Settings.css';
import GroupsDisplay from './GroupsDisplay.js';
import GroupInternalsDisplay from './GroupInternalsDisplay.js';
import SettingDisplay from './SettingDisplay.js';
import { AllSettingsPages, SettingsPageContent, SettingsPageSettings } from '../../app/constants.js';
import { importSaveFile, exportSave } from '../../app/storage/saves.js';

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
    setPosts,
    processedUsers,
    setProcessedUsers,
    postsPerSub
}) {
    const fileInputRef = useRef();

    function triggerImport() {
        fileInputRef.current.value = null;
        fileInputRef.current.click();
    }

    const [settingsPage, setSettingsPage] = useState(AllSettingsPages[0]);

    const settingsTabs = useMemo(() => <div id='settings-tabs'>
        {AllSettingsPages.map(page =>
            <button
                key={`allSettings-${page}`}
                className={'settings-tab' + (settingsPage === page ? ' active' : '')}
                onClick={() => setSettingsPage(page)}
            >
                {page}
            </button>
        )}
    </div>, [settingsPage]);

    const settingsDisplay = useMemo(() => <SettingDisplay
        settings={settings}
        setSettings={setSettings}
    />, [settings, setSettings]);

    const pageContentDisplay = useMemo(() => <>
        <GroupsDisplay
            groups={groups}
            setGroups={setGroups}
            activeGroup={activeGroup}
            subs={subs}
            filters={filters}
            processedUsers={processedUsers}
            clearFilters={clearFilters}
        />
        <GroupInternalsDisplay
            settings={settings}
            subs={subs}
            setSubs={setSubs}
            filters={filters}
            setFilters={setFilters}
            setPosts={setPosts}
            setProcessedUsers={setProcessedUsers}
            postsPerSub={postsPerSub}
            clearFilters={clearFilters}
        />
    </>, [settings, groups, activeGroup, subs, filters, postsPerSub, processedUsers, clearFilters]);

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
                accept='.json'
                style={{ display: 'none' }}
                onChange={(e) => importSaveFile(e, setSettings, setGroups)}
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
        let toProcessPosts = [];
        setProcessedUsers(prev => prev.map(u => {
            let posts = [...u.filteredPosts].map(f => f.post);
            u.posts = posts.filter(p => p.processed);
            toProcessPosts.push(posts.filter(p => !p.processed));
            u.filteredPosts = [];

            return u;
        }));
        setPosts(prev => [...prev, toProcessPosts]);
    }

    return <div id="settings">
        {settingsTabs}
        {pageDisplay}
        {settingsFooter}
    </div>;
}
