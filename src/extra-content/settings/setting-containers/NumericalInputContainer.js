import { DefaultSettings } from "../../../app/constants";

export default function NumericalInputContainer({
    settings,
    setSettings,
    settingInfo
}) {
    return <div className="settings-setcontainer">
        <input
            type='number'
            value={settings[settingInfo.fieldName] ?? DefaultSettings[settingInfo.fieldName]}
            onChange={(e) =>
                setSettings(current => ({
                    ...current,
                    [settingInfo.fieldName]: (e.target.value === "" || e.target.value < 0) ? DefaultSettings[settingInfo.fieldName] : e.target.value,
                }))
            }
            name={settingInfo.fieldName}
            className="settings-numberinput"
        />

        <div className='settings-label'>
            <div className='settingslabel-title'>
                {settingInfo.title}
            </div>
            <div className='settingslabel-description'>
                {settingInfo.description}
            </div>
            <div className='setingslabel-default'>
                Default: {DefaultSettings[settingInfo.fieldName]}
            </div>
        </div>
    </div>;
}