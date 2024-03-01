import React, { useEffect, useState, useCallback } from 'react';
import {useWeb3} from '../helpers/web3Client';
import DisplayUplDocs from './HomeSections/DisplayUplDocs';
import FileActions from './HomeSections/FileActions';
import AuditLog from './HomeSections/AuditLog/AuditLog';
import UploadPopup from './ActionsOverFiles/UploadPopup';
import Download from './ActionsOverFiles/Download'
import Logout from './HomeSections/Logout';
import SharePopup from './ActionsOverFiles/SharePopup';
import FileApp from '../helpers/FileApp';

const Home = () => {

    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showUploadPopup, setShowUploadPopup] = useState(false);
    const [showDownloadPopup, setShowDownloadPopup] = useState(false);
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [showSharePopup, setShowSharePopup] = useState(false);
    const [showVerifyPopup, setShowVerifyPopup] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const [selectedFile, setSelectedFile] = useState(null);

    const [maxFilesPerColumn, setMaxFilesPerColumn] = useState(5);
    const { fileManagerFacadeInstance } = useWeb3();

    // Get Files
    const fetchFiles = useCallback(async () => {
        setSelectedUser(fileManagerFacadeInstance.current.selectedUser);
        if (selectedUser!=null) {
            await fileManagerFacadeInstance.current.getFilesUploadedBlockchain(selectedUser).then((files) => {
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
        
    }, [fileManagerFacadeInstance, selectedUser]);

    // Get Logs
    const fetchLogs = useCallback(async () => {
        if (uploadedFiles!=null && selectedUser!=null) {
            await fileManagerFacadeInstance.current.getLogsUserFilesBlockchain(uploadedFiles, selectedUser).then((result) => {
                if (result.success) {
                    setLogs(result.logs);
                    return;
                }
            }).catch(err => {
                console.log(err);
            })
            .finally( () => {
                setLoading(false);   
            });
        }
    }, [fileManagerFacadeInstance, uploadedFiles, selectedUser]);

    // This component runs after the component has mounted
    useEffect(() => {
        fetchFiles();
        handleWindowResize();
        // Add event listener for window resize
        window.addEventListener('resize', handleWindowResize);
        // Cleanup the event listener on component unmount
        return () => {
            window.removeEventListener('resize', handleWindowResize);
        }

    }, [fetchFiles]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);
    

    // Get the logs
    const getLogs = async () => {
        await fileManagerFacadeInstance.current.getLogsUserFilesBlockchain(uploadedFiles, selectedUser).then((result) => {
            if (result.success) {
                setLogs(result.logs);
                return;
            }
        }).catch(err => {
            console.log(err);
        }).finally( () => {
            setLoading(false);   
        });
    }

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

    // Closes popup and updates uploaded files
    const handleUpload = async (tempUpdatedUploadedFiles) => {
        try {
            setUploadedFiles(tempUpdatedUploadedFiles);   
            handleClosePopup("upload");
        } catch (error) {
            console.log("error: ", error);
        }
    };

    // Closes popup and updates logs
    const handleDownloaded = async () => {
        await getLogs();
        handleClosePopup(FileApp.FilePermissions.Download);
    }

    // Closes popup and updates logs
    const handleShare = async () => {
        await getLogs();
        handleClosePopup(FileApp.FilePermissions.Share);
    }

    // Placeholder functions for file actions (upload, delete, share)
    const handleOpenPopup = (chosenAction) => {
        switch (chosenAction) {
            case "upload": 
                setShowUploadPopup(true);
                return;
            case FileApp.FilePermissions.Download: 
                setShowDownloadPopup(true);
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
    const handleClosePopup = async (chosenAction) => {
        switch(chosenAction) {
            case "upload": 
                setShowUploadPopup(false);
                return;
            case FileApp.FilePermissions.Download: 
                setShowDownloadPopup(false);
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
            {selectedUser && (
                <> 
                    <div className='content-container'>
                        <Logout selectedUser={selectedUser}/>
                        <div className='home-wrapper content-wrapper'>
                            <FileActions fileManagerFacadeInstance={fileManagerFacadeInstance.current} handleOpenPopup={handleOpenPopup} selectedFile={selectedFile}/>
                            <DisplayUplDocs selectedFile={selectedFile} setSelectedFile={setSelectedFile} uploadedFiles={uploadedFiles} loading={loading} maxFilesPerColumn={maxFilesPerColumn}/> 
                            <div className='shadow-overlay shadow-overlay-home'></div>
                        </div>
                    </div>
                
                    <div className='content-container'>
                        <div className='home-wrapper content-wrapper'>
                            <AuditLog logs={logs} fileManagerFacadeInstance={fileManagerFacadeInstance.current}/>
                            <div className='shadow-overlay shadow-overlay-home'></div>
                        </div>
                    </div>
                    <UploadPopup fileManagerFacadeInstance={fileManagerFacadeInstance.current} handleFileUploaded={handleUpload} uploadedFiles={uploadedFiles} show={showUploadPopup} handleClosePopup={handleClosePopup} /> 
                    <SharePopup  fileManagerFacadeInstance={fileManagerFacadeInstance.current} handleShare={handleShare} show={showSharePopup} selectedFile={selectedFile}/>
                    <Download  fileManagerFacadeInstance={fileManagerFacadeInstance.current} handleDownloaded={handleDownloaded} show={showDownloadPopup} handleClosePopup={handleClosePopup} selectedFile={selectedFile}/>
                </>
            )}
        </>
    );

}

export default Home;