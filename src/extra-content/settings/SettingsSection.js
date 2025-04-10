import { useMemo } from 'react';

export default function SettingsSection({
    sectionName,
    displayItem,
    filterFunction
}) {
    const display = useMemo(() =>
        displayItem.map((item) => {
            return <div className="settingsection-item" key={`ss-${item}`}>
                <div className="settingsection-itemname">
                    {item}
                </div>
                <button
                    className="settingsection-itemremove clickable"
                    onClick={() => { filterFunction(item) }}
                >
                    X
                </button>
            </div>;
        }),
        [displayItem]);

    return <div className="settingssection-container">
        <div className="settingsection-title">
            {sectionName}
        </div>
        {display}
    </div>;
}