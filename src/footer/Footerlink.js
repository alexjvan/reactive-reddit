import { memo } from 'react';

function FooterlinkComponent({ section, setExtraDisplay }) {
    const handleClick = () => setExtraDisplay(section);

    return (
        <button className="footerlink clickable" onClick={handleClick}>
            {section}
        </button>
    );
}

export default memo(FooterlinkComponent); // Memoize the component
