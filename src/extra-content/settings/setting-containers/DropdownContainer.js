export default function DropdownContainer({
    settings,
    setSettings,
    defaultSettings,
    fieldName,
    options,
    title,
    description
}) {
    return <div className="settings-setcontainer">
        <select
            value={settings[fieldName] ?? defaultSettings[fieldName]}
            onChange={(e) =>
                setSettings((current) => ({
                    ...current,
                    [fieldName]: e.target.value,
                }))
            }
            name={fieldName}
            className="settings-dropdown"
        >
            {options.map((o) =>
                <option key={o.settingValue} value={o.settingValue}>{o.displayValue}</option>
            )}
        </select>

        <div className='settings-label'>
            <div className='settingslabel-title'>
                {title}
            </div>
            <div className='settingslabel-description'>
                {description}
            </div>
            <div className='setingslabel-default'>
                Default: {defaultSettings[fieldName]}
            </div>
        </div>
    </div>;
}