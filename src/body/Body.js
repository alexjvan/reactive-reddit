import { useEffect, useMemo, useRef } from 'react';
import './Body.css';
import User from './User/User';
import { SettingSort, SortOptionNew, SortOptionPostCount } from '../app/constants';
import { isUserOutdatedFromPosts } from '../app/userHelpers';
import { postDisplayFilter } from '../app/postHelpers/postFunctions';

export default function Body({
    settings,
    processedUsers,
    setProcessedUsers,
    setFilters,
    setPopOutMedia,
    headerMinimized
}) {
    // TODO: This does NOT work, but its better than before so I am keeping it until I find something better.
    const containerRef = useRef(null);
    const scrollPosition = useRef(0);

    // ----- Image Duplication ----- 
    const workerRef = useRef(null);
    useEffect(() => {
        workerRef.current = new Worker(
            new URL('../app/workers/imageDuplicateWorker.js', import.meta.url),
            { type: "module" }
        );


        workerRef.current.onmessage = (e) => {
            const { username, t3, media } = e.data;

            setProcessedUsers(prev =>
                prev.map(user => {
                    if (user.username !== username) return user;

                    return {
                        ...user,
                        posts: user.posts.map(post => {
                            if (post.t3 !== t3) return post;

                            return {
                                ...post,
                                filteredMedia: post.media.filter(m => !media.includes(m)),
                                media
                            };
                        })
                    };
                })
            );
        };

        return () => workerRef.current.terminate();
    }, []);

    function checkImageDuplication(preProcessedUsers) {
        preProcessedUsers.forEach(user => {
            user.posts.forEach(post => {
                if (post.media.length > 1) { // Only run duplicate check if at least 2 media items
                    workerRef.current.postMessage({
                        username: user.username,
                        t3: post.t3,
                        media: post.media
                    });
                }
            });
        });
    }
    // ----- END Image Duplication ----- 

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
            .map(u => {
                let filteredPosts = u.posts.filter(p => postDisplayFilter(settings, { ...p, highlighted: u.highlighted }));

                if (isUserOutdatedFromPosts(filteredPosts, settings)) return undefined;

                return {
                    ...u,
                    posts: filteredPosts
                };
            })
            .filter(u => u !== undefined);
        switch (settings[SettingSort.fieldName]) {
            case SortOptionNew.settingValue:
                return [...filtered].sort(
                    (a, b) => (b.posts.length === 0 ? new Date(0) : b.posts[0].date)
                        - (a.posts.length === 0 ? new Date(0) : a.posts[0].date)
                );
            case SortOptionPostCount.settingValue:
                return [...filtered].sort((a, b) => b.posts.length - a.posts.length);
            default:
                console.log('Unknown sort option, defaulting to New');
                return [...filtered].sort(
                    (a, b) => (b.posts.length === 0 ? new Date(0) : b.posts[0].date)
                        - (a.posts.length === 0 ? new Date(0) : a.posts[0].date)
                );
        }
    }

    const usersDisplay = useMemo(() => <>
        {toDisplay.map(user =>
            <User
                key={user.username}
                processedUser={user}
                settings={settings}
                setProcessedUsers={setProcessedUsers}
                setFilters={setFilters}
                setPopOutMedia={setPopOutMedia}
            />
        )}
    </>, [toDisplay]);

    return <div id="body" className={headerMinimized ? 'headerMin' : ''} ref={containerRef}>
        {usersDisplay}
    </div>;
}
