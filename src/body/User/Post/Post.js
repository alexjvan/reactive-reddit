import { useMemo, useState } from 'react';
import './Post.css';
import MediaContainer from './MediaContainer';
import TextDisplay from './TextDisplay';

export default function Post({
    processedPost,
    setProcessedUsers
}) {
    const [minimized, setMinimized] = useState(false);

    let disabled = processedPost.disabled ?? false;

    const textDisplay = useMemo(() =>
        <TextDisplay
            processedText={processedPost.text}
        />,
        [processedPost]
    );

    const mediaContainer = useMemo(() =>
        <MediaContainer
            t3={processedPost.t3}
            username={processedPost.user}
            processedMedia={processedPost.media}
            setProcessedUsers={setProcessedUsers}
        />,
        [processedPost]
    );

    function toggleMinimized() {
        setMinimized(prev => !prev);
    }

    function disable() {
        setProcessedUsers(prev => prev.map(u => {
            if (u.username == processedPost.user)
                u.posts = u.posts.map(p => {
                    if (p.t3 == processedPost.t3)
                        p.disabled = true;

                    return p;
                });

            return u;
        }));
    };

    const date = new Date(processedPost.date * 1000).toLocaleString();

    // TODO: Update border color + sub name based off of multi-sub enhancement
    return (
        !disabled &&
        <div className="post" style={{ borderColor: `#${processedPost.subs[0].color}` }} data-t3={processedPost.t3}>
            <div className="post-banner">
                <div className="post-header">
                    <div className='post-top'>
                        <a className="post-title" href={processedPost.url} target="_blank" rel="noopener noreferrer">
                            {
                                processedPost.title
                                    .replaceAll('&amp;', '&')
                                    .replaceAll('&lt;', '<')
                                    .replaceAll('&gt;', '>')
                            }
                        </a>
                        <div className="post-actions">
                            <button className="post-min" onClick={toggleMinimized}>
                                {minimized ? '+' : '-'}
                            </button>
                            <button className="post-close" onClick={disable}>X</button>
                        </div>
                    </div>
                    <div className="post-info">
                        <div className="post-sub">{processedPost.subs[0].name}</div>
                        <div className="post-info-separator">|</div>
                        <div className="post-time">{date}</div>
                        <div className="post-info-separator">|</div>
                        <div className="post-duplicates">{processedPost.duplicates} duplicates</div>
                    </div>
                    {processedPost.tags.length !== 0 &&
                        <div className='tags-container'>
                            {processedPost.tags.map(t =>
                                <div
                                    key={`tag-${t}`}
                                    className={`postTag ${t.tag}`}
                                    style={{ backgroundColor: t.background }}
                                >
                                    {t.item}
                                </div>
                            )}
                        </div>
                    }
                </div>
                {!minimized &&
                    <div className="post-contents">
                        {processedPost.text && textDisplay}
                        {mediaContainer}
                    </div>
                }
            </div>
        </div>
    );
}
