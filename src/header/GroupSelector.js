import { useMemo, useState } from 'react';
import './GroupSelector.css';

export default function GroupSelector({
  groups,
  setGroups,
  activeGroup
}) {
  const [inputValue, setInputValue] = useState('');

  function handleChange(e) {
    setInputValue(e.target.value);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  function handleSubmit() {
    newGroup(inputValue);
    setInputValue('');
  }

  function newGroup(newGroup) {
    setGroups(old => {
      var newGroupObj = { name: newGroup, active: true }
      var oldGroups = old.map(oldg => {
        if (oldg.active) {
          oldg.active = false;
        }

        return oldg;
      });

      return [...oldGroups, newGroupObj]
    });
  }

  function changeActive(oldGroup, newGroup) {
    setGroups(old => old.map(oldg => {
      if (oldg.name == oldGroup) {
        oldg.active = false;
      } else if (oldg.name == newGroup) {
        oldg.active = true;
      }

      return oldg;
    }));
  }

  const groupDisplay = useMemo(
    () => (groups ?? []).map(group => {
      return <button
        key={'group' + group.name}
        className={`groupButton clickable ${group.active ? 'active' : ''}`}
        onClick={() => changeActive(activeGroup, group.name)}
      >
        {group.name}
      </button>
    }),
    [groups, activeGroup]
  );

  return <div id='groupsBar'>
    {groupDisplay}
    <div className='newGroup'>
      <input
        className='newGroup-input'
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
      <button
        key='newGroupButton'
        className='groupButton clickable'
        onClick={handleSubmit}
      >
        +
      </button>
    </div>
  </div>;
}
