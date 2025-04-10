import { useState } from "react";

export default function QuickAdd({
    section,
    quickAdd
}) {
    const [inputValue, setInputValue] = useState('');
    const [want, setWant] = useState(section === "Subs" ? undefined : true);
    const sectionId = `qa-${section.replace("||", "or")}`;

    function handleChange(e) {
        setInputValue(e.target.value);
    }

    function handleKeyDown(e) {
        if (e.key === "Enter") {
            handleSubmit();
        }
    };

    function handleSubmit() {
        quickAdd(section, inputValue, want);
        setInputValue('');
    }

    return (
        <div className="qa-section" id={sectionId}>
            <div className="qa-title">{section}</div>
            <div className="qa-options">
                <button
                    className={`qa-want ${want ? "include" : want === false ? "exclude" : ""}`}
                    onClick={() => setWant(prev => !prev)}
                />
                <div className="qa-inputbox">
                    <input
                        className="qa-input"
                        value={inputValue}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                    />
                </div>
                <button
                    className="qa-submit clickable"
                    onClick={handleSubmit}
                >
                    Go
                </button>
            </div>
        </div>
    );
}
