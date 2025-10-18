import './SettingsSection.css';
import CheckboxContainer from "./setting-containers/CheckboxContainer";
import DropdownContainer from "./setting-containers/DropdownContainer";
import NumericalInputContainer from "./setting-containers/NumericalInputContainer";
import {
    DefaultSettings,
    SettingAddAllFiltersPossible,
    SettingCommonKeywordsIgnoreLength,
    SettingGrabIntervalInMinutes,
    SettingPostTypes,
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

    return <div className='settings-panel' id='settingspanel'>
        <div className="settingssection-container">
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
                    settingInfo={SettingWaitBeforeReGrabbingInMinutes}
                />
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
        </div>
    </div>;
}