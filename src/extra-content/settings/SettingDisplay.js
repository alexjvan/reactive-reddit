import CheckboxContainer from "./setting-containers/CheckboxContainer";
import DropdownContainer from "./setting-containers/DropdownContainer";
import NumericalInputContainer from "./setting-containers/NumericalInputContainer";

export default function SettingDisplay({
    settings,
    setSettings,
    defaultSettings
}) {
    function resetSettings() {
        setSettings(defaultSettings);
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
                <CheckboxContainer
                    settings={settings}
                    setSettings={setSettings}
                    defaultSettings={defaultSettings}
                    fieldName={'addAllFiltersPossible'}
                    title={'Add All Filters Possible'}
                    description={'Adding all filters possible will add some time upon retrieval, but can eliminate some when removing filters in-use.'}
                />
                <CheckboxContainer
                    settings={settings}
                    setSettings={setSettings}
                    defaultSettings={defaultSettings}
                    fieldName={'removeSubOn404'}
                    title={'Remove Sub on 404 (Not Found)'}
                    description={'Remove a sub from the grabber when its not found. This can help performance, but means you will no longer try to get data from this subreddit.'}
                />
                <CheckboxContainer
                    settings={settings}
                    setSettings={setSettings}
                    defaultSettings={defaultSettings}
                    fieldName={'retrieveOnSubAddition'}
                    title={'Restart Retrieval on Addition of Sub'}
                    description={'Try and restart the grab-loop when a new sub is added. May fix lag, but may cause rate-limiting from Reddit.'}
                />
                <NumericalInputContainer
                    settings={settings}
                    setSettings={setSettings}
                    defaultSettings={defaultSettings}
                    fieldName={'commonKeywordsIgnoreLength'}
                    title={'Common Keywords Ignore Length'}
                    description={'When finding common keywords in titles (see Stats), max size of word to ignore. This helps ignore common words like \'the\'.'}
                />
                <NumericalInputContainer
                    settings={settings}
                    setSettings={setSettings}
                    defaultSettings={defaultSettings}
                    fieldName={'grabIntervalInMinutes'}
                    title={'Grab Interval In Minutes'}
                    description={'How many minutes between each attempt at retrieving new information. Reddit seems to rate-limit users for extended periods if interval is less than 15 minutes.'}
                />
                <NumericalInputContainer
                    settings={settings}
                    setSettings={setSettings}
                    defaultSettings={defaultSettings}
                    fieldName={'waitBeforeReGrabbingInMinutes'}
                    title={'Grab Delay In Minutes'}
                    description={'If a post exists within the last x minutes, don\'t try and grab more information from the subreddit. This helps cut down on request-counts.'}
                />
                <DropdownContainer
                    settings={settings}
                    setSettings={setSettings}
                    defaultSettings={defaultSettings}
                    fieldName={'postTypes'}
                    options={[
                        {
                            settingValue: 'all',
                            displayValue: 'All'
                        }//, TODO: Re-enable when I have created a way to do this
                        // {
                        //     settingValue: 'media',
                        //     displayValue: 'With Media'
                        // },
                        // {
                        //     settingValue: 'mediaOnly',
                        //     displayValue: 'Media Only'
                        // },
                        // {
                        //     settingValue: 'textOnly',
                        //     displayValue: 'TextOnly'
                        // }
                    ]}
                    title={'Post Types'}
                    description={'What types of posts to display.'}
                />
                <DropdownContainer
                    settings={settings}
                    setSettings={setSettings}
                    defaultSettings={defaultSettings}
                    fieldName={'sort'}
                    options={[
                        {
                            settingValue: 'new',
                            displayValue: 'New'
                        }//, TODO: Re-enable when I have created a way to do this
                        // {
                        //     settingValue: 'postcount',
                        //     displayValue: 'Post Count'
                        // }
                    ]}
                    title={'Sort'}
                    description={'How to sort the users in the post-display.'}
                />
            </div>
        </div>
    </div>;
}