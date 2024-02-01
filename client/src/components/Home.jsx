import React, { useEffect, useState, useCallback } from 'react';
import {useWeb3} from '../helpers/web3Client';
import DisplayUplDocs from './HomeSections/DisplayUplDocs';
import nearsoftLogo from '../imgs/nearsoftLogo.png';
import FileActions from './HomeSections/FileActions';
import AuditLog from './HomeSections/AuditLog';
import UploadPopup from './Popups/UploadPopup';
import Logout from './HomeSections/Logout';
import FileHandler from '../helpers/fileHandler';

const Home = () => {

    // TODO: I think this will have to change and instead I'll have to keep an array of uploaded files. (This way I can also get the file name)
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showUploadPopup, setShowUploadPopup] = useState(false);
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
        handleCloseUploadPopup();
    };

    // Placeholder functions for file actions (upload, delete, share)
    const handleOpenUploadPopup = () => {
        setShowUploadPopup(true);
    }

    // Performs setup of closing popup
    const handleCloseUploadPopup = () => {
        setShowUploadPopup(false);
    }

    // Handle file deletion
    const handleDelete = () => {
        console.log('Delete file...');
    };

    // Handle file share
    const handleShare = () => {
        console.log('Share file...');
    };

    return (
        <>
            <div className='content-container'>
                <img className='nearsoftLogo' src={nearsoftLogo} alt='Logo'/>
                <Logout selectedUser={selectedUser}/>
                <div className='home-wrapper content-wrapper'>
                    <div className='shadow-overlay shadow-overlay-home'></div>
                    <FileActions handleOpenUploadPopup={handleOpenUploadPopup} onDelete={handleDelete} onShare={handleShare} />
                    <div className='uplBackground'>
                        <DisplayUplDocs uploadedFiles={uploadedFiles} loading={loading} maxFilesPerColumn={maxFilesPerColumn} selectedUser={selectedUser}/>
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

            <UploadPopup handleFileUploaded={handleUpload} uploadedFiles={uploadedFiles} show={showUploadPopup} selectedUser={selectedUser} handleClose={handleCloseUploadPopup} /> 
        </>
    );

}

export default Home;