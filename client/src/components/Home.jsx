import React, { useEffect, useState, useCallback } from 'react';
import {useWeb3} from '../helpers/web3Client';
import DisplayUplDocs from './HomeSections/DisplayUplDocs';
import FileActions from './HomeSections/FileActions';
import AuditLog from './HomeSections/AuditLog';
import UploadPopup from './Popups/UploadPopup';
import Logout from './HomeSections/Logout';
import SharePopup from './Popups/SharePopup';
import FileApp from '../helpers/FileApp';

const Home = () => {

    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showUploadPopup, setShowUploadPopup] = useState(false);
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [showSharePopup, setShowSharePopup] = useState(false);
    const [showVerifyPopup, setShowVerifyPopup] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [fileManagerContract, setFileManagerContract] = useState(null);


    const [selectedFile, setSelectedFile] = useState(null);

    const [maxFilesPerColumn, setMaxFilesPerColumn] = useState(5);
    const { fileManagerFacadeInstance } = useWeb3();

    // Get Files
    const fetchFiles = useCallback(async () => {
        setSelectedUser(fileManagerFacadeInstance.current.selectedUser);
        setFileManagerContract(fileManagerFacadeInstance.current.fileManagerContract);
        if (fileManagerContract!=null && selectedUser!=null) {
            await fileManagerFacadeInstance.current.getFilesUploadedBlockchain(fileManagerContract, selectedUser).then((files) => {
                if(files.length !== 0){
                    setUploadedFiles(files);
                }
            }).catch(err => {
                console.log(err);
            })
            .finally( () => {
                setLoading(false);   
            });
        }
        
    }, [fileManagerFacadeInstance, selectedUser, fileManagerContract]);

    // This component runs after the component has mounted
    useEffect(() => {
        fetchFiles();
        // Add event listener for window resize
        window.addEventListener('resize', handleWindowResize);
        // Cleanup the event listener on component unmount
        return () => {
            window.removeEventListener('resize', handleWindowResize);
        }

    }, [fetchFiles]);

    // Handle window resize
    const handleWindowResize = () => {
        // Adjust maxFilesPerColumn based on window width
        const windowWidth = window.innerWidth;
        if (windowWidth < 600) {
            setMaxFilesPerColumn(2);
        } else if (windowWidth < 900) {
            setMaxFilesPerColumn(3);
        } else {
            setMaxFilesPerColumn(7);
        }
    }

    // Sends the file to IPFS and receivs a CID - a hash that is unique to the stored file
    const handleUpload = async (tempUpdatedUploadedFiles) => {
        setUploadedFiles(tempUpdatedUploadedFiles);        
        handleClosePopup("upload");
    };

    // Placeholder functions for file actions (upload, delete, share)
    const handleOpenPopup = (chosenAction) => {
        switch (chosenAction) {
            case "upload": 
                setShowUploadPopup(true);
                return;
            case FileApp.FilePermissions.Delete:
                setShowDeletePopup(true);
                return;
            case FileApp.FilePermissions.Share:
                setShowSharePopup(true);
                return;
            case FileApp.FilePermissions.Verify:
                setShowVerifyPopup(true);
                return;
            default:
                console.log("NOT A VALID OPERATION: ", chosenAction);
                return;
        }
    };

    // Performs setup of closing popup
    const handleClosePopup = (chosenAction) => {
        switch(chosenAction) {
            case "upload": 
                setShowUploadPopup(false);
                return;
            case FileApp.FilePermissions.Delete:
                setShowDeletePopup(false);
                return;
            case FileApp.FilePermissions.Share:
                setShowSharePopup(false);
                return;
            case FileApp.FilePermissions.Verify:
                setShowVerifyPopup(false);
                return;
            default:
                console.log("NOT A VALID OPERATION: ", chosenAction);
                return;
        }
    }

    return (
        <>
            {fileManagerContract && selectedUser && (
                <> 
                    <div className='content-container'>
                    <Logout selectedUser={selectedUser}/>
                    <div className='home-wrapper content-wrapper'>
                        <div className='shadow-overlay shadow-overlay-home'></div>
                            {
                                <FileActions fileManagerFacadeInstance={fileManagerFacadeInstance.current} handleOpenPopup={handleOpenPopup} selectedFile={selectedFile}/>
                            }
                            <div className='uplBackground'>
                                <DisplayUplDocs selectedFile={selectedFile} setSelectedFile={setSelectedFile} uploadedFiles={uploadedFiles} loading={loading} maxFilesPerColumn={maxFilesPerColumn}/> 
                            </div>
                        </div>
                    </div>
                
                    <div className='content-container'>
                        <div className='home-wrapper content-wrapper'>
                            <div className='shadow-overlay shadow-overlay-home'></div>
                            <h1 className='auditlog-header'>Audit Log</h1>
                            <AuditLog/>
                        </div>
                    </div>
                    <UploadPopup fileManagerFacadeInstance={fileManagerFacadeInstance.current} handleFileUploaded={handleUpload} uploadedFiles={uploadedFiles} show={showUploadPopup} handleClosePopup={handleClosePopup} /> 
                    <SharePopup  fileManagerFacadeInstance={fileManagerFacadeInstance.current} show={showSharePopup} handleClosePopup={handleClosePopup} selectedFile={selectedFile}/>
                </>
            )}
            
            
        </>
    );

}

export default Home;