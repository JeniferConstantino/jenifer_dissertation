import React, { useEffect, useCallback, useState } from 'react';
import { FaAngleLeft } from "react-icons/fa6";
import { FcDown } from "react-icons/fc";
import { FileApp } from '../../helpers/FileApp';
import PropTypes from 'prop-types';

const InfoFilePopup = ({fileManagerFacadeInstance, selectedFile, handleClosePopup, show, permissions, children}) => {

    const showHideClassName = show ? 'display-block' : 'display-none'; // controls the popup visibility
    const [uploadedFiles, setUploadedFiles ] = useState([]);
    const [ownerName, setOwnerName ] = useState("");

    // Get all edited files of the current selected file
    const fetchFiles = useCallback(async () => {
        if (selectedFile != null) {
            await fileManagerFacadeInstance.getPrevEditedFiles(selectedFile.ipfsCID).then((result) => {
                if (result.success) {   
                    if(result.files.length !== 0){
                        setUploadedFiles(result.files);
                    }
                } else {
                    console.log("Something went wrong while trying to get the previous edit files of the selected file.");
                }
            }).catch(err => {
                // eslint-disable-next-line security-node/detect-crlf
                console.log(`Error occurred: ${err}`);
            })
        }
    }, [fileManagerFacadeInstance, selectedFile]);

    const fetchOwner = useCallback(async () => {
        if (selectedFile != null) {
            await fileManagerFacadeInstance.getUserUserName(selectedFile.owner).then((result) => {
                if (result.success) {   
                    setOwnerName(result.resultString);
                } else {
                    console.log("Something went wrong while trying to get the name of the file owner.");
                }
            });
        }
    }, [fileManagerFacadeInstance, selectedFile]);

    useEffect(() => {
        fetchFiles();
    }, [fetchFiles]);

    useEffect(() => {
        fetchOwner();
    }, [fetchOwner]);

    // Preforms the file download
    const handleDownload = async (file) => {
        // Verifies if the user has permissions to download
        if (permissions.includes(FileApp.FilePermissions.Download)) {
            const blob = await fileManagerFacadeInstance.downloadFile(file); 
            const downloadLink = document.createElement("a");
            downloadLink.href = URL.createObjectURL(blob);
            downloadLink.download = file.fileName;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        } else {
            console.log("User doesn't have permissions to download the file.");
        }
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
                                            {ownerName}
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
                                            {uploadedFiles.map((file, index) => (
                                                <div className='div-pre-edits' key={index}>
                                                    <FcDown className='icon-info' size={19}/>
                                                    <li key={index} onClick={() => handleDownload(file)}>  v.{file[2]} {file[1]}</li>
                                                </div>
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

InfoFilePopup.propTypes = {
    fileManagerFacadeInstance:PropTypes.object.isRequired,
    selectedFile:PropTypes.object,
    handleClosePopup:PropTypes.func.isRequired,
    handleOpenPopup: PropTypes.func,
    show: PropTypes.bool.isRequired,
    permissions: PropTypes.array.isRequired,
    children: PropTypes.object,
};

export default InfoFilePopup;