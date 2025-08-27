import { useMemo } from 'react';
import './Settings.css';
import './SettingsSection.js';
import SettingsSection from './SettingsSection.js';

export default function Settings({
    subs,
    setSubs,
    filters,
    setFilters
}) {
    const sortedSubs = useMemo(() =>
        subs.map(s => s.name).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())),
        [subs]
    );
    const sortedFilters = useMemo(() =>
        filters.map(f => f.filter + " [" + f.category + "]").sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())),
        [filters]
    );

    function removeSub(sub) {
        setSubs((current) => current.filter((s) => s.name !== sub));
    }

    function removeFilter(filter) {
        let parsed = filter.split(' [')[0];
        setFilters((current) => current.filter((f) => f.filter !== parsed));
        // TODO: If you remove a filter, it should re-check all posts to see if they should be un-filtered
        //      this is /super/ helpful for when you accidentally add a filter in (whoops :D)
    }

    // TODO: Actual settings
    //      - Auto-refresh

    // TODO: Groups
    //    - Remove groups
    //    - Transfer subs to different groups

    // TODO: Rewrite SettingsSection to handle "extra info", ex: filters' category
    // TODO: "Clear All" button
    // TODO: Filter wants are being represented
    return (
        <div id="settings">
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
        </div>
    );
}
