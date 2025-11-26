import { useEffect, useMemo, useState } from 'react';
import './User.css';
import Post from './Post/Post.js';
import { FilterCategoryAuthor } from '../../app/constants.js';

export default function User({
    imageCache,
    setImageCache,
    username,
    usersPosts,
    posts,
    setPosts,
    setFilters,
    minimizedUsers,
    setMinimizedUsers
}) {
    const [minimized, setMinimized] = useState((minimizedUsers ?? []).includes(username));

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
        if ((minimizedUsers ?? []).includes(username)) {
            setMinimizedUsers((current) => (current || []).filter((u) => u !== username));
        } else {
            setMinimizedUsers(current => [...(current || []), username]);
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
        const setting = (post.created_utc > duplicate.created_utc) ? post : duplicate;
        const disabling = (setting.name === post.name) ? duplicate : post;

        setPosts((current) => {
            let media_metadata = undefined;
            let preview = undefined;
            let secure_media_embed = undefined;
            let foundDisabling = false;

            const updated = (current || []).map((curpost) => {
                if (curpost.name === setting.name) {
                    return { ...curpost, duplicates: (curpost.duplicates || 0) + (disabling.duplicates || 0) + 1 };
                } else if (curpost.name === disabling.name) {
                    media_metadata = media_metadata ?? curpost.media_metadata;
                    preview = preview ?? curpost.preview;
                    secure_media_embed = secure_media_embed ?? curpost.secure_media_embed;
                    foundDisabling = true;
                    return { ...curpost, disabled: true };
                }
                return curpost;
            });

            if (foundDisabling) {
                return updated.map(p => {
                    if (p.name === setting.name) {
                        return {
                            ...p,
                            media_metadata: { ...(p.media_metadata || {}), ...(media_metadata || {}) },
                            preview: { ...(p.preview || {}), ...(preview || {}) },
                            secure_media_embed: { ...(p.secure_media_embed || {}), ...(secure_media_embed || {}) }
                        };
                    }
                    return p;
                });
            }

            return updated;
        });
    }

    function mergeFields(post, fieldName, otherData) {
        if (!otherData) return post;
        return { ...post, [fieldName]: { ...(post[fieldName] || {}), ...otherData } };
    }

    function disablePost(t3) {
        // This duplicate check was added when I was seeing multiple of the same post
        //    This allowed me to remove one of the duplicates without removing every post
        //    Not 100% sure if this is still necessary, but I don't think it hurts
        let duplicates = posts.filter((post) => post.name === t3).length !== 1;
        setPosts((current) => (current || []).map((post) => {
            if (post.name === t3) {
                if (duplicates) {
                    // If duplicates, disable only non-primary instances
                    // Keep this deterministic by not using a local counter here.
                    return { ...post, disabled: true };
                } else {
                    return { ...post, disabled: true };
                }
            }

            return post;
        }));
    }

    // Use effect to check for duplicate posts based on similarity
    useEffect(() => {
        if (!usersPosts || usersPosts.length < 2) return;

        const workerSource = `
            self.onmessage = function(e) {
                const posts = e.data && e.data.posts ? e.data.posts : [];
                if (!posts || posts.length < 2) {
                    self.postMessage({ type: 'none' });
                    return;
                }

                const validPosts = posts.filter(p => !p.disabled && (!p.filteredFor || p.filteredFor.length === 0));

                for (let i = 0; i < validPosts.length - 1; i++) {
                    const left = validPosts[i];
                    for (let j = i + 1; j < validPosts.length; j++) {
                        const right = validPosts[j];
                        if (left.name === right.name) {
                            self.postMessage({ type: 'disable', name: left.name });
                            return;
                        }

                        if ((left.selftext === '' || left.selftext === null) && (right.selftext === '' || right.selftext === null)) {
                            if (left.title && right.title && left.title === right.title) {
                                self.postMessage({ type: 'duplicate', left: left.name, right: right.name });
                                return;
                            }
                        }

                        const leftText = (left.selftext || '');
                        const rightText = (right.selftext || '');
                        if (leftText.length > 0 || rightText.length > 0) {
                            let count = 0;
                            const maxLen = Math.min(100, leftText.length, rightText.length);
                            for (let k = 0; k < maxLen; k++) {
                                if (leftText[k] === rightText[k]) count++;
                            }
                            const similarity = maxLen === 0 ? 0 : (count / maxLen);
                            if (similarity >= 0.85) {
                                self.postMessage({ type: 'duplicate', left: left.name, right: right.name });
                                return;
                            }
                        }
                    }
                }

                self.postMessage({ type: 'none' });
            };
        `;

        const blob = new Blob([workerSource], { type: 'application/javascript' });
        const worker = new Worker(URL.createObjectURL(blob));

        const transferable = (usersPosts || []).map(p => ({
            name: p.name,
            selftext: p.selftext,
            title: p.title,
            disabled: p.disabled,
            filteredFor: p.filteredFor,
            created_utc: p.created_utc
        }));

        worker.postMessage({ posts: transferable });

        worker.onmessage = (ev) => {
            const msg = ev.data;
            if (!msg) return;
            if (msg.type === 'disable') {
                disablePost(msg.name);
            } else if (msg.type === 'duplicate') {
                const left = usersPosts.find(p => p.name === msg.left);
                const right = usersPosts.find(p => p.name === msg.right);
                if (left && right) duplicatePost(left, right);
            }

            worker.terminate();
        };

        return () => worker.terminate();
    }, [usersPosts]);

    let postsDisplay = useMemo(() =>
        usersPosts.map((post) => {
            if (!post.disabled && post.filteredFor.length === 0) {
                return <Post
                    key={post.name}
                    imageCache={imageCache}
                    setImageCache={setImageCache}
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
