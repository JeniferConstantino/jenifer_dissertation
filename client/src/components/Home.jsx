import React, { useEffect, useState } from 'react';
import {useWeb3} from '../helpers/web3Client';
import DisplayUplDocs from './HomeSections/DisplayUplDocs';
import nearsoftLogo from '../imgs/nearsoftLogo.png';
import FileActions from './HomeSections/FileActions';
import AuditLog from './HomeSections/AuditLog';
import UploadPopup from './Popups/UploadPopup';
import { GoPerson   } from "react-icons/go";


const Home = () => {

    // TODO: I think this will have to change and instead I'll have to keep an array of uploaded files. (This way I can also get the file name)
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showUploadPopup, setShowUploadPopup] = useState(false);
    const [maxFilesPerColumn, setMaxFilesPerColumn] = useState(5);
    const {selectedAccount, selectedUser, logOut, getFilesUploadedBlockchain} = useWeb3();

    // This component runs after the component has mounted
    useEffect(() => {
        fetchIPFSHashes();

        // Add event listener for window resize
        window.addEventListener('resize', handleWindowResize);

        // Cleanup the event listener on component unmount
        return () => {
            window.removeEventListener('resize', handleWindowResize);
        }

    }, []);

    // Get the IPFS Hash
    const fetchIPFSHashes = async () => {
        getFilesUploadedBlockchain().then((files) => {
            if(files.length !== 0){
                setUploadedFiles(files);
            }
        }).catch(err => {
            console.log(err);
        })
        .finally( () => {
            setLoading(false);   
        });
    };

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

    // Performs the users' loggout
    const handleLogout = () => {           
        logOut();              
    }

    // Placeholder functions for file actions (upload, delete, share)
    const handleOpenUploadPopup = () => {
        setShowUploadPopup(true);
    }

    const handleCloseUploadPopup = () => {
        setShowUploadPopup(false);
    }

    const handleDelete = () => {
        console.log('Delete file...');
        // Implement your delete logic here
    };

    const handleShare = () => {
        console.log('Share file...');
        // Implement your share logic here
    };

    // TODO: LATER, EXTRACT THE TOP LOGOUT MENU TO A COMPONENT
    return (
        <>
            <div className='content-container'>
                <img className='nearsoftLogo' src={nearsoftLogo} alt='Logo'/>
                <div className='logout-section'>
                    <div className="icon-column">
                        <GoPerson className='icon-person'/>
                    </div>
                    <div className='button-column'>
                        <p className='username-text'>Username: {selectedUser.current.name}</p>
                        <button className='app-button app-button__logout' onClick={handleLogout}> Logout </button> 
                    </div>
                </div>
                <div className='home-wrapper content-wrapper'>
                    <div className='shadow-overlay shadow-overlay-home'></div>
                    <FileActions handleOpenUploadPopup={handleOpenUploadPopup} onDelete={handleDelete} onShare={handleShare} />
                    <div className='uplBackground'>
                        <DisplayUplDocs uploadedFiles={uploadedFiles} loading={loading} maxFilesPerColumn={maxFilesPerColumn}/>
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

            <UploadPopup handleFileUploaded={handleUpload} uploadedFiles={uploadedFiles} show={showUploadPopup} selectedAccount={selectedAccount} handleClose={handleCloseUploadPopup} /> 
        </>
    );

}

export default Home;