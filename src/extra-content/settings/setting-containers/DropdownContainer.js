import './SettingsContainer.css';
import { DefaultSettings } from "../../../app/constants";

export default function DropdownContainer({
    settings,
    setSettings,
    settingInfo,
    enable = true
}) {
    return enable && <div className="settings-setcontainer">
        <select
            value={settings[settingInfo.fieldName] ?? DefaultSettings[settingInfo.fieldName]}
            onChange={(e) =>
                setSettings(current => ({
                    ...current,
                    [settingInfo.fieldName]: e.target.value,
                }))
            }
            name={settingInfo.fieldName}
            className="settings-dropdown"
        >
            {settingInfo.options.map(o =>
                <option key={o.settingValue} value={o.settingValue}>{o.displayValue}</option>
            )}
        </select>

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