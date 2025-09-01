import { useMemo } from 'react';
import './Settings.css';
import './SettingsSection.js';
import SettingsSection from './SettingsSection.js';
import { addApplicableFilter } from '../../app/filters.js';

export default function Settings({
    subs,
    setSubs,
    filters,
    setFilters,
    setPosts
}) {
    const sortedSubs = useMemo(() =>
        subs.map(s => s.name).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())),
        [subs]
    );
    const sortedFilters = useMemo(() =>
        filters.map(f => `${f.filter} [${f.category}]`).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())),
        [filters]
    );

    function removeSub(sub) {
        setSubs((current) => current.filter((s) => s.name !== sub));
    }

    function removeFilter(filter) {
        let parsed = filter.split(' [')[0];
        setFilters((current) => current.filter((f) => f.filter !== parsed));
        // TODO: All of these add-filter checks are the same. Should probably make this a separate function
        setPosts((prev) => prev.map((post) => {
            var oldFilteredLength = post.filteredFor;

            post.filteredFor = post.filteredFor.filter((f) => f !== parsed);

            // Only try to add new filters if there was a filter before
            if (post.filteredFor.length === 0 && oldFilteredLength === 1) {
                post.filteredFor = addApplicableFilter(filters, post);
            }

            return post;
        }));
    }

    // TODO: Actual settings
    //      - Auto-refresh

    // TODO: Groups
    //    - Remove groups
    //    - Transfer subs to different groups

    // TODO: Rewrite SettingsSection to handle "extra info", ex: filters' category
    // TODO: "Clear All" button
    // TODO: Filter wants are not being represented
    return <div id="settings">
        <SettingsSection
            sectionName={"Subs"}
            displayItem={sortedSubs}
            filterFunction={removeSub}
        />
        <SettingsSection
            sectionName={"Filters"}
            displayItem={sortedFilters}
            filterFunction={removeFilter}
        />
    </div>;
}
