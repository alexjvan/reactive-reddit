import MediaContainer from '../body/User/Post/MediaContainer';
import './PopOutMediaContainer.css';

export default function PopOutMediaContainer({
    popOutMedia,
    setPopOutMedia,
    setProcessedUsers
}) {
    return (popOutMedia &&
        <div id="popoutmedia">
            <div id="popoutheader">
                <button id="popoutclose" className="clickable" onClick={() => setPopOutMedia(null)}>X</button>
            </div>
            <div id="popoutcontent">
                <MediaContainer
                    t3={popOutMedia.t3}
                    username={popOutMedia.username}
                    processedMedia={popOutMedia.processedMedia}
                    fromPopOut={true}
                    setProcessedUsers={setProcessedUsers}
                    setPopOutMedia={setPopOutMedia}
                />
            </div>
        </div>
    );
}
