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
    delete post.num_comments;

    // Crosspost
    delete post.is_crosspostable;
    delete post.num_crossposts;

    // Gilds
    delete post.gilded;
    delete post.gildings;

    // Media
    delete post.gallery_data;
    delete post.is_gallery;
    delete post.is_original_content;
    delete post.is_reddit_media_domain;
    delete post.media_only;
    delete post.thumbnail;

    // Post Data -- Categorize?
    delete post.created;
    delete post.id;
    delete post.post_hint;
    delete post.selftext_html;

    // Post Type
    delete post.archived;
    delete post.clicked;
    delete post.edited;
    delete post.hidden;
    delete post.is_created_from_ads_ui;
    delete post.locked;
    delete post.over_18;
    delete post.pinned;
    delete post.quarantine;
    delete post.saved;
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

    delete post.view_count;
    delete post.can_mod_post;
    delete post.pwls;
    delete post.link_flair_css_class;
    delete post.is_meta;
    delete post.category;
    delete post.content_categories;
    delete post.is_self;
    delete post.mod_note;
    delete post.link_flair_type;
    delete post.wls;
    delete post.domain;
    delete post.suggested_sort;
    delete post.no_follow;
    delete post.link_flair_template_id;
    delete post.can_gild;
    delete post.spoiler;
    delete post.treatment_tags;
    delete post.distinguished;
    delete post.is_robot_indexable;
    delete post.discussion_type;
    delete post.send_replies;
    delete post.contest_mode;
    delete post.stickied;

    return post;
}