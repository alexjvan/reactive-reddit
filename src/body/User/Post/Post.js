import './Post.css';
import { useMemo, useState } from 'react';
import MediaContainer from './MediaContainer';

export default function Post({
    postObj,
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

    function createText() {
        return text
            ? text
                  .split('\n')
                  .filter((line) => line.trim() !== '')
                  .map((line) => modLine(line))
            : [];
    }

    const displayText = useMemo(
        () => createText().map((line, index) =>
            line.includes('<a') ?
                <div
                    key={postObj.name + index}
                    dangerouslySetInnerHTML={{ __html: line }}
                    className={line.startsWith('>') ? 'indented' : ''}
                />
                : <p
                    key={postObj.name + index}
                    dangerouslySetInnerHTML={{ __html: line }}
                    className={line.startsWith('>') ? 'indented' : ''}
                />
        ),
        [text]
    );

    const toggleMinimized = () => setMinimized((prev) => !prev);

    const disable = () => {
        setDisabled((prev) => !prev);
        disablePost(postObj.name);
    };

    const isHidden = disabled || postObj.filteredFor.length > 0;

    if (isHidden) return null;

    const date = new Date(postObj.created_utc * 1000);
    const displayDate = date.toLocaleString();
    const url = postObj.permalink ? `https://www.reddit.com${postObj.permalink}` : postObj.url;

    const tags = getTags();

    function getTags() {
        if(postObj.link_flair_richtext.length > 0) {
            return postObj.link_flair_richtext.map((flair) => {
                return {
                    background: postObj.link_flair_background_color,
                    item: flair.t,
                    tag: postObj.link_flair_text_color
                };
            });
        }

        if(postObj.link_flair_text) {
            return [{
                background: postObj.link_flair_background_color,
                item: postObj.link_flair_text,
                tag: postObj.link_flair_text_color
            }];
        }

        return [];
    }

    function modLine(line) {
        let split = line.split('');

        let modded = '';

        let inItalic = false;
        let italicString = '';

        let inLink = false;
        let passedLinkText = false;
        let linkText = '';
        let linkLink = '';

        for(let i = 0; i < split.length; i++) {
            let char = split[i];
            switch(char) {
                case '*':
                    if(inItalic) {
                        modded += '<i>' + italicString + '</i>';
                        italicString = '';
                    }
                    inItalic = !inItalic;
                    break;
                case '[':
                    if(passedLinkText) {
                       linkLink += char;
                    } else if(inLink) {
                        modded += '['+linkText;
                        linkText = '';
                    } else {
                        inLink = true;
                    }
                    break;
                case ']':
                    if(passedLinkText) {
                       linkLink += char;
                    } else if(inLink) {
                        if(split[i + 1] === '(') {
                            passedLinkText = true;
                        } else {
                            modded += '['+linkText+']';
                        }
                    } else {
                        modded += char;
                    }
                    break;
                case '(':
                    if(inLink) {
                        passedLinkText = true;
                    } else {
                        modded += char;
                    }
                    break;
                case ')':
                    if(passedLinkText) {
                        if(
                            linkLink.endsWith('.png') || 
                            linkLink.endsWith('.jpeg') || 
                            linkLink.endsWith('.jpg') ||
                            linkLink.endsWith('.gif')
                        ) {
                            modded += '<a class="findableImage" data-link="'+linkLink+'">'+linkText+'</a>';
                            const tempLink = linkLink;
                            setMediaText((prev) => [...prev, tempLink]);
                            inLink = false;
                            passedLinkText = false;
                            linkText = '';
                            linkLink = '';
                        } else {
                            modded += '['+linkText+']('+linkLink+')';
                            inLink = false;
                            passedLinkText = false;
                            linkText = '';
                            linkLink = '';
                        }
                    } else {
                        modded += char;
                    }
                    break;
                default:
                    if(inItalic) {
                        italicString += char;
                    } else if(passedLinkText) {
                        linkLink += char;
                    } else if(inLink) {
                        linkText += char;
                    } else {
                        modded += char;
                    }
                    break;
            }
        }

        if(passedLinkText) {
            modded += '['+linkText+']('+linkLink;
        } else if(inLink) {
            modded += '['+linkText;
        }
        if(inItalic) modded += '*' + italicString; 

        return modded;
    }

    return (
        <div className="post" style={{ borderColor: `#${postObj.color}` }} data-t3={postObj.name}>
            <div className="post-banner">
                <div className="post-header">
                    <a className="post-title" href={url} target="_blank" rel="noopener noreferrer">
                        {postObj.title}
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
                        {text && (
                            <div className="post-text">
                                {displayText}
                            </div>
                        )}
                        <MediaContainer 
                            textMedia={mediaText}
                            postObj={postObj}
                        />
                    </div>
                }
            </div>
        </div>
    );
}
