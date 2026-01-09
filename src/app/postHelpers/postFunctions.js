import { stringSimilarity } from "string-similarity-js";
import { alterLink } from './imageHelpers';
import { processPostText } from './textHelpers.js';
import { randSixHash } from "../colors.js";
import { 
    PostTypeAll, 
    PostTypeWithMedia, 
    PostTypeMediaOnly, 
    PostTypeTextOnly,
    SettingPostTypes
} from '../constants';
import { addFiltersAsRequested } from '../filters.js';
import { getSub } from "../subHelpers.js";

export function cleanPost(post) {
    // Approval
    delete post.approved_at_utc;
    delete post.approved_by;

    // Author
    delete post.author_cakeday;
    delete post.author_flair_background_color;
    delete post.author_flair_css_class;
    delete post.author_flair_richtext;
    delete post.author_flair_template_id;
    delete post.author_flair_text;
    delete post.author_flair_text_color;
    delete post.author_flair_type;
    delete post.author_fullname;
    delete post.author_is_blocked;
    delete post.author_patreon_flair;
    delete post.author_premium;
    delete post.send_replies; // If the author wants email replies? Why is this in the post data?

    // Awards
    delete post.all_awardings;
    delete post.awarders;
    delete post.top_awarded_type;
    delete post.total_awards_received;

    // Banning
    delete post.banned_at_utc;
    delete post.banned_by;

    // Comments
    delete post.allow_live_comments;
    delete post.discussion_type;
    delete post.num_comments;

    // Crosspost
    delete post.is_crosspostable;
    delete post.num_crossposts;

    // Experimentation
    delete post.treatment_tags;

    // Flair
    delete post.link_flair_css_class;
    delete post.link_flair_template_id;
    delete post.link_flair_type;

    // Gilds
    delete post.can_gild;
    delete post.gilded;
    delete post.gildings;

    // Media
    delete post.gallery_data;
    delete post.is_gallery;
    delete post.is_original_content;
    delete post.is_reddit_media_domain;
    delete post.media_only;
    delete post.spoiler;
    delete post.thumbnail;

    // Mod
    delete post.can_mod_post;
    delete post.mod_note;
    delete post.suggested_sort;

    // Post Data -- Categorize?
    delete post.created;
    delete post.id;
    delete post.post_hint;
    delete post.selftext_html;
    delete post.view_count;

    // Post Type
    delete post.archived;
    delete post.category;
    delete post.content_categories;
    delete post.clicked;
    delete post.contest_mode;
    delete post.distinguished; // Item to highlight mod posts
    delete post.domain; // What site the post is about? I don't get this one
    delete post.edited;
    delete post.hidden;
    delete post.is_created_from_ads_ui;
    delete post.is_meta;
    delete post.is_self; // Apparently tied to domain. True if domain = reddit
    delete post.locked;
    delete post.over_18;
    delete post.pinned;
    delete post.quarantine;
    delete post.saved;
    delete post.stickied;
    delete post.visited;

    // Removal
    delete post.mod_reason_title;
    delete post.mod_reason_by;
    delete post.removal_reason;
    delete post.removed_by;
    delete post.removed_by_category;

    // Reports
    delete post.user_reports;
    delete post.num_reports;
    delete post.report_reasons;
    delete post.mod_reports;

    // Robots
    delete post.is_robot_indexable;
    delete post.no_follow;

    // Score
    delete post.score;
    delete post.ups;
    delete post.downs;
    delete post.hide_score;
    delete post.likes;
    delete post.upvote_ratio;

    // Sub
    delete post.subreddit_id;
    delete post.subreddit_name_prefixed;
    delete post.subreddit_subscribers;
    delete post.subreddit_type;

    // Thumbnail
    delete post.thumbnail_height;
    delete post.thumbnail_width;

    // Whitelist
    delete post.pwls;
    delete post.wls;

    return post;
}

export function postIntake(post, settings, filters, subs) {
    return function updateProcessedUsers(prev) {
        let processing = post;
        if ((processing.crosspost_parent_list ?? []).length > 0)
            processing = processing.crosspost_parent_list[0];

        const processingUsername = processing.author;
        const existingUser = prev.find(u => u.username === processingUsername);

        let user;

        if (existingUser) {
            // Check duplicates
            const duplicateIndex = existingUser.posts.findIndex(p => isPostDuplicateOfProcessed(processing, p));

            if (duplicateIndex !== -1) {
                const targetPost = existingUser.posts[duplicateIndex];

                const updatedPost = {
                    ...targetPost,
                    date: (targetPost.date > processing.created_utc) ? targetPost.date : processing.created_utc,
                    duplicates: targetPost.duplicates + 1,
                    subs: targetPost.subs.some(s => s.name === processing.subreddit)
                        ? targetPost.subs
                        : [
                            ...targetPost.subs,
                            { name: processing.subreddit, color: processing.color }
                        ]
                };

                return prev.map(u =>
                    u.username !== processingUsername
                        ? u
                        : {
                            ...u,
                            earliestPost: (u.earliestPost > processing.created_utc) ? u.earliestPost : processing.created_utc,
                            posts: u.posts
                                .map((p, i) => i === duplicateIndex ? updatedPost : p)
                                .sort((a, b) => b.date - a.date)
                        }
                );
            }

            user = existingUser;
        } else {
            user = {
                username: processingUsername,
                earliestPost: 0,
                posts: [],
                filteredPosts: []
            };
        }

        const applicableFilters = addFiltersAsRequested(settings, filters, processing, false)
            .filter(f => f != null);

        const newFilteredPosts = applicableFilters.length
            ? [
                ...(user.filteredPosts ?? []),
                {
                    filteredFor: applicableFilters.map(f => f.filter),
                    post: processing
                }
            ]
            : (user.filteredPosts ?? []);

        const newProcessedPosts = applicableFilters.length
            ? user.posts
            : [...user.posts, processPost(processing, subs)].sort(
                (a, b) => b.created_utc - a.created_utc
            );

        const updatedUser = {
            ...user,
            posts: newProcessedPosts,
            filteredPosts: newFilteredPosts,
            earliestPost:
                newProcessedPosts.length > 0
                    ? newProcessedPosts[0].date
                    : 0
        };

        if (existingUser) {
            return prev.map(u =>
                u.username === processingUsername ? updatedUser : u
            );
        } else {
            return [...prev, updatedUser];
        }
    };
}

export function processPost(post, subs) {
    let processedText = processPostText(post.selftext);

    let grabbedMedia = [
        ...processedText.media,
        ...(post.media_metadata
            ? Object.entries(post.media_metadata).map(([_, value]) =>
                value.o
                    ? typeof value.o[0] === "string"
                        ? value.o[0]
                        : value.o[0].u
                    : value.s
                        ? value.s[0]
                        : value.hlsUrl
            )
            : []),
        ...(post.preview
            ? post.preview.images
                ? post.preview.images.map(imgs => imgs.source.url)
                : []
            : []),
        ...(post.preview
            ? post.preview.reddit_video_preview
                ? [post.preview.reddit_video_preview.fallback_url] // Interestingly, this isn't a list?
                : []
            : []),
        ...(post.secure_media_embed
            ? post.secure_media_embed.media_domain_url
                ? [post.secure_media_embed.media_domain_url]
                : post.secure_media_embed.content
                    ? [post.secure_media_embed.content.match(/src="([^"]+)"/)?.[1]].filter(Boolean)
                    : []
            : [])
    ]
        .filter(i => i !== undefined)
        .map(url => alterLink(url, post.author))
        .filter(i => i !== null);

    let sub = getSub(subs, post.subreddit);

    return {
        t3: post.name,
        user: post.author,
        subs: [{
            name: post.subreddit,
            color: sub ? sub.color : randSixHash()
        }],
        url: post.permalink ? `https://www.reddit.com${post.permalink}` : post.url,
        minimied: false,
        title: post.title,
        text: processedText.lines,
        media: [...new Set(grabbedMedia)],
        date: post.created_utc,
        duplicates: 0,
        tags: (post.link_flair_richtext.length > 0)
            ? post.link_flair_richtext.map(flair => {
                return {
                    background: post.link_flair_background_color,
                    item: flair.t ?? "",
                    tag: post.link_flair_text_color
                };
            })
            : post.link_flair_text
                ? [{
                    background: post.link_flair_background_color,
                    item: post.link_flair_text,
                    tag: post.link_flair_text_color
                }]
                : []
    };
}

export function isPostDuplicateOf(checking, against) {
    if (checking.name === against.name) {
        console.log(`Found duplicate post; t3-wise; ${checking.name}, ${against.name}`);
        return true;
    }

    if (checking.selftext === '' && against.selftext === '') {
        const titleSimilarity = stringSimilarity(checking.title, against.title);
        if (titleSimilarity >= 0.90) {
            console.log(`Found duplicate post; empty text, title-wise; ${checking.name}, ${against.name}`);
            return true;
        }
    }

    const textSimilarity = stringSimilarity(checking.selftext, against.selftext);
    if (textSimilarity >= 0.85) {
        console.log(`Found duplicate post; text-wise; ${checking.name}, ${against.name}`);
        return true;
    }

    return false;
}

export function isPostDuplicateOfProcessed(checking, against) {
    if (checking.name === against.t3) {
        console.log(`Found duplicate post; t3-wise; ${checking.name}, ${against.t3}`);
        return true;
    }

    if (checking.selftext === '' && against.text.length === 0) {
        const titleSimilarity = stringSimilarity(checking.title, against.title);
        if (titleSimilarity >= 0.90) {
            console.log(`Found duplicate post; empty text, title-wise; ${checking.name}, ${against.t3}`);
            return true;
        }
    }

    // TODO: This 100% will have differences, need to look into multi-line text comparing
    const textSimilarity = stringSimilarity(checking.selftext, against.text.map(t => t.text).join('\n'));
    if (textSimilarity >= 0.85) {
        console.log(`Found duplicate post; text-wise; ${checking.name}, ${against.t3}`);
        return true;
    }

    return false;
}

export function postDisplayFilter(settings, post, processedPost) {
    if (!processedPost && post.disabled) return false;
    if (!processedPost && post.filteredFor.length > 0) return false;

    if (processedPost) {
        switch (settings[SettingPostTypes.fieldName]) {
            case PostTypeAll.settingValue:
                return true;
            case PostTypeWithMedia.settingValue:
                return post.media.length > 0;
            case PostTypeMediaOnly.settingValue:
                return post.media.length > 0 && post.text.length === 0;
            case PostTypeTextOnly.settingValue:
                return post.text.length > 0 && post.media.length === 0;
            default:
                console.log('Unknown post type filter, defaulting to All; ' + settings[SettingPostTypes.fieldName]);
                return true;
        }
    } else {
        switch (settings[SettingPostTypes.fieldName]) {
            case PostTypeAll.settingValue:
                return true;
            case PostTypeWithMedia.settingValue:
                return post.hasMedia;
            case PostTypeMediaOnly.settingValue:
                return post.hasMedia && !post.hasText;
            case PostTypeTextOnly.settingValue:
                return post.hasText && !post.hasMedia;
            default:
                console.log('Unknown post type filter, defaulting to All; ' + settings[SettingPostTypes.fieldName]);
                return true;
        }
    }
}