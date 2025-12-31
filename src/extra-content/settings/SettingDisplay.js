import './SettingsSection.css';
import CheckboxContainer from "./setting-containers/CheckboxContainer";
import DropdownContainer from "./setting-containers/DropdownContainer";
import NumericalInputContainer from "./setting-containers/NumericalInputContainer";
import {
    DefaultSettings,
    SettingAddAllFiltersPossible,
    SettingCommonKeywordsIgnoreLength,
    SettingGrabIntervalInMinutes,
    SettingIgnoreCommonSubsCount,
    SettingPostTypes,
    SettingRemoveInactiveUserTime,
    SettingRemoveSubOn404,
    SettingRetrieveOnSubAddition,
    SettingSort,
    SettingWaitBeforeReGrabbingInMinutes
} from "../../app/constants";

export default function SettingDisplay({
    settings,
    setSettings
}) {
    function resetSettings() {
        setSettings(DefaultSettings);
    }

    return <div className="settingssection-container scrollable">
        <div className="settingsection-title">
            <div className='settingsection-title-name'>
                Settings
            </div>
            <button
                className="settingsection-title-clear clickable"
                onClick={() => { resetSettings() }}
            >
                Reset
            </button>
        </div>
        <div className='settings-flexcontainer'>
            {/* Checkboxes */}
            {
                // Could generalize this more, but I want to control order settings appear in
                //     This should be fine for now
            }
            <CheckboxContainer
                settings={settings}
                setSettings={setSettings}
                settingInfo={SettingAddAllFiltersPossible}
            />
            <CheckboxContainer
                settings={settings}
                setSettings={setSettings}
                settingInfo={SettingRemoveSubOn404}
            />
            <CheckboxContainer
                settings={settings}
                setSettings={setSettings}
                settingInfo={SettingRetrieveOnSubAddition}
            />
        </div>
        <div className='settings-flexcontainer'>
            {/* Numerical Inputs */}
            <NumericalInputContainer
                settings={settings}
                setSettings={setSettings}
                settingInfo={SettingCommonKeywordsIgnoreLength}
            />
            <NumericalInputContainer
                settings={settings}
                setSettings={setSettings}
                settingInfo={SettingGrabIntervalInMinutes}
            />
            <NumericalInputContainer
                settings={settings}
                setSettings={setSettings}
                settingInfo={SettingIgnoreCommonSubsCount}
            />
            <NumericalInputContainer
                settings={settings}
                setSettings={setSettings}
                settingInfo={SettingRemoveInactiveUserTime}
            />
            <NumericalInputContainer
                settings={settings}
                setSettings={setSettings}
                settingInfo={SettingWaitBeforeReGrabbingInMinutes}
            />
        </div>
        <div className='settings-flexcontainer'>
            {/* Dropdowns */}
            <DropdownContainer
                settings={settings}
                setSettings={setSettings}
                settingInfo={SettingPostTypes}
            />
            <DropdownContainer
                settings={settings}
                setSettings={setSettings}
                settingInfo={SettingSort}
            />
        </div>
    </div>;
}