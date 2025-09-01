import { useMemo } from 'react';
import './Stats.css';
import { addApplicableFilter } from '../../app/filters';

export default function Stats({
    subs,
    setFilters,
    posts,
    setPosts
}) {
    const _postsPerSub = useMemo(() =>
        postsPerSub().map(({ sub, count }) => (
            <div className='stats-row' key={sub}>
                <div className='stats-left'>{sub}</div>
                <div className='stats-right'>{count}</div>
            </div>
        )),
        [posts, subs]
    );

    const _postsPerTag = useMemo(() =>
        Object.entries(postsPerTag())
            .sort((a, b) => b[1] - a[1])
            .map(([tag, count]) => (
                <div className='stats-row' key={tag}>
                    <div className='stats-left'>{tag}</div>
                    <div className='stats-right'>
                        <button className='stats-addFilter' onClick={() => addTagFilter(tag)}>
                            +Filter
                        </button>
                        {count}
                    </div>
                </div>
            )),
        [posts]
    );

    function addTagFilter(tag) {
        let newFilter = {
            category: 'Tag',
            filter: tag,
            desired: false,
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

    function postsPerSub() {
        let postSubs = posts.filter((p) => !p.disabled && p.filteredFor.length === 0).map((p) => p.subreddit);
        let reduced = postSubs.reduce((acc, curr) => {
            acc[curr] = (acc[curr] || 0) + 1;
            return acc;
        }, {});

        // Fill missing subs with 0 count
        subs.forEach((s) => {
            const existingKey = Object.keys(reduced).find(
                (k) => k.toLowerCase() === s.name.toLowerCase()
            );

            const key = existingKey ?? s.name;
            if (!reduced[key]) reduced[key] = 0;
        });

        // Sort entries by count in descending order
        return Object.entries(reduced)
            .sort((a, b) => b[1] - a[1])
            .map(([sub, count]) => ({ sub, count }));
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

    // TODO: Common keywords in titles
    //      Probably want to ignore words less than 3 letters (4?) to get rid of common words
    //      will need to remove punctuation at the end as well
    //      For example:
    //         "Welcome to Seattle", "Best food in Seattle", "Seattle sucks!"
    //         "Seattle" -> 3
    //         "Best" -> 1
    //         "food" -> 1
    //         "Welcome" -> 1
    //         "sucks" -> 1
    return <div id="statistics">
        <div className='stats-section'>
            {_postsPerSub}
        </div>
        <div className='stats-section'>
            {_postsPerTag}
        </div>
    </div>;
}
