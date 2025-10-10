import { useMemo, useState } from 'react';
import './Post.css';
import MediaContainer from './MediaContainer';
import TextDisplay from './TextDisplay';

export default function Post({
    imageCache,
    setImageCache,
    postObj,
    setPosts,
    disablePost
}) {
    const [disabled, setDisabled] = useState(postObj.disabled ?? false);
    const [minimized, setMinimized] = useState(false);

    let text = postObj.selftext
        ? postObj.selftext
        : postObj.crosspost_parent_list
            ? postObj.crosspost_parent_list[0]
                ? postObj.crosspost_parent_list[0].selftext
                : undefined
            : undefined;
    const [mediaText, setMediaText] = useState([]);

    const textDisplay = useMemo(() =>
        <TextDisplay
            setPosts={setPosts}
            postText={text}
            setMediaText={setMediaText}
            t3={postObj.name}
        />,
        [postObj.name, text]
    );

    const mediaContainer = useMemo(() =>
        <MediaContainer
            imageCache={imageCache}
            setImageCache={setImageCache}
            textMedia={mediaText}
            postObj={postObj}
            setPosts={setPosts}
        />,
        [postObj, mediaText]
    );

    function toggleMinimized() {
        setMinimized((prev) => !prev);
    }

    function disable() {
        setDisabled((prev) => !prev);
        disablePost(postObj.name);
    };

    const isHidden = disabled || postObj.filteredFor.length > 0;

    const date = new Date(postObj.created_utc * 1000);
    const displayDate = date.toLocaleString();
    const url = postObj.permalink ? `https://www.reddit.com${postObj.permalink}` : postObj.url;

    const tags = getTags();

    function getTags() {
        if (postObj.link_flair_richtext.length > 0) {
            return postObj.link_flair_richtext.map((flair) => {
                return {
                    background: postObj.link_flair_background_color,
                    item: flair.t,
                    tag: postObj.link_flair_text_color
                };
            });
        }

        if (postObj.link_flair_text) {
            return [{
                background: postObj.link_flair_background_color,
                item: postObj.link_flair_text,
                tag: postObj.link_flair_text_color
            }];
        }

        return [];
    }

    return (
        !isHidden &&
        <div className="post" style={{ borderColor: `#${postObj.color}` }} data-t3={postObj.name}>
            <div className="post-banner">
                <div className="post-header">
                    <a className="post-title" href={url} target="_blank" rel="noopener noreferrer">
                        {postObj.title.replaceAll('&amp;', '&')}
                    </a>
                    <div className="post-actions">
                        <button className="post-min" onClick={toggleMinimized}>
                            {minimized ? '+' : '-'}
                        </button>
                        <button className="post-close" onClick={disable}>X</button>
                    </div>
                    <div className="post-info">
                        <div className="post-sub">{postObj.subreddit}</div>
                        <div className="post-info-separator">|</div>
                        <div className="post-time">{displayDate}</div>
                        <div className="post-info-separator">|</div>
                        <div className="post-duplicates">{postObj.duplicates} duplicates</div>
                    </div>
                    {tags.length !== 0 &&
                        <div className='tags-container'>
                            {tags.map((t) =>
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
                        {text && textDisplay}
                        {mediaContainer}
                    </div>
                }
            </div>
        </div>
    );
}
