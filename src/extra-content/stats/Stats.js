import { useMemo } from 'react';
import './Stats.css';
import { FilterCategoryTag, FilterCategoryTitle } from '../../app/constants.js';
import { addNewFilter } from '../../app/filters';

export default function Stats({
    settings,
    setFilters,
    posts,
    setPosts,
    postsPerSub
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
        [posts]
    );

    const _commonKeywords = useMemo(() =>
        Object.entries(commonKeywords())
            .sort((a, b) => b[1] - a[1])
            .map(([word, count]) => 
                <div className='stats-row' key={"keywords"+ word}>
                    <div className='stats-left'>{word}</div>
                    <div className='stats-right'>
                        <button className='stats-addFilter' onClick={() => addTitleFilter(word)}>
                            +Filter
                        </button>
                        {count}
                    </div>
                </div>
            ),
            [posts]
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
            setPosts
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
            setPosts
        );
    }

    function postsPerTag() {
        return posts
            .filter((p) => !p.disabled && p.filteredFor.length === 0)
            .reduce((currentTags, post) => {
                let setTags = false;

                if (post.link_flair_richtext.length > 0) {
                    post.link_flair_richtext.forEach(flair => {
                        currentTags[flair.t] = (currentTags[flair.t] || 0) + 1;
                    });
                    setTags = true;
                }
                if (post.link_flair_text) {
                    currentTags[post.link_flair_text] = (currentTags[post.link_flair_text] || 0) + 1;
                    setTags = true;
                }

                if (!setTags) {
                    currentTags['None'] = (currentTags['None'] || 0) + 1;
                }

                return currentTags;
            }, {});
    }

    function commonKeywords() {
        const wordCounts = {};

        posts
            .filter((p) => !p.disabled && p.filteredFor.length === 0)
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
    </div>;
}
