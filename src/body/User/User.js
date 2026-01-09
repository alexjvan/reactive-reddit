import { useMemo } from 'react';
import './User.css';
import Post from './Post/Post.js';
import { FilterCategoryAuthor } from '../../app/constants.js';

export default function User({
    processedUser,
    setProcessedUsers,
    setFilters,
    setPopOutMedia
}) {
    let disabled = processedUser.disabled || processedUser.posts.filter(p => !p.disabled).length === 0;
    let minimized = processedUser.minimized ?? false;

    function toggleMind() {
        setProcessedUsers(prev => prev.map(u => {
            if (u.username === processedUser.username)
                u.minimized = !(u.minimized ?? false);

            return u;
        }));
    };

    function disable() {
        setProcessedUsers(prev => prev.map(u => {
            if (u.username === processedUser.username)
                u.disabled = true;

            return u;
        }));
    };

    function block() {
        let newFilter = {
            category: FilterCategoryAuthor,
            filter: processedUser.username,
            desired: false,
            count: 0
        };
        setFilters(prev => [
            ...prev,
            newFilter
        ]);
        disable();
    };

    let postsDisplay = useMemo(() =>
        <>
            {(processedUser.posts || []).map(post =>
                <Post
                    key={post.t3}
                    processedPost={post}
                    setProcessedUsers={setProcessedUsers}
                    setPopOutMedia={setPopOutMedia}
                />
            )}
        </>,
        [processedUser.posts]
    );

    return (!disabled &&
        <div className={"user" + (processedUser.highlighted ? " highlighted" : "")}>
            <div className="user-header">
                <div className="user-info">
                    <div className="username">{processedUser.username}</div>
                    <div className="postCount">[{processedUser.posts.filter(p => !p.disabled).length}]</div>
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
