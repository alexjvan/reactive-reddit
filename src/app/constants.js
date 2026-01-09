// ---------- Defaults ----------
export const DefaultGroups = [{ name: 'Default', active: true }];

// ---------- Extra Content ----------
export const ExtraContentHelp = 'Help';
export const ExtraContentSettings = 'Settings';
export const ExtraContentStats = 'Stats';
export const AllExtraContent = [ExtraContentSettings, ExtraContentStats, ExtraContentHelp];

// ---------- Filters ----------
export const FilterTagCloser = '%closer%';
export const FilterTagEnd = '%end%';
export const FilterTagOpener = '%opener%';
export const FilterTagStart = '%start%';
export const FilterTagsCloser = [FilterTagEnd, '>', ']', ')', '}'];
export const FilterTagsOpener = [FilterTagStart, '<', '[', '(', '{'];

// ---------- Grabber ----------
export const GrabberCategoryDontRecommendSubs = 'dontRecommendSubs';
export const GrabberCategoryGroups = 'groups';
export const GrabberCategoryFilters = 'filters';
export const GrabberCategoryProcessedUsers = 'processedUsers';
export const GrabberCategoryPosts = 'posts';
export const GrabberCategorySaveData = 'saveData';
export const GrabberCategorySettings = 'settings';
export const GrabberCategorySubs = 'subs';
export const GrabberCategoryUsersSubs = 'usersSubs';

export const GrabberTypeBackfill = 'Backfill';
export const GrabberTypeContinual = 'Continual';
export const GrabberTypeSavior = 'Savior';

// ---------- Header ----------
export const FilterCategorySub = 'Subs';

export const FilterCategoryAuthor = 'Author';
export const FilterCategoryTag = 'Tag';
export const FilterCategoryText = 'Text';
export const FilterCategoryTextOrTitle = 'Text||Title';
export const FilterCategoryTitle = 'Title';
export const AllFilterCategories = [FilterCategoryAuthor, FilterCategoryTag, FilterCategoryText, FilterCategoryTextOrTitle, FilterCategoryTitle];

// ---------- Media ----------
export const ImageSuffixes = ['.jpeg', '.jpg', '.gif', '.png'];
export const VideoSuffixes = ['.mp4', '.webm'];

// ---------- Post Types ----------
export const PostTypeAll = {
    settingValue: 'all',
    displayValue: 'All'
};
export const PostTypeWithMedia = {
    settingValue: 'withMedia',
    displayValue: 'With Media'
};
export const PostTypeMediaOnly = {
    settingValue: 'mediaOnly',
    displayValue: 'Media Only'
};
export const PostTypeTextOnly = {
    settingValue: 'textOnly',
    displayValue: 'Text Only'
};
const _allPostTypes = [PostTypeAll, PostTypeWithMedia, PostTypeMediaOnly, PostTypeTextOnly];
export const AllPostTypes = _allPostTypes.map(pt => pt.settingValue);
export const DisplayablePostTypes = _allPostTypes;

// ---------- Save Data ----------
// These are for the iteration values for items that need to happen once after data has already been saved/processed
// Changes:
// --= Global =--
// --= Subs =--
// --= Filters =--
// --= Posts =--
// --= Processed Users =--
// --= Don't Recommend Subs =--
export const DefaultSaveData = '0.0.0.0.0.0';

// ---------- Settings ----------
export const SettingAddAllFiltersPossible = {
    fieldName: 'addAllFiltersPossible',
    title: 'Add All Filters Possible',
    description: 'Adding all filters possible will add some time upon retrieval, but can eliminate some when removing filters in-use.',
    default: false
};
export const SettingCommonKeywordsIgnoreLength = {
    fieldName: 'commonKeywordsIgnoreLength',
    title: 'Common Keywords Ignore Length',
    description: 'When finding common keywords in titles (see Stats), max size of word to ignore. This helps ignore common words like \'the\'.',
    default: 3
};
export const SettingGrabIntervalInMinutes = {
    fieldName: 'grabIntervalInMinutes',
    title: 'Grab Interval In Minutes',
    description: 'How often (in minutes) to grab new posts from Reddit. Lower times may cause rate-limiting from Reddit.',
    default: 15
};
export const SettingIgnoreCommonSubsCount = {
    fieldName: 'ignoreCommonSubsCount',
    title: 'Ignore Common Subs Count',
    description: 'How many posts to consider when displaying common subs. Any subs found with less posts won\'t be shown. It\'s recommended to use a higher value for this for readability.',
    default: 25
};
export const SettingRemoveInactiveUserTime = {
    fieldName: 'removeInactiveUserTime',
    title: 'Remove Inactive User Time',
    description: 'How long (in days) a user must not have any new posts before their data is removed.',
    default: 180
};
export const SettingRemoveSubOn404 = {
    fieldName: 'removeSubOn404',
    title: 'Remove Sub on 404 (Not Found)',
    description: 'Remove a sub from the grabber when its not found. This can help performance, but means you will no longer try to get data from this subreddit.',
    default: true
};
export const SettingRetrieveOnSubAddition = {
    fieldName: 'retrieveOnSubAddition',
    title: 'Restart Retrieval on Addition of Sub',
    description: 'Try and restart the grab-loop when a new sub is added. May fix lag, but may cause rate-limiting from Reddit.',
    default: false
};
export const SettingWaitBeforeReGrabbingInMinutes = {
    fieldName: 'waitBeforeReGrabbingInMinutes',
    title: 'Wait Before Re-Grabbing In Minutes',
    description: 'When re-grabbing posts, how far back (in minutes) to go. This helps catch any missed posts, but may cause duplicates.',
    default: 15
};

// ---------- Deleted User ----------
export const DeletedUserNoAction = {
    settingValue: 'noAction',
    displayValue: 'No Action'
};
export const DeletedUserHighlight = {
    settingValue: 'highlight',
    displayValue: 'Highlight User'
};
export const DeletedUserRemove = {
    settingValue: 'remove',
    displayValue: 'Remove User'
};
const _allDeletedUserOptions = [DeletedUserNoAction, DeletedUserHighlight, DeletedUserRemove];
export const AllDeletedUserOptions = _allDeletedUserOptions.map(du => du.settingValue);
export const DisplayableDeletedUserOptions = _allDeletedUserOptions;

// ---------- Settings Pages ----------
export const SettingsPageSettings = 'Settings';
export const SettingsPageContent = 'Page Content';
export const AllSettingsPages = [SettingsPageSettings, SettingsPageContent];

// ---------- Sort Options ----------
export const SortOptionNew = {
    settingValue: 'new',
    displayValue: 'New'
};
export const SortOptionPostCount = {
    settingValue: 'postcount',
    displayValue: 'Post Count'
};
const _allSortOptions = [SortOptionNew, SortOptionPostCount];
export const AllSortOptions = _allSortOptions.map(so => so.settingValue);
export const DisplayableSortOptions = _allSortOptions;

// ---------- Text Modifiers ----------
export const TextModifierBold = 'bold';
export const TextModifierHeader = 'header';
export const TextModifierHeaderPrefix = 'header-';
export const TextModifierIndented = 'indented';
export const TextModifierItalic = 'italic';
export const TextModifierListItem = 'list-item';
export const TextModifierNoTopPadding = 'no-top-padding';

// ====================
// Dependent On Others
// - This category is less sorted alphabetically, and more by dependency
// ====================
// ---------- Settings ----------
export const SettingPostTypes = {
    fieldName: 'postTypes',
    title: 'Post Types',
    description: 'What types of posts to display.',
    options: DisplayablePostTypes,
    default: PostTypeAll.settingValue
};
export const SettingSort = {
    fieldName: 'sort',
    title: 'Sort',
    description: 'How to sort the users in the post-display.',
    options: DisplayableSortOptions,
    default: SortOptionNew.settingValue
};
export const SettingDeletedUserAction = {
    fieldName: 'deletedUserAction',
    title: 'Deleted User Action',
    description: 'What action to take when a user account can no longer be found.',
    options: DisplayableDeletedUserOptions,
    default: DeletedUserNoAction.settingValue
};

// ---------- Default Settings ----------
export const DefaultSettings = {
    [SettingAddAllFiltersPossible.fieldName]: SettingAddAllFiltersPossible.default,
    [SettingCommonKeywordsIgnoreLength.fieldName]: SettingCommonKeywordsIgnoreLength.default,
    [SettingIgnoreCommonSubsCount.fieldName]: SettingIgnoreCommonSubsCount.default,
    [SettingGrabIntervalInMinutes.fieldName]: SettingGrabIntervalInMinutes.default,
    [SettingPostTypes.fieldName]: SettingPostTypes.default,
    [SettingRemoveInactiveUserTime.fieldName]: SettingRemoveInactiveUserTime.default,
    [SettingRemoveSubOn404.fieldName]: SettingRemoveSubOn404.default,
    [SettingRetrieveOnSubAddition.fieldName]: SettingRetrieveOnSubAddition.default,
    [SettingSort.fieldName]: SettingSort.default,
    [SettingWaitBeforeReGrabbingInMinutes.fieldName]: SettingWaitBeforeReGrabbingInMinutes.default,
    [SettingDeletedUserAction.fieldName]: SettingDeletedUserAction.default
};