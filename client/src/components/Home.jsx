import React, { useEffect, useState, useCallback } from 'react';
import {useWeb3} from '../helpers/web3Client';
import DisplayUplDocs from './HomeSections/DisplayUplDocs';
import FileActions from './HomeSections/FileActions';
import AuditLog from './HomeSections/AuditLog';
import UploadPopup from './ActionsOverFiles/UploadPopup';
import EditPopup from './ActionsOverFiles/EditPopup';
import VeifyPopup from './ActionsOverFiles/VeifyPopup';
import InfoFilePopup from './ActionsOverFiles/InfoFilePopup';
import Download from './ActionsOverFiles/Download'
import Delete from './ActionsOverFiles/Delete'
import Logout from './HomeSections/Logout';
import Menu from './HomeSections/Menu';
import SharePopup from './ActionsOverFiles/SharePopup';
import { FileApp } from '../helpers/FileApp';
import UserApp from '../helpers/UserApp';
import { useNavigate } from 'react-router-dom';
import SessionExpirationHandler from './SessionExpirationHandler';
import InfoPopup from './Infos/InfoPopup';
import { FcHighPriority } from "react-icons/fc";

const Home = () => {
    const [isUploadPopupDisplayed, setIsUploadPopupDisplayed] = useState(false);
    const [isEditPopupDisplayed, setIsEditPopupDisplayed] = useState(false);
    const homeClassName = isUploadPopupDisplayed || isEditPopupDisplayed ? 'content-container blurred' : 'content-container';

    const [permissions, setPermissions] = useState([]);
    const [uploadedActiveFiles, setUploadedActiveFiles] = useState([]);
    const [uploadedFiles, setUploadedFiles ] = useState([]);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showUploadPopup, setShowUploadPopup] = useState(false);
    const [showEditPopup, setShowEditPopup] = useState(false);
    const [showDownloadPopup, setShowDownloadPopup] = useState(false);
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [showSharePopup, setShowSharePopup] = useState(false);
    const [showVerifyPopup, setShowVerifyPopup] = useState(false);
    const [showInfoPopup, setShowInfoPopup] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showInfoFilePopup, setShowInfoFilePopup] = useState(false);
    const [message, setMessage] = useState("");
    const [titleInfoNamePopup, setTitleInfoNamePopup] = useState("");

    const [selectedFile, setSelectedFile] = useState(null);

    const [maxFilesPerColumn, setMaxFilesPerColumn] = useState(5);
    const [refreshPage, setRefreshPage] = useState(false);
    const { initializeFileManagerFacadeWContracts, setFileManagerFacadeWSelectedAccount, setsFileManagerFacadeWSelectedUser, fileManagerFacadeInstance, logOut } = useWeb3();

    const navigate = useNavigate();

    // Get Active Files
    const fetchActiveFiles = useCallback(async () => {
        setSelectedUser(fileManagerFacadeInstance.current.selectedUser);
        if (selectedUser!=null) {
            await fileManagerFacadeInstance.current.getFilesUploadedBlockchain(selectedUser, "active").then((files) => {
                if(files.length !== 0){
                    setUploadedActiveFiles(files);
                }
            }).catch(err => {
                // eslint-disable-next-line security-node/detect-crlf
                console.log(err);
            })
            .finally( () => {
                setLoading(false);   
            });
        }
    }, [fileManagerFacadeInstance, selectedUser]);

    // Get all files (be them active or deactive)
    const fetchFiles = useCallback(async () => {
        if (selectedUser!=null) {
            await fileManagerFacadeInstance.current.getFilesUploadedBlockchain(selectedUser, "").then((files) => {
                if(files.length !== 0){
                    setUploadedFiles(files);
                }
            }).catch(err => {
                // eslint-disable-next-line security-node/detect-crlf
                console.log(err);
            })
            .finally( () => {
                setLoading(false);   
            });
        }
    }, [fileManagerFacadeInstance, selectedUser]);

    // Get Logs
    const fetchLogs = useCallback(async () => {
        if (uploadedActiveFiles!=null && selectedUser!=null) {
            await fileManagerFacadeInstance.current.getLogsUserFilesBlockchain(uploadedFiles, selectedUser).then((result) => {
                if (result.success) {
                    setLogs(result.logs);
                    return;
                }
            }).catch(err => {
                // eslint-disable-next-line security-node/detect-crlf
                console.log(err);
            })
            .finally( () => {
                setLoading(false);   
            });
        }
    }, [uploadedActiveFiles, selectedUser, fileManagerFacadeInstance, uploadedFiles]);

    useEffect(() => {
        async function fetchData() {
            // Initializes FileManagerFacadeInstance with contracts
            await initializeFileManagerFacadeWContracts();

            // Sets the FileManagerFacadeInstance with the selectedAccount
            await setFileManagerFacadeWSelectedAccount();

            // Verifies if the account exists  in the dApp
            await UserApp.getUserWithAccount(fileManagerFacadeInstance.current).then( async (resultUser) => {
                if (resultUser.success == false) {
                    console.log("User first time in the app");
                    navigate('/');
                    return;
                }
                console.log("User already in the app.");
                await setsFileManagerFacadeWSelectedUser(resultUser.user);
                setSelectedUser(fileManagerFacadeInstance.current.selectedUser.current);
                navigate('/home');
            }).catch( err => {
                // eslint-disable-next-line security-node/detect-crlf
                console.log(err);
            });
        }
        fetchData();
    }, [fileManagerFacadeInstance, initializeFileManagerFacadeWContracts, navigate, setFileManagerFacadeWSelectedAccount, setsFileManagerFacadeWSelectedUser]);

    // This component runs after the component has mounted
    useEffect(() => {
        fetchActiveFiles();
        handleWindowResize();
        // Add event listener for window resize
        window.addEventListener('resize', handleWindowResize);
        // Cleanup the event listener on component unmount
        return () => {
            window.removeEventListener('resize', handleWindowResize);
        }

    }, [fetchActiveFiles, refreshPage]);
    
    useEffect(() => {
        fetchFiles();
    }, [fetchFiles, refreshPage]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs, refreshPage]);

    // Get the logs
    const getLogs = async () => {
        await fileManagerFacadeInstance.current.getLogsUserFilesBlockchain(uploadedFiles, selectedUser).then((result) => {
            if (result.success) {
                setLogs(result.logs);
                return;
            }
        }).catch(err => {
            // eslint-disable-next-line security-node/detect-crlf
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
            setMaxFilesPerColumn(5);
        }
    }

    // Closes popup and updates uploaded files
    const handleUpload = async (popupToClose) => {
        try {
            await getLogs();
            setRefreshPage(prevState => !prevState);
            handleClosePopup(popupToClose);
            setSelectedFile(null);
        } catch (error) {
            // eslint-disable-next-line security-node/detect-crlf
            console.log("error: ", error);
        }
    };

    // Closes popup and updates logs
    const handleDownloaded = async () => {
        await getLogs();
        handleClosePopup(FileApp.FilePermissions.Download);
    }

    // Coses popup and delets file
    const handleFileDeleted = async (tempUpdatedUploadedActiveFiles) => {
        await getLogs();
        setUploadedActiveFiles(tempUpdatedUploadedActiveFiles);   
        handleClosePopup(FileApp.FilePermissions.Delete);
        setSelectedFile(null);
    }

    // Closes popup and updates logs
    const handleShare = async () => {
        await getLogs();
        handleClosePopup(FileApp.FilePermissions.Share);
    }

    // Closes verify popup
    const handleVerify = async () => {
        await getLogs();
        handleClosePopup(FileApp.FilePermissions.Verify);
    }

    // Placeholder functions for file actions (upload, delete, share)
    const handleOpenPopup = (chosenAction) => {
        switch (chosenAction) {
            case "upload": 
                setIsUploadPopupDisplayed(true);
                setShowUploadPopup(true);
                return;
            case FileApp.FilePermissions.Download: 
                setShowDownloadPopup(true);
                return;
            case FileApp.FilePermissions.Edit:
                setIsEditPopupDisplayed(true);
                setShowEditPopup(true); 
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
            case FileApp.FilePermissions.Info:
                setShowInfoPopup(true);
                return;
            default:
                console.log("The action chosen was not valid.");
                return;
        }
    };

    // Performs setup of closing popup
    const handleClosePopup = async (chosenAction) => {
        switch(chosenAction) {
            case "upload": 
                setIsUploadPopupDisplayed(false);
                setShowUploadPopup(false);
                return;
            case FileApp.FilePermissions.Download: 
                setShowDownloadPopup(false);
                return;
            case FileApp.FilePermissions.Edit:
                setIsEditPopupDisplayed(false);
                setShowEditPopup(false);
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
            case FileApp.FilePermissions.Info:
                setShowInfoPopup(false);
                return;
            default:
                console.log("The chosen operation to close was not valid");
            return;
        }
    }

    // handles the session expiration
    const handleSessionExpired = async () => {
        setShowInfoFilePopup(true);
        setMessage("Oops! It looks like your session has timed out. Please log in again.");
        setTitleInfoNamePopup("Attention");
    }

    // Redirects the user to the sign in, once the session has expired
    const handleContinueSessionEnd = async () => {
        logOut();
    }

    const iconComponent = FcHighPriority;

    return (
        <>
            <SessionExpirationHandler handleSessionExpire={handleSessionExpired}/>
            {selectedUser && (
                <> 
                    <div id="files-section" className={homeClassName}>
                        <div className='menu-wrapper'>
                            <Menu/>
                            <Logout selectedUser={selectedUser}/>
                        </div>
                        <div className='home-wrapper content-wrapper'>
                            <FileActions fileManagerFacadeInstance={fileManagerFacadeInstance.current} handleOpenPopup={handleOpenPopup} selectedFile={selectedFile} setPermissions={setPermissions} permissions={permissions}/>
                            <DisplayUplDocs selectedFile={selectedFile} setSelectedFile={setSelectedFile} uploadedActiveFiles={uploadedActiveFiles} loading={loading} maxFilesPerColumn={maxFilesPerColumn}/> 
                            <div className='shadow-overlay shadow-overlay-home'></div>
                        </div>
                    </div>
                

                    <div id="audit-log-section" className={homeClassName}>
                        <div className='home-wrapper content-wrapper'>
                            <AuditLog logs={logs} fileManagerFacadeInstance={fileManagerFacadeInstance.current}/>
                            <div className='shadow-overlay shadow-overlay-home'></div>
                        </div>
                    </div>                    
                    
                    <UploadPopup fileManagerFacadeInstance={fileManagerFacadeInstance.current} handleFileUploaded={handleUpload} uploadedActiveFiles={uploadedActiveFiles} uploadedFiles={uploadedFiles} show={showUploadPopup}/> 
                    <EditPopup fileManagerFacadeInstance={fileManagerFacadeInstance.current} handleFileUploaded={handleUpload} selectedFile={selectedFile} uploadedActiveFiles={uploadedActiveFiles} uploadedFiles={uploadedFiles} handleClosePopup={handleClosePopup} show={showEditPopup} /> 
                    <VeifyPopup fileManagerFacadeInstance={fileManagerFacadeInstance.current} handleVerify={handleVerify} show={showVerifyPopup}/>
                    <SharePopup  fileManagerFacadeInstance={fileManagerFacadeInstance.current} handleShare={handleShare} show={showSharePopup} selectedFile={selectedFile}/>
                    <Download  fileManagerFacadeInstance={fileManagerFacadeInstance.current} handleDownloaded={handleDownloaded} show={showDownloadPopup} handleClosePopup={handleClosePopup} selectedFile={selectedFile}/>
                    <Delete fileManagerFacadeInstance={fileManagerFacadeInstance.current} handleFileDeleted={handleFileDeleted} uploadedActiveFiles={uploadedActiveFiles} show={showDeletePopup} selectedFile={selectedFile}/>
                    <InfoFilePopup fileManagerFacadeInstance={fileManagerFacadeInstance.current} selectedFile={selectedFile} handleClosePopup={handleClosePopup} permissions={permissions} show={showInfoPopup}/>
                    {showInfoFilePopup && (
                        <div className='modal-wrapper'>
                            <InfoPopup handleContinue={handleContinueSessionEnd} message={message} title={titleInfoNamePopup} showInfoPopup = {showInfoFilePopup} iconComponent={iconComponent} changeWithButton={true} mnemonic={""}/>
                        </div>
                    )}
                </>
            )}
        </>
    );

}

export default Home;