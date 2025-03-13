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
    const containerRef = useRef(null);
    const scrollPosition = useRef(0);

    // TODO: This does NOT work, but its better than before so I am keeping it.
    // Save scroll position before unmounting or re-rendering
    useEffect(() => {
        const handleScroll = () => {
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
        posts
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

    return (
        <div id="body" ref={containerRef}>
            {Object.entries(users).map(([username, usersPosts]) => (
                <User 
                    key={username}
                    username={username}
                    usersPosts={usersPosts}
                    posts={posts}
                    setPosts={setPosts}
                    setFilters={setFilters}
                    minimizedUsers={minimizedUsers}
                    setMinimizedUsers = {setMinimizedUsers}
                />
            ))}
        </div>
    );
}
