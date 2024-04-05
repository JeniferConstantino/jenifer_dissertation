import React, { useState } from 'react';
import { FaAngleLeft, FaCheck  } from "react-icons/fa6";
import {Buffer} from 'buffer';
import { FcPlus } from "react-icons/fc";
import InfoPopup from '../Infos/InfoPopup';
import { FcCheckmark, FcCancel } from "react-icons/fc";

const VeifyPopup = ({fileManagerFacadeInstance, handleVerify, show, children}) => {

    const showHideClassName = show ? 'display-block' : 'display-none'; // controls the popup visibility
    const [showDragDrop, setShowDragDrop] = useState(true);// controls the visibility of the drag and drop popup
    const [showInfoPopup, setShowInfoPopup] = useState(false); // controls the warning visibility
    const [titleInfoPopup, setTtileInfoPopup] = useState(""); // Sets the title to be showed in the info popup
    const [message, setMessage] = useState(""); // Sets the message to be showed in the info popup

    const [isDragOver, setIsDragOver] = useState(false);
    const [droppedFile, setDroppedFile] = useState(null);

    const [fileAsBuffer, setFileAsBuffer] = useState(null);


    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    }

    const handleDragLeave = (e) => {
        setIsDragOver(false);
    }

    const handleFileVerify = async (e) => {
        
        console.log('Verify file ...')
        e.preventDefault()

        if(fileAsBuffer){
            try{
                const validFile = await fileManagerFacadeInstance.verifyFile(fileAsBuffer);
                setTtileInfoPopup(validFile ? "Valid" : "Invalid");
                setShowInfoPopup(true);
                setShowDragDrop(false);
                if (validFile) {
                    setMessage("Congrats! This file seems to be valid. Let's proceed with additional verifications.");
                } else {
                    setMessage("Oops! This file doesn't seem to be valid. Let's proceed with additional verifications.");
                }
            } catch (error) {
                console.error("Error verifying file:", error);
            }
        }
    }

    // Converts the droped file into a format that IPFS can undertsand and sets it to the state
    const handleFileDrop = (e) => {
        setIsDragOver(false);
        const file = e.dataTransfer.files[0];
        setDroppedFile(file);

        console.log('capture file ...')
        e.preventDefault()
        
        const fileInpt = e.dataTransfer;

        if (fileInpt.files.length !== 0) {
            const file = fileInpt.files[0] // access to the file
            
            const reader = new window.FileReader()
            reader.readAsArrayBuffer(file)
            reader.onloadend = () => {
                setFileAsBuffer(Buffer(reader.result)) // format that allows to post to IPFS
            }
        }
    };

    // Sets to close the popup to verify a file
    const handleCloseVerifyPopup = () => {
        cleanFields();
        handleVerify(); 
    }

    const handleContinue = () => {
        cleanFields();
    }

    const cleanFields = () => {
        setShowInfoPopup(false);
        setTtileInfoPopup("");
        setShowDragDrop(true);
        setDroppedFile(null);
        setFileAsBuffer(null);
    }

    const iconComponent = titleInfoPopup === "Valid" ? FcCheckmark : FcCancel;


    return(
        <>
            <div className={showHideClassName}>
                <div className='modal-wrapper'>
                    <div className="modal-background"></div>
                    { showDragDrop && (
                        <div className="modal">
                            <section>
                                {children}
                                <div className='popup-section section-title-drop-popup'>
                                    <FaAngleLeft size={18} className="app-button_back" onClick={handleCloseVerifyPopup}/>
                                    <h2 className='drop-file-header'>Verify File</h2>
                                </div>
                                <div 
                                    className={`popup-section drag-drop-section ${isDragOver ? 'drag-over' : ''}`}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleFileDrop}
                                >
                                    {droppedFile ? (
                                        <>
                                            <p className='content-drop'><FaCheck size={24} color="green" /> {droppedFile.name}</p>
                                            <button className="app-button__drop app-button" onClick={handleCloseVerifyPopup}> Cancel </button>
                                        </>
                                    ) : (
                                        <p> <FcPlus/> Drop your file</p>  
                                    )}
                                </div>
                                <div className='popup-section'>
                                    <button className="app-button__drop app-button" onClick={handleFileVerify}>Verify</button>
                                </div>
                            </section>
                        </div>
                    )}
                    {showInfoPopup && droppedFile!=null && (
                        <InfoPopup handleContinue={handleContinue} message={message} title={titleInfoPopup} showInfoPopup = {showInfoPopup} iconComponent={iconComponent}  changeWithButton={true} mnemonic=""/>
                    )}
                </div>
            </div>
        </>
    );

}

export default VeifyPopup;