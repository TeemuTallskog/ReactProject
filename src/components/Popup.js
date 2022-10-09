import CloseIcon from '@mui/icons-material/Close';
import '../resources/css/iconButton.css'
import '../resources/css/popup.css'

/**
 *
 * @param props - recieves a boolean trigger and trigger setter as a prop and renders according to that
 * @returns {JSX.Element|string}
 * @constructor
 */
function Popup(props){
    return(props.trigger) ? (
        <div className="popup">
            <div className="popup-inner">
                <button className="button" id="close-btn" onClick={() => {props.setTrigger(false)}}><CloseIcon className="close-icon"/></button>
                {props.children}
            </div>
        </div>
    ) : "";
}

export default Popup;