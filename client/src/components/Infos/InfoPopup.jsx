import React from "react";

const InfoPopup = ({handleContinue, message, title, showInfoPopup, iconComponent: IconComponentnent, mnemonic}) => {
    const showHideClassName = showInfoPopup ? 'modalPopup display-block-popup' : 'modalPopup display-none';

    return (
        <div className={showHideClassName}>

            <div className='modal-wrapper'>
                <div className="modal-background"></div>
                <div className="modal modal-info-popup"> 
                    <div className="popup-content">
                        <div className="right-section">
                            <div className="content">
                                {IconComponentnent  && <IconComponentnent size={80}/>}
                                <p className="textInfo">{title}</p>
                            </div>
                        </div>
                        <div className="buttons-content">
                            <div>
                                {mnemonic !== '' ? (
                                    <>
                                    <p className="message-popup"> This is your <b>mnemonic</b> </p>
                                    <p className="message-popup"> {mnemonic}</p>
                                    <p className="message-popup"> Keep it safe (write it on a peper, for example). Anyone with access to this mnemonic can <b>access your account</b>. And, if you lose it you <b>lose</b> your access forever.</p>
                                    </>
                                ) : (
                                    <p className="message-popup">{message}</p>
                                )}
                            </div>
                            <div>
                                <button className="app-button app-button__popup" onClick={handleContinue}>Continue</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default InfoPopup;