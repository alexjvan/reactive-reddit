import './Head.css';
import GroupSelector from './GroupSelector.js';
import QuickAdd from './QuickAdd.js';
import { randSixHash } from '../app/colors.js';
import { filterCheck } from '../app/filters.js';
import { useMemo } from 'react';

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
    setPosts
}) {
    // TODO: Find a better way to incorporate these.
    //      One 'QuickAdd' with a dropdown?
    const sections = ["Subs", "Author", "Tag", "Text", /* "Text||Title", */ "Title"];

    const quickAddSection = useMemo(() => {
        return sections.map((section) =>
            <QuickAdd
                key={section}
                section={section}
                quickAdd={quickAdd}
            />
        );
    }, [sections])

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
              let contains = subs.includes(addition);

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
        } else {
            let newFilter = {
                category: section,
                filter: input,
                desired: desired,
                count: 0
            };

            setFilters([
                ...filters,
                newFilter
            ]);
            setPosts((prev) => prev.map((post) => {
                if (post.filteredFor.length > 0 || post.disabled)
                    return post;

                let applies = filterCheck(newFilter, post);
                if (applies)
                    post.filteredFor.push(post);

                return post;
            }));
        }
    }

    const groupSelection = useMemo(() => {
      return <GroupSelector
        groups = {groups}
        setGroups = {setGroups}
        activeGroup = {activeGroup}
        setActiveGroup = {setActiveGroup}
      />
    }, [groups, activeGroup]);

    const progressBar = useMemo(() => {
        const maxProgress = subs.length * 2;

        return <progress
            value={maxProgress - postQueue.length()}
            max={maxProgress}
        />;
    }, [subs, postQueue.length()])

    // TODO: Display only-text or only-media posts (need proper settings)
    // TODO: Sorting options (need proper settings)
    return (
        <div id="header">
            <div id="title">ReactiveReddit by <a href="alexvanmatre.com">alexvanmatre.com</a></div>
            <div id="quickadd">
                {quickAddSection}
            </div>
            {progressBar}
            {groupSelection}
        </div>
    );
}
