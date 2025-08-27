export function filterCheck(filter, post) {
    const { category, desired, filter: filterText } = filter;

    if (category === 'Tag') {
        const tags = new Set([
            ...(post.link_flair_richtext?.map((t) => t.t.toLowerCase()) || []),
            ...(post.link_flair_text ? [post.link_flair_text.toLowerCase()] : [])
        ]);

        return desired ? !tags.has(filterText.toLowerCase()) : tags.has(filterText.toLowerCase());
    }

    // TODO: The more I look at what I want to add here, I think I am going to need a more comprehensive filter checking system
    //           Will probably end up doing something where I replace filters instead? That may not work with things like length + start though
    // TODO: Multi-source filters
    // TODO: More Variable filters
    //      %opener% tag
    //          ex, %opener%test = %start%test + [test + (test
    //      %closer% (same as above, but for end)
    //      %length%
    //      %imageCount%
    //      %end%
    //      # - number
    //      ~ - any word

    let checkAgainst = '';
    switch (category) {
        case 'Author':
            checkAgainst = post.author?.toLowerCase() || '';
            break;
        case 'Title':
            checkAgainst = post.title?.toLowerCase() || '';
            break;
        case 'Text':
            checkAgainst = post.selftext?.toLowerCase() || '';
            break;
        case 'Text||Title':
            checkAgainst = `${post.title?.toLowerCase() || ''} ${post.selftext?.toLowerCase() || ''}`;
            break;
        default:
            return false; // Invalid category
    }

    const checkingFor = filterText.toLowerCase();

    if (checkingFor.startsWith('%start%')) {
        const check = checkingFor.slice(7);
        return desired ? !checkAgainst.startsWith(check) : checkAgainst.startsWith(check);
    }

    // TODO: && filter
    const matchFound = checkingFor.split('||').some((filterSection) => checkAgainst.includes(filterSection));

    return desired ? !matchFound : matchFound;
}
