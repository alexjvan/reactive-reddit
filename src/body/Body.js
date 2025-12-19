import { useEffect, useMemo, useRef } from 'react';
import './Body.css';
import User from './User/User';
import { SortOptionNew, SortOptionPostCount } from '../app/constants';
import { postDisplayFilter } from '../app/postHelpers/postFunctions';

export default function Body({
    settings,
    processedUsers,
    setProcessedUsers,
    setFilters
}) {
    // TODO: This does NOT work, but its better than before so I am keeping it until I find something better.
    const containerRef = useRef(null);
    const scrollPosition = useRef(0);

    // Save scroll position before unmounting or re-rendering
    // This useEffect, and the next, are an attempt to keep scroll-position on re-render.
    useEffect(() => {
        function handleScroll() {
            if (containerRef.current) {
                scrollPosition.current = containerRef.current.scrollTop;
            }
        };

        const container = containerRef.current;
        container?.addEventListener("scroll", handleScroll);

        return () => {
            container?.removeEventListener("scroll", handleScroll);
        };
    }, []);

    // Restore scroll position after re-render
    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = scrollPosition.current;
        }
    }, [processedUsers]); // Trying to avoid constant re-renders

    let toDisplay = useMemo(() => filterAndSort((processedUsers ?? [])), [processedUsers, settings]);

    function filterAndSort(passedUsers) {
        let filtered = passedUsers
            .map(u => ({
                ...u,
                posts: u.posts.filter(p => postDisplayFilter(settings, p, true))
            }));
        switch (settings.sort) {
            case SortOptionNew.settingValue:
                return [...filtered].sort(
                    (a, b) => (b.posts.length === 0 ? new Date(0) : b.posts[0].date)
                        - (a.posts.length === 0 ? new Date(0) : a.posts[0].date)
                );
            case SortOptionPostCount.settingValue:
                return [...filtered].sort((a, b) => b.posts.length - a.posts.length);
            default:
                console.log('Unknown sort option, defaulting to New');
                return [...filtered].sort((a, b) => b.earliestPost - a.earliestPost);
        }
    }

    const usersDisplay = useMemo(() => <>
        {toDisplay.map(user =>
            <User
                key={user.username}
                processedUser={user}
                setProcessedUsers={setProcessedUsers}
                setFilters={setFilters}
            />
        )}
    </>, [toDisplay]);

    return <div id="body" ref={containerRef}>
        {usersDisplay}
    </div>;
}
