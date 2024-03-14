import React from "react";
import { FcHighPriority } from "react-icons/fc";

const WarningPopup = ({handleContinue, cleanFields, message, title, showWarning}) => {
    const showHideClassName = showWarning ? 'modalPopup display-block-popup' : 'modalPopup display-none';

    return (
        <div className={showHideClassName}>
            <div className="popup-content">
                <div className="right-section">
                    <FcHighPriority size={80}/>
                    <p className="textInfo">{title}</p>
                </div>
                <div className="buttons-content">
                    <div>
                        <p className="message-popup">{message}</p>
                    </div>
                    <div>
                        <button className="app-button app-button__popup" onClick={handleContinue}>Continue</button>
                        <button className="app-button app-button__popup" onClick={cleanFields}>Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default WarningPopup;