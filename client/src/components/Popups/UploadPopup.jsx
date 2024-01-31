import React, { useState } from 'react';
import { FaAngleLeft, FaCheck  } from "react-icons/fa6";
import FileHandler from '../../helpers/fileHandler';
import {useWeb3} from '../../helpers/web3Client';
import {Buffer} from 'buffer';

const UploadPopup = ({handleFileUploaded, uploadedFiles, handleClose, show, selectedUser, children}) => {

    const showHideClassName = show ? 'modal display-block' : 'modal display-none';
    const [isDragOver, setIsDragOver] = useState(false);
    const [droppedFile, setDroppedFile] = useState(null);

    const [fileUpl, setFileUpl] = useState(null);
    const [fileAsBuffer, setFileAsBuffer] = useState(null);

    const {storeFileBlockchain} = useWeb3();


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
            try{
                // Encrypts and adds file to IPFS
                const {fileCID, symmetricKey} = await FileHandler.addFileToIPFS(fileAsBuffer);
                console.log('File encrypted and added to IPFS', fileCID);

                // Verifies if the file exists
                FileHandler.checkFileAlreadyUploaded(fileCID, uploadedFiles);

                // Adds the file to the blockchain
                storeFileBlockchain(fileUpl, symmetricKey, selectedUser.current, fileCID).then(({transactionResult, fileUploaded}) => {
                    // Updates the state with the result
                    var tempUpdatedUploadedFiles = [...uploadedFiles, fileUploaded];
                    console.log('File added to the blockchain');

                    handleFileUploaded(e, tempUpdatedUploadedFiles);
                }).catch(err => {
                    console.log(err);
                })       
            } catch (error) {
                console.error("Error uploading file to IPFS:", error);
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

    const resetFileState = () => {
        setDroppedFile(null);
    };

    return(
        <div className={showHideClassName}>
            <section className='model-main'>
                {children}
                <div className='popup-section section-title-upload-popup'>
                    <FaAngleLeft size={18} className="app-button_back" onClick={handleClose}/>
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
                            <FaCheck size={24} color="green" />
                            <p>{droppedFile.name}</p>
                            <button className="app-button__upload app-button" onClick={resetFileState}> Cancel </button>
                        </>
                    ) : (
                        <p>Drop your file</p>  
                    )}
                </div>
                <div className='popup-section'>
                    <button className="app-button__upload app-button" onClick={handleFileUpload}>Upload</button>
                </div>
            </section>
        </div>
    );

}

export default UploadPopup;