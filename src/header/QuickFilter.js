import { useState } from "react";

export default function QuickFilter({
    quickAdd
}) {
    const categoryOptions = ["Author", "Tag", "Text", "Text||Title", "Title"];

    const [inputValue, setInputValue] = useState('');
    const [want, setWant] = useState(true);
    const [filterCategory, setFilterCategory] = useState(categoryOptions[0]);

    function handleChange(e) {
        setInputValue(e.target.value);
    }

    function handleKeyDown(e) {
        if (e.key === "Enter") {
            handleSubmit();
        }
    };

    function handleSubmit() {
        quickAdd(filterCategory, inputValue, want);
        setInputValue('');
    }

    return <div className="qa-section">
        <select className="qa-cat" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            {categoryOptions.map((c) => <option value={c} key={c}>
                {c}
            </option>)}
        </select>
        <div className="qa-inputbox">
            <input
                className="qa-input"
                value={inputValue}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
            />
        </div>
        <button
            className={`qa-want ${want ? "include" : want === false ? "exclude" : ""}`}
            onClick={() => setWant(prev => !prev)}
        />
        <button
            className="qa-submit clickable"
            onClick={handleSubmit}
        >
            Go
        </button>
    </div>;
}
