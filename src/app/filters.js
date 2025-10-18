import { 
    FilterCategoryAuthor, 
    FilterCategoryTag, 
    FilterCategoryText, 
    FilterCategoryTitle,
    FilterTagStart,
    FilterTagEnd
} from "./constants";

export function addNewFilter(settings, newFilter, setFilters, setPosts) {
    let count = 0;
    setPosts((prev) => prev.map((post) => {
        if (!settings.addAllFiltersPossible && post.filteredFor.length > 0 || post.disabled)
            return post;

        let applicable = addApplicableFilter([newFilter], post);

        if(applicable.length > 0) {
            post.filteredFor = [...post.filteredFor, applicable];
            count++;
        }

        return post;
    }));
    newFilter.count = count;
    setFilters((prev) => [
        ...prev,
        newFilter
    ]);
}

export function addFiltersAsRequested(settings, filters, post) {
    return settings.addAllFiltersPossible 
        ? addAllApplicableFilters(filters, post)
        : addApplicableFilter(filters, post);
}

function addAllApplicableFilters(filters, post) {
    return (filters ?? [])
        .filter(filter => shouldAddFilter(filter, post))
        .map(filter => filter.filter);
}

function addApplicableFilter(filters, post) {
    var foundFilter = undefined;
    (filters ?? []).find((filter) => {
        var check = shouldAddFilter(filter, post);
        if (check) foundFilter = filter;

        return check;
    });
    return foundFilter ? [foundFilter.filter] : [];
}

function shouldAddFilter(filter, post) {
    const { category, desired, filter: filterText } = filter;

    if (category === FilterCategoryTag) {
        const tags = new Set([
            ...(post.link_flair_richtext?.map((t) => t.t.toLowerCase()) || []),
            ...(post.link_flair_text ? [post.link_flair_text.toLowerCase()] : [])
        ]);

        return desired ? !tags.has(filterText.toLowerCase()) : tags.has(filterText.toLowerCase());
    } else if(category === FilterCategoryAuthor) {
        let authorMatch = post.author === filterText;
        return desired !== authorMatch;
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
            Subthough: Maybe complex-filters? Text||Title wants Solved&&Help?
                But why wouldn't you just do Text||Title wants Solved + Text||Title wants Help?
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
        case FilterCategoryTitle:
            content = post.title
                ?.toLowerCase()
                .replaceAll('&amp;', '&')
                .replaceAll('&lt;', '<')
                .replaceAll('&gt;', '>')
                .replaceAll('’', '\'') || '';
            break;
        case FilterCategoryText:
            content = post.selftext?.toLowerCase() || '';
            break;
        default:
            console.log(`Unknown filter category, defaulting to false. Category: ${category}`);
            return false; // Invalid category
    }

    return FilterTagStart + content + FilterTagEnd;
}

function filterMatches(filterText, checkAgainst) {
    return checkAgainst.includes(filterText);
}
