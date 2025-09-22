export default function CheckboxContainer({
    settings,
    setSettings,
    defaultSettings,
    fieldName,
    title,
    description
}) {
    return <div className="settings-setcontainer">
        <input
            type="checkbox"
            checked={settings[fieldName] || defaultSettings[fieldName]}
            onChange={() =>
                setSettings(current => ({
                    ...current,
                    [fieldName]: !current[fieldName],
                }))
            }
            name={fieldName}
            className="settings-checkbox"
        />

        <div className='settings-label'>
            <div className='settingslabel-title'>
                {title}
            </div>
            <div className='settingslabel-description'>
                {description}
            </div>
            <div className='setingslabel-default'>
                Default: {defaultSettings[fieldName] ? 'On' : 'Off'}
            </div>
        </div>
    </div>;
}