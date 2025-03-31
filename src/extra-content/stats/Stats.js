import './Stats.css';
import { useMemo } from 'react';

export default function Stats({
    subs,
    posts
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
                    <div className='stats-right'>{count}</div>
                </div>
            )), 
        [posts]
    );

    function postsPerSub() {
        let postSubs = posts.filter((p) => !p.disabled && p.filteredFor.length === 0).map((p) => p.subreddit);
        let reduced = postSubs.reduce((acc, curr) => {
            acc[curr] = (acc[curr] || 0) + 1;
            return acc;
        }, {});

        // Fill missing subs with 0 count
        subs.forEach((s) => {
            if (!reduced[s.name]) reduced[s.name] = 0;
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
                const tags = post.link_flair_richtext?.map((tag) => tag.t) || [post.link_flair_text];
                tags.forEach((tag) => {
                    currentTags[tag] = (currentTags[tag] || 0) + 1;
                });
                if(tags.length === 0) {
                    currentTags['None'] = (currentTags['None'] || 0) + 1;
                }
                return currentTags;
            }, {});
    }

    return (
        <div id="statistics">
            <div className='stats-section'>
                {_postsPerSub}
            </div>
            <div className='stats-section'>
                {_postsPerTag}
            </div>
        </div>
    );
}
