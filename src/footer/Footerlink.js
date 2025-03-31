export default function FooterlinkComponent({ 
    section, 
    setExtraDisplay 
}) {
    function handleClick() {
        setExtraDisplay(section);
    } 

    return <button 
        className="footerlink clickable" 
        onClick={handleClick}
    >
        {section}
    </button>;
}
