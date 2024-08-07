import React, { useState } from 'react';
import { FaAngleLeft, FaCheck  } from "react-icons/fa6";
import {Buffer} from 'buffer';
import { FcPlus } from "react-icons/fc";
import { FileApp } from '../../helpers/FileApp';
import InfoPopup from '../Infos/InfoPopup';
import { FcHighPriority } from "react-icons/fc";
import PropTypes from 'prop-types';

const UploadPopup = ({fileManagerFacadeInstance, handleFileUploaded, uploadedActiveFiles, uploadedFiles, show, children}) => {

    const showHideClassName = show ? 'display-block' : 'display-none'; // controls the popup visibility
    const [showDragDrop, setShowDragDrop] = useState(true);// controls the visibility of the drag and drop popup
    
    const [isDragOver, setIsDragOver] = useState(false);
    const [droppedFile, setDroppedFile] = useState(null);

    const [showInfoWronfFilePopup, setShowInfoWronfFilePopup] = useState(false);
    const [message, setMessage] = useState("");
    const [titleInfoNamePopup, setTitleInfoNamePopup] = useState("");

    const [fileUpl, setFileUpl] = useState(null);
    const [fileAsBuffer, setFileAsBuffer] = useState(null);


    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    }

    const handleDragLeave = () => {
        setIsDragOver(false);
    }

    // Sends the file to IPFS and receivs a CID - a hash that is unique to the stored file
    const handleFileUpload = async (e) => {
        setDroppedFile(false);
        
        console.log('UPLOAD file ...')
        e.preventDefault()

        if(fileAsBuffer){
            try{
                if(FileApp.getFileType(fileUpl.name) === "invalid") {
                    setShowInfoWronfFilePopup(true);
                    setTitleInfoNamePopup("Attention");
                    setMessage('File not supported. Supported types: .jpg, .jpeg, .png, .gif, .docx, .odt, .pdf');
                    return;
                }
                await fileManagerFacadeInstance.uploadFile(fileUpl.name, fileAsBuffer, handleFileUploaded, uploadedActiveFiles, uploadedFiles);
                cleanFields();
                handleFileUploaded("upload");
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
        handleFileUploaded("upload");
    }

    const handleCloseWrongFileType = () => {
        setShowInfoWronfFilePopup(false);
        setMessage("");
        setTitleInfoNamePopup("");
    }

    const cleanFields = () => {
        setShowDragDrop(true);
        setDroppedFile(null);
        setFileAsBuffer(null);
        setShowInfoWronfFilePopup(false);
        setMessage("");
        setTitleInfoNamePopup("");
    }

    const iconComponent = FcHighPriority;

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
                                    <FaAngleLeft size={18} className="app-button_back" onClick={handleCloseUploadPopup}/>
                                    <h2 className='drop-file-header'>Upload File</h2>
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
                                            <button className="app-button__drop app-button" onClick={cleanFields}> Cancel </button>
                                        </>
                                    ) : (
                                        <p> <FcPlus/> Drop your file</p>  
                                    )}
                                </div>
                                <div className='popup-section'>
                                    <button className="app-button__drop app-button" onClick={handleFileUpload}>Upload</button>
                                </div>
                            </section>
                        </div>
                    )}
                </div>
            </div>
            {showInfoWronfFilePopup && (
                <div className='modal-wrapper'>
                    <InfoPopup handleContinue={handleCloseWrongFileType} message={message} title={titleInfoNamePopup} showInfoPopup = {showInfoWronfFilePopup} iconComponent={iconComponent} changeWithButton={true} mnemonic={""}/>
                </div>
            )}
        </>
    );

}

UploadPopup.propTypes = {
    fileManagerFacadeInstance: PropTypes.object.isRequired,
    handleFileUploaded: PropTypes.func.isRequired,
    uploadedActiveFiles: PropTypes.array.isRequired,
    uploadedFiles: PropTypes.array.isRequired,
    show: PropTypes.bool.isRequired,
    children: PropTypes.object,
};

export default UploadPopup;