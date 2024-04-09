import React from "react";
import PropTypes from 'prop-types';

const InfoPopup = ({handleContinue, message, title, showInfoPopup, iconComponent: IconComponentnent, changeWithButton, mnemonic}) => {
    const showHideClassName = showInfoPopup ? 'modalPopup' : 'modalPopup display-none';
    const changeWidth = changeWithButton ? 'app-button app-button__popup-width' : 'app-button app-button__popup';

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
                                    <p className="message-popup mnemonic-phrase"> This is your <b>mnemonic</b>: </p>
                                    <p className="message-popup mnemonic-message"> {mnemonic}</p>
                                    <p className="message-popup"> Remember to keep it <strong>safe</strong>, like writing it down on a piece of paper. Your mnemonic gives <strong>access to your account</strong>. If it falls into the wrong hands, they could gain entry. And if you lose it, you&apos;ll lose access to your account permanently.</p>
                                    </>
                                ) : (
                                    <p className="message-popup">{message}</p>
                                )}
                            </div>
                            <div>
                                <button className={changeWidth} onClick={handleContinue}>Continue</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

InfoPopup.propTypes = {
    handleContinue: PropTypes.func.isRequired,
    message: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    showInfoPopup: PropTypes.bool.isRequired,
    iconComponent: PropTypes.func.isRequired,
    changeWithButton: PropTypes.bool.isRequired,
    mnemonic: PropTypes.string.isRequired
};

export default InfoPopup;