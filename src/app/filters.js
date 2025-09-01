export function addApplicableFilter(filters, post) {
    var foundFilter = undefined;
    (filters ? filters : []).find((filter) => {
        var check = shouldAddFilter(filter, post);
        if (check) foundFilter = filter;

        return check;
    });
    return foundFilter ? [foundFilter.filter] : [];
}

function shouldAddFilter(filter, post) {
    const { category, desired, filter: filterText } = filter;

    if (category === 'Tag') {
        const tags = new Set([
            ...(post.link_flair_richtext?.map((t) => t.t.toLowerCase()) || []),
            ...(post.link_flair_text ? [post.link_flair_text.toLowerCase()] : [])
        ]);

        return desired ? !tags.has(filterText.toLowerCase()) : tags.has(filterText.toLowerCase());
    }

    // TODO: More Variable filters
    //      %length%
    //      %imageCount%
    //      # - number
    //      ~ - any word
    // TODO: && filter

    /*
        Thoughts on these TODOs:
        2. Length + image count are both going to be evaluative, so that will likely need to be custom logic.
            The filters for these are going to be things like %length% > 15. Need a way to actually evaluate this
        3. #, ~ are going to be weird.
            Idea 1, I change the includes to be regex inclusive, and replace the items with their value?
            Idea 2, add them to evaluative checks, figure that out first
        4. How useful is &&? /Maybe/ for or filters? Don't really see a use case for it? Just add another filter?
    */

    let checkContent = '';
    category.split('||').forEach((c) => {
        checkContent += getTextContent(c, post);
    });

    var lowerFilter = filterText.toLowerCase();
    var split = lowerFilter.split('||');
    var anyMatch = split.some(f => filterMatches(f, checkContent));
    return desired !== anyMatch;
}

function getTextContent(category, post) {
    var content = '';
    switch (category) {
        case 'Author':
            content = post.author?.toLowerCase() || '';
            break;
        case 'Title':
            content = post.title?.toLowerCase() || '';
            break;
        case 'Text':
            content = post.selftext?.toLowerCase() || '';
            break;
        default:
            return false; // Invalid category
    }

    return `%start%${content}%end%`;
}

function filterMatches(filterText, checkAgainst) {
    return checkAgainst.includes(filterText);
}
