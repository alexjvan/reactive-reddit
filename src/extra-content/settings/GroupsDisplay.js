import { getFromStorage, removeGroupFromStorage } from '../../app/storage/storage.js';
import { emptyValidation } from '../../app/storage/validators.js';

export default function GroupsDisplay({
    groups,
    setGroups,
    activeGroup,
    subs,
    filters,
    posts,
    clearFilters
}) {
    const groupsInfo = groups.map((group) => {
        // Ignore current group (use already loaded data)
        if (group.name === activeGroup) {
            return {
                name: group.name,
                subs: subs.length,
                filters: filters.length,
                posts: posts.length
            };
        } else {
            let curSubs = getFromStorage(group.name, 'subs', [], emptyValidation);
            let curFilters = getFromStorage(group.name, 'filters', [], emptyValidation);
            let curPosts = getFromStorage(group.name, 'posts', [], emptyValidation);

            return {
                name: group.name,
                subs: curSubs.length,
                filters: curFilters.length,
                posts: curPosts.length
            };
        }
    });

    function removeGroup(groupName) {
        removeGroupFromStorage(groupName);
        setGroups((current) => current.filter((g) => g.name !== groupName));
    }

    return <div className='settings-panel' id='groupspanel'>
        <div className="settingssection-container">
            <div className="settingsection-title">
                <div className='settingsection-title-name'>
                    Groups
                </div>
                <button
                    className="settingsection-title-clear clickable"
                    onClick={() => { clearFilters() }}
                >
                    Clear
                </button>
            </div>
            <div className='settings-listcontainer'>
                {groupsInfo.map((group) =>
                    <div className='groupspanel' key={`grouppanel-${group.name}`}>
                        <div className='groups-title'>
                            {group.name}
                            <button className='groups-remove clickable' onClick={() => removeGroup(group.name)}>
                                X
                            </button>
                        </div>
                        <div className='groups-info'>
                            <div className='groups-infopanel'>
                                Subs: {group.subs}
                            </div>
                            <div className='groups-infopanel'>
                                Filters: {group.filters}
                            </div>
                            <div className='groups-infopanel'>
                                Posts: {group.posts}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>;
}