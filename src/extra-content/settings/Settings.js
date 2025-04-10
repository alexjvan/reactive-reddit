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
        subs.map(s => s.name).sort(),
        [subs]
    );
    const sortedFilters = useMemo(() =>
        filters.map(f => f.filter + " [" + f.category + "]").sort(),
        [filters]
    );

    function removeSub(sub) {
        setSubs((current) => current.filter((s) => s.name !== sub));
    }

    function removeFilter(filter) {
        let parsed = filter.split(' [')[0];
        setFilters((current) => current.filter((f) => f.filter !== parsed));
    }

    // TODO: Actual settings
    //      - Auto-refresh

    // TODO: Rewrite SettingsSection to handle "extra info", ex: filters' category
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
