import React, { useState } from 'react';
import { FaAngleLeft, FaCheck  } from "react-icons/fa6";
import {Buffer} from 'buffer';
import WarningPopup from '../Warnings/WarningPopup';
import { FcPlus } from "react-icons/fc";

const UploadPopup = ({fileManagerFacadeInstance, handleFileUploaded, selectedUser, uploadedActiveFiles, uploadedFiles, handleClosePopup, show, children}) => {

    const showHideClassName = show ? 'display-block' : 'display-none'; // controls the popup visibility
    const [showDragDrop, setShowDragDrop] = useState(true);// controls the visibility of the drag and drop popup
    const [showWarning, setShowWarning] = useState(false); // controls the warning visibility

    const [isDragOver, setIsDragOver] = useState(false);
    const [droppedFile, setDroppedFile] = useState(null);

    const [fileUpl, setFileUpl] = useState(null);
    const [fileAsBuffer, setFileAsBuffer] = useState(null);


    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    }

    const handleDragLeave = (e) => {
        setIsDragOver(false);
    }

    // Sends the file to IPFS and receivs a CID - a hash that is unique to the stored file
    const handleFileUpload = async (e) => {
        setDroppedFile(false);
        
        console.log('UPLOAD file ...')
        e.preventDefault()

        if(fileAsBuffer){
            console.log();
            try{
                var userHasFileWithName = await fileManagerFacadeInstance.userAssociatedWithFileName(selectedUser.account, fileUpl.name.trim());
                if (userHasFileWithName) {
                    setShowWarning(true); // Sends Warning saying that a new version will be added => file editing
                    setShowDragDrop(false);
                } else {
                    // Proceeds with the file upload - File version is 0, indicating that is the first time the file is being uploaded
                    await fileManagerFacadeInstance.uploadFile(0, fileUpl, fileAsBuffer, handleFileUploaded, uploadedActiveFiles, uploadedFiles);
                    cleanFields();
                }
            } catch (error) {
                console.error("Error uploading file:", error);
            }
        }
    }

    // Converts the uploaded file into a format that IPFS can undertsand and sets it to the state
    const handleFileDrop = (e) => {
        setIsDragOver(false);
        const file = e.dataTransfer.files[0];
        setDroppedFile(file);

        console.log('capture file ...')
        e.preventDefault()
        
        const fileInpt = e.dataTransfer;

        if (fileInpt.files.length !== 0) {
            const file = fileInpt.files[0] // access to the file
            setFileUpl(file);

            const reader = new window.FileReader()
            reader.readAsArrayBuffer(file)
            reader.onloadend = () => {
                setFileAsBuffer(Buffer(reader.result)) // format that allows to post to IPFS
            }
        }
    };

    // Sets to close the popup to upload a file
    const handleCloseUploadPopup = () => {
        cleanFields();
        handleClosePopup("upload"); 
    }

    const handleContinue = () => {
        // file version is -1, indicating that is a reupload of an existing file
        fileManagerFacadeInstance.uploadFile(-1, fileUpl, fileAsBuffer, handleFileUploaded, uploadedActiveFiles, uploadedFiles);
        cleanFields();
    }

    const cleanFields = () => {
        setShowWarning(false); // Hide the warning popup
        setShowDragDrop(true);
        setDroppedFile(null);
        setFileAsBuffer(null);
    }

    return(
        <>
            <div className={showHideClassName}>
                <div className='modal-wrapper'>
                    <div className="modal-background"></div>
                    { showDragDrop && (
                        <div className="modal">
                        <section>
                            {children}
                            <div className='popup-section section-title-upload-popup'>
                                <FaAngleLeft size={18} className="app-button_back" onClick={handleCloseUploadPopup}/>
                                <h2 className='upload-file-header'>Upload File</h2>
                            </div>
                            <div 
                                className={`popup-section drag-drop-section ${isDragOver ? 'drag-over' : ''}`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleFileDrop}
                            >
                                {droppedFile ? (
                                    <>
                                        <p><FaCheck size={24} color="green" /> {droppedFile.name}</p>
                                        <button className="app-button__upload app-button" onClick={handleCloseUploadPopup}> Cancel </button>
                                    </>
                                ) : (
                                    <p> <FcPlus/> Drop your file</p>  
                                )}
                            </div>
                            <div className='popup-section'>
                                <button className="app-button__upload app-button" onClick={handleFileUpload}>Upload</button>
                            </div>
                        </section>
                    </div>
                    )}
                    {showWarning && droppedFile!=null && (
                        <WarningPopup handleContinue={handleContinue} cleanFields={cleanFields} message={"A new version of the file will be uploaded. Do you want to continue?"} showWarning = {showWarning}/>
                    )}
                </div>
            </div>
        </>
    );

}

export default UploadPopup;