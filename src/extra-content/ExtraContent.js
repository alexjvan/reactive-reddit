import React from 'react';
import './ExtraContent.css';
import Settings from './settings/Settings';
import Stats from './stats/Stats';
import { useMemo } from 'react';

export default function ExtraContent({
    extraDisplay,
    setExtraDisplay,
    subs,
    setSubs,
    filters,
    setFilters,
    posts
}) {
    const settings = useMemo(() => {
        return <Settings
            subs={subs}
            setSubs={setSubs}
            filters={filters}
            setFilters={setFilters}
        />;
    }, [subs, setSubs, filters, setFilters]);

    const stats = useMemo(() => {
        return <Stats
            subs={subs}
            posts={posts}
        />;
    }, [subs, posts]);

    // TODO: Whatever I come up with for the extra section, I will want to make it scrollable

    return (extraDisplay &&
        <div id="extrapage">
            <div id="extraheader">
                <div id="extratitle">{extraDisplay}</div>
                <button id="extraclose" className="clickable" onClick={() => setExtraDisplay(null)}>X</button>
            </div>
            <div id="extracontent">
                {extraDisplay === 'Settings' && settings}
                {extraDisplay === 'Stats' && stats}
            </div>
        </div>
    );
}
