import React from 'react';
import './ExtraContent.css';
import Settings from './settings/Settings';
import Stats from './stats/Stats';

const MemoizedSettings = React.memo(Settings);
const MemoizedStats = React.memo(Stats);

export default function ExtraContent({
    extraDisplay,
    setExtraDisplay,
    subs,
    setSubs,
    filters,
    setFilters,
    posts
}) {
    function close() {
        setExtraDisplay(null);
    }

    return (extraDisplay &&
        <div id="extrapage">
            <div id="extraheader">
                <div id="extratitle">{extraDisplay}</div>
                <button id="extraclose" className="clickable" onClick={close}>X</button>
            </div>
            <div id="extracontent">
                {extraDisplay === 'Settings' && (
                    <MemoizedSettings 
                        subs={subs}
                        setSubs={setSubs}
                        filters={filters}
                        setFilters={setFilters}
                    />
                )}
                {extraDisplay === 'Stats' && (
                    <MemoizedStats 
                        subs={subs}
                        posts={posts}
                    />
                )}
            </div>
        </div>
    );
}
