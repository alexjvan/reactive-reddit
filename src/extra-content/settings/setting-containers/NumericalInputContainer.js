export default function NumericalInputContainer({
    settings,
    setSettings,
    defaultSettings,
    fieldName,
    title,
    description
}) {
    return <div className="settings-setcontainer">
        <input
            type='number'
            value={settings[fieldName] || defaultSettings[fieldName]}
            onChange={(e) =>
                setSettings(current => ({
                    ...current,
                    [fieldName]: (e.target.value === "" || e.target.value < 0) ? defaultSettings[fieldName] : e.target.value,
                }))
            }
            name={fieldName}
            className="settings-numberinput"
        />

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