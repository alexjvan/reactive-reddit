import { useEffect, useMemo, useRef } from 'react';
import './Body.css';
import User from './User/User';
import { PostTypeAll, SortOptionNew, SortOptionPostCount } from '../app/constants';

export default function Body({
    settings,
    posts,
    setPosts,
    setFilters,
    minimizedUsers,
    setMinimizedUsers
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
    });

    const users = useMemo(() => {
        let usersMap = (posts ?? [])
            .filter(filterDisplay)
            .sort((a, b) => b.created_utc - a.created_utc)
            .reduce((currentUsers, post) => {
                const username = post.author;
                if (!currentUsers[username]) currentUsers[username] = [];
                currentUsers[username].push(post);
                return currentUsers;
            }, {});

        let sorted = Object.entries(usersMap).sort((userA, userB) => sortUsers(userA, userB));

        return Object.fromEntries(sorted);
    },
        [posts, settings.sort]
    );

    function filterDisplay(post) {
        if (post.disabled) return false;
        if (post.filteredFor.length > 0) return false;

        switch (settings.postTypes) {
            case PostTypeAll.settingValue:
                return true;
            // TODO: Add filter options
            //    How do I actually determine if a post has media?
            //        Since there is post-processing on the text, I would need to have that available?
            //        Do I need the post-processing for this?
            //        An idea for that now is then to set text display + media display into the post itself, while keeping the originasl content
            //        That way I can use that, unless the text/media changes somehow
            default:
                console.log('Unknown post type filter, defaulting to All');
                return true;
        }
    }

    function sortUsers(userA, userB) {
        switch (settings.sort) {
            case SortOptionNew.settingValue:
                return 0;
            case SortOptionPostCount.settingValue:
                return userB[1].length - userA[1].length;
            default:
                console.log('Unknown sort option, defaulting to New');
                return 0;
        }
    }

    const usersDisplay = useMemo(() =>
        Object.entries(users).map(([username, usersPosts]) => (
            <User
                key={username}
                username={username}
                usersPosts={usersPosts}
                posts={posts}
                setPosts={setPosts}
                setFilters={setFilters}
                minimizedUsers={minimizedUsers}
                setMinimizedUsers={setMinimizedUsers}
            />
        )),
        [users]);

    return <div id="body" ref={containerRef}>
        {usersDisplay}
    </div>;
}
