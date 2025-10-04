import { useState } from "react";
import { FilterCategorySub } from "../app/constants";

export default function QuickAdd({
    quickAdd
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
        quickAdd(FilterCategorySub, inputValue, undefined);
        setInputValue('');
    }

    return <div className="qa-section" id={FilterCategorySub}>
        <div className="qa-title">{FilterCategorySub}</div>
        <div className="qa-options">
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
    </div>;
}
