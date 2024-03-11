import React from "react";
import { FcHighPriority } from "react-icons/fc";

const WarningPopup = ({handleContinue, cleanFields, message, showWarning}) => {
    const showHideClassName = showWarning ? 'modalWarning display-block-warning' : 'modalWarning display-none';

    return (
        <div className={showHideClassName}>
            <div className="warning-content">
                <div className="warning">
                    <FcHighPriority size={80}/>
                    <p className="textWarning">Warning</p>
                </div>
                <div className="buttonsContent">
                    <div>
                        <p className="messageWarning">{message}</p>
                    </div>
                    <div>
                        <button className="app-button app-button__warning" onClick={handleContinue}>Continue</button>
                        <button className="app-button app-button__warning" onClick={cleanFields}>Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default WarningPopup;