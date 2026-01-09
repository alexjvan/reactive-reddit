import MediaContainer from '../body/User/Post/MediaContainer';
import './PopOutMediaContainer.css';

export default function PopOutMediaContainer({
    popOutMedia,
    setPopOutMedia,
    setProcessedUsers
}) {
    // TODO Bring StartIndex back
    //    Can't directly pass objects in react, so passing start index from media container -> popout
    //    However, I don't really have a way to bring the index back
    //        Two ideas how this could be done:
    //        1. Set the index in the user, this would be a lot of writing, would definitely add processing time
    //        2. Use a callback function to set the index back in the meida container on the popoutClose onClick
    return popOutMedia &&
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
                    startIndex={popOutMedia.currentIndex}
                    setProcessedUsers={setProcessedUsers}
                    setPopOutMedia={setPopOutMedia}
                />
            </div>
        </div>;
}
