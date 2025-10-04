import { useEffect, useMemo, useState } from 'react';
import { stringSimilarity } from "string-similarity-js";
import './User.css';
import Post from './Post/Post.js';
import { FilterCategoryAuthor } from '../../app/constants.js';

export default function User({
    username,
    usersPosts,
    posts,
    setPosts,
    setFilters,
    minimizedUsers,
    setMinimizedUsers
}) {
    const [minimized, setMinimized] = useState(minimizedUsers.includes(username));

    const disabledPosts = useMemo(() =>
        usersPosts.filter((post) => post.filteredFor.length > 0 || post.disabled).length,
        [usersPosts]
    );

    const disabled = useMemo(() =>
        usersPosts.length - disabledPosts <= 0,
        [usersPosts, disabledPosts]
    );

    function toggleMind() {
        setMinimized(prevState => !prevState);
        if (minimizedUsers.includes(username)) {
            setMinimizedUsers((current) => current.filter((u) => u !== username));
        } else {
            setMinimizedUsers(current => [...current, username]);
        }
    };

    function disable() {
        setPosts((current) => current.filter((p) => p.author !== username));
    };

    function block() {
        let newFilter = {
            category: FilterCategoryAuthor,
            filter: username,
            desired: false,
            count: 0
        };
        setFilters((prev) => [
            ...prev,
            newFilter
        ]);
        disable();
    };

    function duplicatePost(post, duplicate) {
        let setting = (post.created_utc > duplicate.created_utc) ? post : duplicate;
        let disabling = (setting.name === post.name) ? duplicate : post;
        setPosts((current) => current.map((curpost) => {
            if (curpost.name === setting.name)
                curpost.duplicates += disabling.duplicates + 1;
            else if (curpost.name === disabling.name)
                curpost.disabled = true;

            return curpost;
        }));
    }

    function disablePost(t3) {
        let count = 0;
        // This duplicate check was added when I was seeing multiple of the same post
        //    This allowed me to remove one of the duplicates without removing every post
        //    Not 100% sure if this is still necessary, but I don't think it hurts
        let duplicates = posts.filter((post) => post.name === t3).length !== 1;
        setPosts((current) => current.map((post) => {
            if (post.name === t3) {
                if (duplicates && count++ !== 0) {
                    post.disabled = true;
                } else if (!duplicates) {
                    post.disabled = true;
                }
            }

            return post;
        }));
    }

    // Use effect to check for duplicate posts based on similarity
    useEffect(() => {
        const validPosts = usersPosts.filter(post => !post.disabled && post.filteredFor.length === 0);
        for (let i = 0; i < validPosts.length - 1; i++) {
            const left = validPosts[i];
            for (let j = i + 1; j < validPosts.length; j++) {
                const right = validPosts[j];
                if (left.name === right.name) {
                    console.log(`Found duplicate post; t3-wise; ${left.name}, ${right.name}`);
                    disablePost(left.name);
                    return;
                }

                const titleSimilarity = stringSimilarity(left.title, right.title);
                if (left.selftext === "" && right.selftext === "" && titleSimilarity >= 0.90) {
                    console.log(`Found duplicate post; empty text, title-wise; ${left.name}, ${right.name}`);
                    duplicatePost(left, right);
                    return;
                }

                const textSimilarity = stringSimilarity(left.selftext, right.selftext);
                if (textSimilarity >= 0.85) {
                    console.log(`Found duplicate post; text-wise; ${left.name}, ${right.name}`);
                    duplicatePost(left, right);
                    return;
                }
            }
        }
    }, [usersPosts]);

    let postsDisplay = useMemo(() =>
        usersPosts.map((post) => {
            if (!post.disabled && post.filteredFor.length === 0) {
                return <Post
                    key={post.name}
                    postObj={post}
                    setPosts={setPosts}
                    disablePost={disablePost}
                    loading="lazy"
                />;
            }
            return null;
        }),
        [usersPosts]);

    return (!disabled &&
        <div className="user">
            <div className="user-header">
                <div className="user-info">
                    <div className="username">{username}</div>
                    <div className="postCount">[{usersPosts.length - disabledPosts}]</div>
                </div>
                <div className="user-actions">
                    <button className="user-min" onClick={toggleMind}>{minimized ? "+" : "-"}</button>
                    <button className="user-close" onClick={disable}>X</button>
                    <button className='user-block' onClick={block}>Block</button>
                </div>
            </div>
            {!minimized && (
                <div className="postContainer">
                    {postsDisplay}
                </div>
            )}
        </div>
    );
}
