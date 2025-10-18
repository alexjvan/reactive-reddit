import './SettingsContainer.css';
import { DefaultSettings } from "../../../app/constants";

export default function CheckboxContainer({
    settings,
    setSettings,
    settingInfo
}) {
    return <div className="settings-setcontainer">
        <input
            type="checkbox"
            checked={settings[settingInfo.fieldName] ?? DefaultSettings[settingInfo.fieldName]}
            onChange={() =>
                setSettings(current => ({
                    ...current,
                    [settingInfo.fieldName]: !current[settingInfo.fieldName],
                }))
            }
            name={settingInfo.fieldName}
            className="settings-checkbox"
        />

        <div className='settings-label'>
            <div className='settingslabel-title'>
                {settingInfo.title}
            </div>
            <div className='settingslabel-description'>
                {settingInfo.description}
            </div>
            <div className='setingslabel-default'>
                Default: {DefaultSettings[settingInfo.fieldName] ? 'On' : 'Off'}
            </div>
        </div>
    </div>;
}