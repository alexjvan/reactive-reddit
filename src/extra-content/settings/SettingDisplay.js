import './SettingsSection.css';
import CheckboxContainer from "./setting-containers/CheckboxContainer";
import DropdownContainer from "./setting-containers/DropdownContainer";
import NumericalInputContainer from "./setting-containers/NumericalInputContainer";
import {
    DefaultSettings,
    SettingAddAllFiltersPossible,
    SettingCommonKeywordsIgnoreLength,
    SettingDeletedUserAction,
    SettingGrabIntervalInMinutes,
    SettingsHideLessRecentPosts,
    SettingsHighlightDesiredFilters,
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
                [SettingAddAllFiltersPossible, SettingRemoveSubOn404, SettingRetrieveOnSubAddition, SettingsHideLessRecentPosts].map(settingInfo => (
                    <CheckboxContainer
                        key={settingInfo.fieldName}
                        settings={settings}
                        setSettings={setSettings}
                        settingInfo={settingInfo}
                    />
                ))
            }
            <CheckboxContainer
                settings={settings}
                setSettings={setSettings}
                settingInfo={SettingsHighlightDesiredFilters}
                enable={false} // TODO: implement this setting
            />
        </div>
        <div className='settings-flexcontainer'>
            {/* Numerical Inputs */}
            {
                [SettingCommonKeywordsIgnoreLength, SettingGrabIntervalInMinutes, SettingIgnoreCommonSubsCount, SettingRemoveInactiveUserTime, SettingWaitBeforeReGrabbingInMinutes].map(settingInfo => (
                    <NumericalInputContainer
                        key={settingInfo.fieldName}
                        settings={settings}
                        setSettings={setSettings}
                        settingInfo={settingInfo}
                    />
                ))
            }
        </div>
        <div className='settings-flexcontainer'>
            {/* Dropdowns */}
            {
                [SettingPostTypes, SettingSort, SettingDeletedUserAction].map(settingInfo => (
                    <DropdownContainer
                        key={settingInfo.fieldName}
                        settings={settings}
                        setSettings={setSettings}
                        settingInfo={settingInfo}
                    />
                ))
            }
        </div>
    </div>;
}