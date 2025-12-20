import {
    FilterCategoryAuthor,
    FilterCategoryTag,
    FilterCategoryText,
    FilterCategoryTitle,
    FilterTagStart,
    FilterTagEnd
} from "./constants";

export function addNewFilter(settings, newFilter, setFilters, setProcessedUsers) {
    let count = 0;
    setProcessedUsers(prev => prev.map(u => {
        let newlyFilteredPosts = [];

        u.posts = u.posts
            .map(p => {
                let applicable = addFiltersAsRequested(settings, [newFilter], p, true);

                if (applicable.length > 0) {
                    count++;
                    p.processed = true;
                    newlyFilteredPosts.push({
                        filteredFor: [newFilter],
                        post: p
                    });
                    return undefined;
                } else {
                    return p;
                }
            })
            .filter(p => p !== undefined);
        u.earliestPost = u.posts.length > 0
            ? u.posts[0].date
            : new Date(0)
        if (settings.addAllFiltersPossible) {
            u.filteredPosts = (u.filteredPosts ?? []).map(pCombo => {
                let applicable = addFiltersAsRequested(settings, [newFilter], pCombo.post, true);

                if (applicable) {
                    pCombo.filteredFor = [...pCombo.filteredFor, newFilter];
                }

                return pCombo;
            });
        }
        u.filteredPosts = [...(u.filteredPosts ?? []), ...newlyFilteredPosts];

        return u;
    }));

    newFilter.count = count;
    setFilters((prev) => [
        ...prev,
        newFilter
    ]);
}

export function addFiltersAsRequested(settings, filters, post, isProcessed) {
    const result = [];

    if ((filters ?? []).length > 0) {
        for (const filter of filters) {
            if (!shouldAddFilter(filter, post, isProcessed)) continue;

            result.push(filter.filter);

            if (!settings.addAllFiltersPossible) break;
        }
    }

    return result;
}

function shouldAddFilter(filter, post, isProcessed) {
    const { category, desired, filter: filterText } = filter;

    if (category === FilterCategoryTag) {
        const tags = isProcessed
            ? new Set((post.tags ?? []).map(t => t.item.toLowerCase()))
            : new Set([
                ...(post.link_flair_richtext?.map(t => t.t.toLowerCase()) || []),
                ...(post.link_flair_text ? [post.link_flair_text.toLowerCase()] : [])
            ]);

        return desired ? !tags.has(filterText.toLowerCase()) : tags.has(filterText.toLowerCase());
    } else if (category === FilterCategoryAuthor) {
        let authorMatch = isProcessed
            ? post.user
            : post.author === filterText;
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

    const checkContent = category
        .split('||')
        .map(c => getTextContent(c, post, isProcessed))
        .join('');
    let anyMatch = filterText.toLowerCase()
        .split('||')
        .some(f => checkContent.includes(f));

    return desired !== anyMatch;
}

function getTextContent(category, post, isProcessed) {
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
            content = (isProcessed ? post.text.join('\n') : post.selftext)?.toLowerCase() || '';
            break;
        default:
            console.log(`Unknown filter category, defaulting to false. Category: ${category}`);
            return false; // Invalid category
    }

    return FilterTagStart + content + FilterTagEnd;
}
