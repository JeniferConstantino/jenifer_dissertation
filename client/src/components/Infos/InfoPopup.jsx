import React from "react";

const InfoPopup = ({handleContinue, message, title, showInfoPopup, iconComponent: IconComponentnent}) => {
    const showHideClassName = showInfoPopup ? 'modalPopup display-block-popup' : 'modalPopup display-none';

    return (
        <div className={showHideClassName}>
            <div className="popup-content">
                <div className="right-section">
                    {IconComponentnent  && <IconComponentnent size={80}/>}
                    <p className="textInfo">{title}</p>
                </div>
                <div className="buttons-content">
                    <div>
                        <p className="message-popup">{message}</p>
                    </div>
                    <div>
                        <button className="app-button app-button__popup" onClick={handleContinue}>Continue</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default InfoPopup;