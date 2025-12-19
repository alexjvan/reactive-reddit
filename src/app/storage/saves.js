import {
    GrabberCategoryDontRecommendSubs,
    GrabberCategoryFilters,
    GrabberCategoryGroups,
    GrabberCategoryPosts,
    GrabberCategoryProcessedUsers,
    GrabberCategorySettings,
    GrabberCategorySubs,
    GrabberCategoryUsersSubs
} from '../constants.js';
import { getFromStorage, putInStorage } from "./storage";
import { emptyValidation, settingsValidation } from './validators';

export function exportSave() {
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
            processedUsers: getFromStorage(g.name, GrabberCategoryProcessedUsers, [], emptyValidation),
            posts: getFromStorage(g.name, GrabberCategoryPosts, [], emptyValidation),
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

export function importSaveFile(evt, setSettings, setGroups) {
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
            if (data.groupData) {
                Object.entries(data.groupData).forEach(([groupName, groupData]) => {
                    if (groupData.subs) putInStorage(groupName, GrabberCategorySubs, groupData.subs);
                    if (groupData.filters) putInStorage(groupName, GrabberCategoryFilters, groupData.filters);
                    if (groupData.posts) putInStorage(groupName, GrabberCategoryPosts, groupData.posts);
                    if (groupData.processedUsers) putInStorage(groupName, GrabberCategoryProcessedUsers, groupData.processedUsers);
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