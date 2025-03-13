import clsx from "clsx";
import { useState } from "react";

export default function QuickAdd({
    section, 
    quickAdd 
}) {
    const [want, setWant] = useState(true);
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
                    className={clsx("qa-want", {
                        disabled: section === "Subs",
                        include: want,
                        exclude: !want,
                    })}
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
