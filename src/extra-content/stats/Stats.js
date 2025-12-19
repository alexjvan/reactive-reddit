import { useMemo } from 'react';
import './Stats.css';
import { FilterCategoryTag, FilterCategoryTitle } from '../../app/constants.js';
import { addNewFilter } from '../../app/filters';
import { newSubWithName } from '../../app/subHelpers.js';

export default function Stats({
    postQueue,
    settings,
    subs,
    setSubs,
    setFilters,
    postQueueHasData,
    setPostQueueHasData,
    processedUsers,
    setProcessedUsers,
    postsPerSub,
    usersSubs,
    dontRecommendSubs,
    setDontRecommendSubs
}) {
    const _postsPerSub = useMemo(() =>
        postsPerSub.map(({ sub, count }) =>
            <div className='stats-row' key={"pps" + sub}>
                <div className='stats-left'>{sub}</div>
                <div className='stats-right'>{count}</div>
            </div>
        ),
        [postsPerSub]
    );

    const _postsPerTag = useMemo(() =>
        Object.entries(postsPerTag())
            .sort((a, b) => b[1] - a[1])
            .map(([tag, count]) =>
                <div className='stats-row' key={"ppt" + tag}>
                    <div className='stats-left'>{tag}</div>
                    <div className='stats-right'>
                        <button className='stats-addFilter' onClick={() => addTagFilter(tag)}>
                            +Filter
                        </button>
                        {count}
                    </div>
                </div>
            ),
        [processedUsers]
    );

    const _commonKeywords = useMemo(() =>
        Object.entries(commonKeywords())
            .sort((a, b) => b[1] - a[1])
            .map(([word, count]) =>
                <div className='stats-row' key={"keywords" + word}>
                    <div className='stats-left'>{word}</div>
                    <div className='stats-right'>
                        <button className='stats-addFilter' onClick={() => addTitleFilter(word)}>
                            +Filter
                        </button>
                        {count}
                    </div>
                </div>
            ),
        [processedUsers]
    );

    const _commonSubs = useMemo(() =>
        Object.entries(commonSubs())
            .filter(([sub, count]) => count >= settings.ignoreCommonSubsCount)
            .sort((a, b) => b[1] - a[1])
            .map(([sub, count]) =>
                <div className='stats-row' key={"recommend" + sub}>
                    <div className='stats-left'>{sub}</div>
                    <div className='stats-right'>
                        <button className='stats-addSub' onClick={() => addNewSub(sub)}>
                            +Add
                        </button>
                        <button className='stats-dontRec' onClick={() => setDontRecommendSubs(prev => [...prev, sub])}>
                            +Dont Recommend
                        </button>
                        {count}
                    </div>
                </div>
            ),
        [dontRecommendSubs, settings.ignoreCommonSubsCount, subs, usersSubs]
    );

    function addTagFilter(tag) {
        addNewFilter(
            settings,
            {
                category: FilterCategoryTag,
                filter: tag,
                desired: false,
                count: 0
            },
            setFilters,
            setProcessedUsers
        );
    }

    function addTitleFilter(word) {
        addNewFilter(
            settings,
            {
                category: FilterCategoryTitle,
                filter: word,
                desired: false,
                count: 0
            },
            setFilters,
            setProcessedUsers
        );
    }

    function addNewSub(subname) {
        setSubs((current) => [
            ...current,
            newSubWithName(subname)
        ]);

        postQueue.enqueue({
            sub: subname,
            ba: undefined,
            pre: false
        }, 1);

        if (!postQueueHasData)
            setPostQueueHasData(true);
    }

    function postsPerTag() {
        return [...processedUsers]
            .filter(u => !u.disabled)
            .flatMap(u => u.posts)
            .filter(p => !p.disabled)
            .reduce((currentTags, post) => {
                if (post.tags && post.tags.length > 0) {
                    post.tags.forEach(t => {
                        currentTags[t] = (currentTags[t] || 0) + 1;
                    })
                } else {
                    currentTags['None'] = (currentTags['None'] || 0) + 1;
                }

                return currentTags;
            }, {});
    }

    function commonKeywords() {
        const wordCounts = {};

        processedUsers
            .filter(u => !u.disabled)
            .flatMap(u => u.posts)
            .filter(p => !p.disabled)
            .forEach(post => {
                const words = post.title
                    .toLowerCase()
                    // This doesn't work. If you want to filter these items, it needs to match
                    // .replace(/[^a-z0-9\s]/g, '')   // Remove punctuation
                    .split(/\s+/);                  // Split by whitespace

                words.forEach(word => {
                    if (word.length <= settings.commonKeywordsIgnoreLength) return;

                    // Capitalize first letter only
                    const normalizedWord = word.charAt(0).toUpperCase() + word.slice(1);

                    wordCounts[normalizedWord] = (wordCounts[normalizedWord] || 0) + 1;
                });
            });

        return wordCounts;
    }

    function commonSubs() {
        const subCounts = {};

        let preExistingSubs = subs.map(s => s.name.toLowerCase());

        usersSubs
            .forEach(userSubs => {
                userSubs.subs.forEach(sub => {
                    if (
                        (dontRecommendSubs && !dontRecommendSubs.includes(sub.subname))
                        && !sub.subname.startsWith('u_')
                        && !preExistingSubs.includes(sub.subname.toLowerCase())
                    ) {
                        subCounts[sub.subname] = (subCounts[sub.subname] || 0) + sub.t3s.length;
                    }
                });
            });

        return subCounts;
    }

    return <div id="statistics">
        <div className='stats-section'>
            <div className='stats-header'>Posts Per Sub</div>
            <div className='stats-container'>
                {_postsPerSub}
            </div>
        </div>
        <div className='stats-section'>
            <div className='stats-header'>Posts Per Tag</div>
            <div className='stats-container'>
                {_postsPerTag}
            </div>
        </div>
        <div className='stats-section'>
            <div className='stats-header'>Common Keywords</div>
            <div className='stats-container'>
                {_commonKeywords}
            </div>
        </div>
        <div className='stats-section'>
            <div className='stats-header'>Common Subs</div>
            <div className='stats-container'>
                {_commonSubs}
            </div>
        </div>
    </div>;
}
