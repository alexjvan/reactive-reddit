import { useMemo } from 'react';
import './SettingsSection.css';
import { addFiltersAsRequested } from '../../app/filters.js';

export default function GroupInternalsDisplay({
    settings,
    subs,
    setSubs,
    filters,
    setFilters,
    setPosts,
    postsPerSub,
    clearFilters
}) {
    const sortedSubs = useMemo(() =>
        (subs ?? [])
            .map(s => s.name)
            .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
            .map((item) => {
                return <div className="settingsection-item" key={`ss-${item}`}>
                    <div className="settingsection-itemname">
                        {item}
                    </div>
                    <div className='settingsection-count'>
                        {postsPerSub.find(p => p.sub.toLowerCase() === item.toLowerCase())?.count || 0}
                    </div>
                    <button
                        className="settingsection-itemremove clickable"
                        onClick={() => { removeSub(item) }}
                    >
                        X
                    </button>
                </div>;
            }),
        [subs]
    );

    const sortedFilters = useMemo(() =>
        (filters ?? [])
            .sort((a, b) => a.filter.toLowerCase().localeCompare(b.filter.toLowerCase()))
            .map((filter) => {
                return <div className="settingsection-item" key={`ss-${filter.filter + filter.category}`}>
                    <div className="settingsection-itemname">
                        <div className={'settingsection-filterdesired ' + (filter.desired)}></div>
                        {filter.filter}
                    </div>
                    <div className='settingsection-filterCategory'>
                        {filter.category}
                    </div>
                    <div className='settingsection-filterCount'>
                        {filter.count}
                    </div>
                    <button
                        className="settingsection-itemremove clickable"
                        onClick={() => { removeFilter(filter.filter) }}
                    >
                        X
                    </button>
                </div>;
            }),
        [filters]
    );

    function removeSub(sub) {
        setSubs((current) => current.filter((s) => s.name !== sub));
    }

    function removeFilter(filter) {
        setFilters((current) => current.filter((f) => f.filter !== filter));
        setPosts((prev) => prev.map((post) => {
            var oldFilteredLength = post.filteredFor;

            post.filteredFor = post.filteredFor.filter((f) => f !== filter);

            // Only try to add new filters if there was a filter before
            if (post.filteredFor.length === 0 && oldFilteredLength === 1) {
                post.filteredFor = addFiltersAsRequested(settings, filters, post);

                if (post.filteredFor.length > 0) {
                    setFilters((prev) => prev.map((filter) => {
                        filter.count = filter.count + (post.filteredFor.includes(filter.filter) ? 1 : 0);
                        return filter;
                    }));
                }
            }

            return post;
        }));
    }

    return <div className='settings-panel'>
        <div className="settingssection-container">
            <div className="settingsection-title">
                <div className='settingsection-title-name'>
                    Subs
                </div>
                <button
                    className="settingsection-title-clear clickable"
                    onClick={() => { setSubs([]) }}
                >
                    Clear
                </button>
            </div>
            <div className='settings-listcontainer'>
                {sortedSubs}
            </div>
        </div>
        <div className="settingssection-container">
            <div className="settingsection-title">
                <div className='settingsection-title-name'>
                    Filters
                </div>
                <button
                    className="settingsection-title-clear clickable"
                    onClick={() => { clearFilters() }}
                >
                    Clear
                </button>
            </div>
            <div className='settings-listcontainer'>
                {sortedFilters}
            </div>
        </div>
    </div>;
}