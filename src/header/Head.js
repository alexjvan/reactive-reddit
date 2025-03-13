import './Head.css';
import QuickAdd from './QuickAdd.js';
import { randSixHash } from '../app/colors.js';
import { filterCheck } from '../app/filters.js';
import $ from 'jquery';
import { memo } from 'react';

const QuickAddMemo = memo(QuickAdd);

export default function Head({
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

    // TODO: Rewrite to get rid of jquery
    function quickAdd(section) {
        let parent = $('#qa-'+section.replace("||","or"));
        let input = $(parent).find('.qa-input');
        let inputval = $(input).val();
        if(inputval === undefined || inputval === null || inputval === '' || inputval === ' ') return null;
        if(section === "Subs") {
            let updates = inputval.split(',');
            updates.forEach((addition) => {
                let contains = subs.includes(addition);

                if(!contains) {
                    let newSub = {};
                    newSub.name = addition;
                    newSub.color = randSixHash();
                    newSub.ba = {};
                    newSub.ba.beforet3 = undefined;
                    newSub.ba.beforeutc = undefined;
                    newSub.ba.aftert3 = undefined;
                    newSub.ba.afterutc = undefined;
                    newSub.reachedEnd = false;
                    newSub.grabbing = false;
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

                if(!postQueueHasData) {
                    setPostQueueHasData(true);
                }
            });
        } else {
            let want = $(parent).find('.qa-want').hasClass('include');
            let newFilter = {
                category: section,
                filter: inputval,
                desired: want,
                count: 0
            };
            setFilters([
                ...filters,
                newFilter
            ]);
            setPosts((prev) => prev.map((post) => {
                if(post.filteredFor.length > 0 || post.disabled) return post;
                let applies = filterCheck(newFilter, post);
                if(applies) post.filteredFor.push(post);
                return post;
            }));
        }
        $(input).val("");
    }

    return (
        <div id="header">
            <div id="title">ReactiveReddit by <a href="alexvanmatre.com">alexvanmatre.com</a></div>
            <div id="quickadd">
                {sections.map((section) => (
                    <QuickAddMemo
                        key={section}
                        section={section}
                        quickAdd={quickAdd}
                    />
                ))}
            </div>
        </div>
    );
}