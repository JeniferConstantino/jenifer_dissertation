import React, { useEffect, useCallback, useState } from 'react';
import { FaAngleLeft } from "react-icons/fa6";

const InfoFilePopup = ({fileManagerFacadeInstance, selectedFile, handleClosePopup, show, children}) => {

    const showHideClassName = show ? 'display-block' : 'display-none'; // controls the popup visibility
    const [uploadedFiles, setUploadedFiles ] = useState([]);

    // Get all edited files of the current selected file
    const fetchFiles = useCallback(async () => {
        if (selectedFile != null) {
            await fileManagerFacadeInstance.getPrevEditedFiles(selectedFile.ipfsCID).then((result) => {
                if (result.success) {   
                    if(result.files.length !== 0){
                        setUploadedFiles(result.files);
                    }
                } else {
                    console.log("Something went wrong while trying to get the previous edit files of the file: ", selectedFile.fileName);
                }
            }).catch(err => {
                console.log(err);
            })
        }
    }, [fileManagerFacadeInstance, selectedFile]);

    useEffect(() => {
        fetchFiles();
    }, [fetchFiles]);


    // Preforms the file download
    const handleDownload = (editName) => {
        console.log(`Downloading file for edit: ${editName}`);
    }

    // Sets to close the popup to verify a file
    const handleCloseVerifyPopup = () => {
        cleanFields();
        handleClosePopup("info"); 
    }

    const cleanFields = () => {
    }

    return(
        <>
            { selectedFile != null && (
                <div className={showHideClassName}>
                    <div className='modal-wrapper'>
                        <div className="modal-background"></div>
                        <div className="modal modal-info">
                            <section>
                                {children}
                                <div className='popup-section section-title-drop-popup'>
                                    <FaAngleLeft size={18} className="app-button_back" onClick={handleCloseVerifyPopup}/>
                                    <h2 className='drop-file-header'>File Information</h2>
                                </div>
                                <div className="file-details-section " >
                                    <div className='row'>
                                        <div className='column-lable'>
                                            <strong>Name</strong>
                                        </div>
                                        <div className='column'>
                                            {selectedFile.fileName}
                                        </div>
                                    </div>
                                    <div className='row'>
                                        <div className='column-lable'>
                                            <strong>Version</strong>
                                        </div>
                                        <div className='column'>
                                            {selectedFile.version}
                                        </div>
                                    </div>
                                    <div className='row'>
                                        <div className='column-lable'>
                                            <strong>Owner</strong>
                                        </div>
                                        <div className='column'>
                                            {selectedFile.owner}
                                        </div>
                                    </div>
                                    <div className='row'>
                                        <div className='column-lable'>
                                            <strong>IPFS CID</strong>
                                        </div>
                                        <div className='column'>
                                            {selectedFile.ipfsCID}
                                        </div>
                                    </div>
                                    <div className='row'>
                                        <div className='column-lable'>
                                            <strong>State</strong>
                                        </div>
                                        <div className='column'>
                                            {selectedFile.state}
                                        </div>
                                    </div>
                                </div>
                                <div className="previous-edits-section">
                                    <h4 className='info-prev-edits-title'>Previous Edits</h4>
                                    <div className="edit-list">
                                        <ul>
                                            {uploadedFiles.map((files, index) => (
                                                <li key={index} onClick={() => handleDownload(files[1])}>v.{files[2]} {files[1]}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default InfoFilePopup;