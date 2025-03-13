import { useState } from "react";

export default function QuickAdd({
    section, 
    quickAdd 
}) {
    const [want, setWant] = useState(section === "Subs" ? undefined : true);
    const sectionId = `qa-${section.replace("||", "or")}`;

    const handleToggleWant = () => setWant(prev => !prev);

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            quickAdd(section);
        }
    };

    return (
        <div className="qa-section" id={sectionId}>
            <div className="qa-title">{section}</div>
            <div className="qa-options">
                <button
                    className={`qa-want ${want ? "include" : want === false ? "exclude" : ""}`}
                    onClick={handleToggleWant}
                />
                <div className="qa-inputbox">
                    <input className="qa-input" onKeyDown={handleKeyDown} />
                </div>
                <button
                    className="qa-submit clickable"
                    onClick={() => quickAdd(section)}
                >
                    Go
                </button>
            </div>
        </div>
    );
}
