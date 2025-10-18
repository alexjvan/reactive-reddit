import './Footerlink.css';

export default function FooterlinkComponent({
    section,
    setExtraDisplay
}) {
    return <button
        className="footerlink clickable"
        onClick={() => setExtraDisplay(section)}
    >
        {section}
    </button>;
}
