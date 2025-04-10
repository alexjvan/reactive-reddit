export function filterCheck(filter, post) {
    const { category, desired, filter: filterText } = filter;

    if (category === 'Tag') {
        const tags = new Set([
            ...(post.link_flair_richtext?.map((t) => t.t.toLowerCase()) || []),
            ...(post.link_flair_text ? [post.link_flair_text.toLowerCase()] : [])
        ]);

        return desired ? !tags.has(filterText.toLowerCase()) : tags.has(filterText.toLowerCase());
    }

    // TODO: Multi-source filters
    // TODO: More Variable filters
    //      %opener% tag
    //          ex, %opener%test = %start%test + [test + (test
    //      %length%
    //      %imageCount%

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

    // Optimize `%start%` handling
    if (checkingFor.startsWith('%start%')) {
        const check = checkingFor.slice(7);
        return desired ? !checkAgainst.startsWith(check) : checkAgainst.startsWith(check);
    }

    // Optimize `||` filtering with `.some()`
    const matchFound = checkingFor.split('||').some((filterSection) => checkAgainst.includes(filterSection));

    return desired ? !matchFound : matchFound;
}