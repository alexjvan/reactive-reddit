import './Foot.css';
import Footerlink from './Footerlink';
import { AllExtraContent } from '../app/constants.js';

export default function Foot({
    setExtraDisplay
}) {
    return <div id="footer">
        {AllExtraContent.map((section) =>
            <Footerlink
                key={section}
                section={section}
                setExtraDisplay={setExtraDisplay}
            />
        )}
    </div>;
}