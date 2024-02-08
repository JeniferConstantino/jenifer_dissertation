import React, { useEffect, useState, useCallback } from 'react';
import {useWeb3} from '../helpers/web3Client';
import DisplayUplDocs from './HomeSections/DisplayUplDocs';
import FileActions from './HomeSections/FileActions';
import AuditLog from './HomeSections/AuditLog';
import UploadPopup from './Popups/UploadPopup';
import Logout from './HomeSections/Logout';
import FileHandler from '../helpers/fileHandler';
import SharePopup from './Popups/SharePopup';

const Home = () => {

    // TODO: I think this will have to change and instead I'll have to keep an array of uploaded files. (This way I can also get the file name)
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showUploadPopup, setShowUploadPopup] = useState(false);
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [showSharePopup, setShowSharePopup] = useState(false);
    const [showVerifyPopup, setShowVerifyPopup] = useState(false);

    const [selectedFile, setSelectedFile] = useState(null);

    const [maxFilesPerColumn, setMaxFilesPerColumn] = useState(5);
    const {selectedUser, storeFileContract} = useWeb3();

    // Get Files
    const fetchFiles = useCallback(async () => {
        FileHandler.getFilesUploadedBlockchain(storeFileContract, selectedUser).then((files) => {
            if(files.length !== 0){
                setUploadedFiles(files);
            }
        }).catch(err => {
            console.log(err);
        })
        .finally( () => {
            setLoading(false);   
        });
    }, [storeFileContract, selectedUser]);

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
    const handleUpload = async (e, tempUpdatedUploadedFiles) => {
        setUploadedFiles(tempUpdatedUploadedFiles);        
        handleClosePopup("upload");
    };

    // Placeholder functions for file actions (upload, delete, share)
    const handleOpenPopup = (chosenAction) => {
        switch (chosenAction) {
            case "upload": 
                setShowUploadPopup(true);
                return;
            case FileHandler.FilePermissions.Delete:
                setShowDeletePopup(true);
                return;
            case FileHandler.FilePermissions.Share:
                setShowSharePopup(true);
                return;
            case FileHandler.FilePermissions.Verify:
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
            case FileHandler.FilePermissions.Delete:
                setShowDeletePopup(false);
                return;
            case FileHandler.FilePermissions.Share:
                setShowSharePopup(false);
                return;
            case FileHandler.FilePermissions.Verify:
                setShowVerifyPopup(false);
                return;
            default:
                console.log("NOT A VALID OPERATION: ", chosenAction);
                return;
        }
    }

    return (
        <>
            <div className='content-container'>
                <Logout />
                <div className='home-wrapper content-wrapper'>
                    <div className='shadow-overlay shadow-overlay-home'></div>
                    <FileActions handleOpenPopup={handleOpenPopup} selectedUser={selectedUser} selectedFile={selectedFile}/>
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

            <UploadPopup handleFileUploaded={handleUpload} uploadedFiles={uploadedFiles} show={showUploadPopup} selectedUser={selectedUser} handleClosePopup={handleClosePopup} /> 
            <SharePopup  show={showSharePopup} handleClosePopup={handleClosePopup} selectedFile={selectedFile} selectedUser={selectedUser}/>
        </>
    );

}

export default Home;