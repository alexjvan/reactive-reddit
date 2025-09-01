import './Head.css';
import GroupSelector from './GroupSelector.js';
import QuickAdd from './QuickAdd.js';
import QuickFilter from './QuickFilter.js';
import { randSixHash } from '../app/colors.js';
import { addApplicableFilter } from '../app/filters.js';
import { useMemo } from 'react';

// TODO: Button to stop grabber
export default function Head({
    groups,
    setGroups,
    activeGroup,
    setActiveGroup,
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
    const openerTags = ['%start%', '[', '(', '{'];
    const closerTags = ['%end%', ']', ')', '}'];

    const quickFilter = useMemo(() => {
        return <QuickFilter
            quickAdd={quickAdd}
        />
    }, []);

    const quickAddSection = useMemo(() => {
        return <QuickAdd
            key={"Subs"}
            section={"Subs"}
            quickAdd={quickAdd}
        />;
    }, []);

    // Utilizing quick-add classes for ease
    const postCount = useMemo(() => {
        return <div className="qa-section" id="postCount">
            <div className="qa-title">Posts:</div>
            <div className="qa-options">
                {(posts ? posts : []).filter((p) => !p.disabled && p.filteredFor.length == 0).length}
            </div>
        </div>;
    }, [posts]);

    function quickAdd(section, input, desired) {
        if (input === undefined || input === null || input === '' || input === ' ')
            return null;

        if (section === "Subs") {
            // TODO: Settings to start retrieval on adding sub
            //    Right now how this works is that it assumes if data is already in the grabber,
            //    we don't need to restart grabbing.
            //
            //    This causes issues with the groups though, especially with new groups
            let updates = input.split(',');
            updates.forEach((addition) => {
                let contains = (subs ? subs : []).includes(addition);

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
                }
            });
        } else if (input.startsWith("%opener%")) {
            var text = input.substring(8);
            openerTags.forEach((t) => quickAdd(section, t + text, desired));
        } else if (input.endsWith("%closer%")) {
            var text = input.substring(0, input.length - 8);
            closerTags.forEach((t) => quickAdd(section, text + t, desired));
        } else {
            var preExistingFilters = (filters ? filters : []);
            let contains = false;
            for (var i = 0; i < preExistingFilters.length; i++) {
                var fCheck = preExistingFilters[i];
                if (fCheck.filter === input && fCheck.category === section) {
                    contains = true;
                    break;
                }
            }

            if (!contains) {
                let newFilter = {
                    category: section,
                    filter: input,
                    desired: desired,
                    count: 0
                };

                setFilters((prev) => [
                    ...prev,
                    newFilter
                ]);
                setPosts((prev) => prev.map((post) => {
                    if (post.filteredFor.length > 0 || post.disabled)
                        return post;

                    post.filteredFor = addApplicableFilter([newFilter], post);

                    return post;
                }));
            }
        }
    }

    const groupSelection = useMemo(() => {
        return <GroupSelector
            groups={groups}
            setGroups={setGroups}
            activeGroup={activeGroup}
            setActiveGroup={setActiveGroup}
        />
    }, [groups, activeGroup]);

    const progressBar = useMemo(() => {
        const maxProgress = (subs ? subs : []).length * 2;
        const value = maxProgress - (postQueue ? postQueue : []).length();
        const percentage = maxProgress > 0 ? (value / maxProgress) * 100 : 0;

        return <div id="progressbar-container">
            <div
                id="progressbar"
                style={{ width: `${percentage}%` }}
            />
        </div>;
    }, [subs, postQueue.length()]);

    // TODO: Display only-text or only-media posts (need proper settings)
    // TODO: Sorting options (need proper settings)
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
