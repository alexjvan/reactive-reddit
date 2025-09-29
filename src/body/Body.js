import './Body.css';
import User from './User/User';
import { useEffect, useMemo, useRef } from 'react';

export default function Body({
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

    const users = useMemo(() =>
        (posts ?? [])
            .filter((p) => (!p.disabled && p.filteredFor.length === 0))
            .sort((a, b) => b.created_utc - a.created_utc)
            .reduce((currentUsers, post) => {
                const username = post.author;
                if (!currentUsers[username]) currentUsers[username] = [];
                currentUsers[username].push(post);
                return currentUsers;
            }, {}),
        [posts]
    );

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
