import './Foot.css';
import Footerlink from './Footerlink';

export default function Foot({
    setExtraDisplay
}) {
    const sections = ["Settings", "Stats"];

    return <div id="footer">
        {sections.map((section) =>
            <Footerlink
                key={section}
                section={section}
                setExtraDisplay={setExtraDisplay}
            />
        )}
    </div>;
}