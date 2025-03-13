export default function SettingsSection({
    sectionName,
    displayItem,
    filterFunction
}) {
    return <div className="settingssection-container">
        <div className="settingsection-title">
            {sectionName}
        </div>
        {displayItem.map((item) => {
            return <div className="settingsection-item" key={`ss-${item}`}>
                <div className="settingsection-itemname">
                    {item}
                </div>
                <a className="settingsection-itemremove clickable" onClick={() => {filterFunction(item)}}>
                    X
                </a>
            </div>;
        })}
    </div>;
}