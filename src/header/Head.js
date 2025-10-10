import { useMemo } from 'react';
import './Head.css';
import GroupSelector from './GroupSelector.js';
import QuickAdd from './QuickAdd.js';
import QuickFilter from './QuickFilter.js';
import { randSixHash } from '../app/colors.js';
import {
    DefaultSettings,
    FilterCategorySub,
    FilterTagCloser,
    FilterTagOpener,
    FilterTagsCloser,
    FilterTagsOpener,
    SettingPostTypes
} from '../app/constants.js';
import { addNewFilter } from '../app/filters.js';
import { postDisplayFilter } from '../app/postHelpers/postFunctions.js';

// TODO: Button to stop grabber
export default function Head({
    settings,
    setSettings,
    groups,
    setGroups,
    activeGroup,
    subs,
    setSubs,
    filters,
    setFilters,
    postQueue,
    postQueueHasData,
    setPostQueueHasData,
    posts,
    setPosts
}) {
    const quickFilter = useMemo(() => {
        return <QuickFilter
            quickAdd={quickAdd}
        />
    }, []);

    const quickAddSection = useMemo(() => {
        return <QuickAdd
            key={FilterCategorySub}
            quickAdd={quickAdd}
        />;
    }, []);

    // Utilizing quick-add classes for ease
    const postCount = useMemo(() => {
        return <div className="qa-section" id="postCount">
            <div className="qa-title">Posts</div>
            <div className="qa-options">
                {(posts ?? []).filter(post => postDisplayFilter(settings, post)).length}
            </div>
            <select
                value={settings[SettingPostTypes.fieldName] ?? DefaultSettings[SettingPostTypes.fieldName]}
                onChange={(e) =>
                    setSettings((current) => ({
                        ...current,
                        [SettingPostTypes.fieldName]: e.target.value,
                    }))
                }
                name={SettingPostTypes.fieldName}
                className="qa-dropdown"
            >
                {SettingPostTypes.options.map((o) =>
                    <option key={o.settingValue} value={o.settingValue}>{o.displayValue}</option>
                )}
            </select>
        </div>;
    }, [posts, settings[SettingPostTypes.fieldName]]);

    function quickAdd(section, input, desired) {
        if (input === undefined || input === null || input === '' || input === ' ')
            return null;

        if (section === FilterCategorySub) {
            let updates = input.split(',');
            updates.forEach((addition) => {
                let contains = (subs ?? []).includes(addition);

                if (!contains) {
                    let newSub = {};
                    newSub.name = addition;
                    newSub.color = randSixHash();
                    newSub.ba = {};
                    newSub.ba.beforet3 = undefined;
                    newSub.ba.beforeutc = undefined;
                    newSub.ba.aftert3 = undefined;
                    newSub.ba.afterutc = undefined;
                    newSub.reachedEnd = false;
                    setSubs((current) => [
                        ...current,
                        newSub
                    ]);

                    postQueue.enqueue({
                        sub: addition,
                        ba: undefined,
                        pre: false
                    }, 1);
                }

                if (!postQueueHasData) {
                    setPostQueueHasData(true);
                } else if (settings.retrieveOnSubAddition) {
                    // Toggle the post queue to re-trigger retrieval
                    setPostQueueHasData(false);
                    setPostQueueHasData(true);
                }
            });
        } else if (input.startsWith(FilterTagOpener)) {
            var text = input.substring(8);
            FilterTagsOpener.forEach((t) => quickAdd(section, t + text, desired));
        } else if (input.endsWith(FilterTagCloser)) {
            var text = input.substring(0, input.length - 8);
            FilterTagsCloser.forEach((t) => quickAdd(section, text + t, desired));
        } else {
            var preExistingFilters = (filters ?? []);
            let contains = false;
            for (var i = 0; i < preExistingFilters.length; i++) {
                var fCheck = preExistingFilters[i];
                if (fCheck.filter === input && fCheck.category === section) {
                    contains = true;
                    break;
                }
            }

            if (!contains) {
                addNewFilter(
                    settings,
                    {
                        category: section,
                        filter: input,
                        desired: desired,
                        count: 0
                    },
                    setFilters,
                    setPosts
                );
            }
        }
    }

    const groupSelection = useMemo(() => {
        return <GroupSelector
            groups={groups}
            setGroups={setGroups}
            activeGroup={activeGroup}
        />
    }, [groups, activeGroup]);

    const progressBar = useMemo(() => {
        const maxProgress = (subs ?? []).length * 2;
        const value = maxProgress - (postQueue ?? []).length();
        const percentage = maxProgress > 0 ? (value / maxProgress) * 100 : 0;

        return <div id="progressbar-container">
            <div
                id="progressbar"
                style={{ width: `${percentage}%` }}
            />
        </div>;
    }, [subs, postQueue.length()]);

    return <div id="header">
        <div id="title">ReactiveReddit by <a href="alexvanmatre.com">alexvanmatre.com</a></div>
        <div id="quickadd">
            {quickAddSection}
            {quickFilter}
            {postCount}
        </div>
        {progressBar}
        {groupSelection}
    </div>;
}
