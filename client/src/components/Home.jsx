import React, { useEffect, useState } from 'react';
import {useWeb3} from '../helpers/web3Client';
import DisplayUplDocs from './HomeSections/DisplayUplDocs';
import nearsoftLogo from '../imgs/nearsoftLogo.png';
import FileActions from './HomeSections/FileActions';
import AuditLog from './HomeSections/AuditLog';
import UploadPopup from './Popups/UploadPopup';


const Home = () => {

    // TODO: I think this will have to change and instead I'll have to keep an array of uploaded files. (This way I can also get the file name)
    const [ipfsCIDAndType, setIpfsCIDAndType] = useState(new Map());
    const [loading, setLoading] = useState(true);
    const [showUploadPopup, setShowUploadPopup] = useState(false);
    const [maxFilesPerColumn, setMaxFilesPerColumn] = useState(5);
    const {selectedAccount, logOut, getIPFSHashesBlockchain} = useWeb3();

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
        console.log("fetching");
        getIPFSHashesBlockchain().then((files) => {
            console.log("files length: ", files.length);
            if(files.length !== 0){
                var tempMap = new Map();
                files.forEach((file, index) => {
                    console.log("file.ipfsCID: ", file.ipfsCID, "file.fileType", file.fileType);
                    tempMap.set(file.ipfsCID, file.fileType);
                });
                
                setIpfsCIDAndType(tempMap);
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
    const handleUpload = async (e, tempUpdatedIpfsCidAndType) => {
        setIpfsCIDAndType(tempUpdatedIpfsCidAndType);        
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

    return (
        <>
            <div className='content-container'>
                <img className='nearsoftLogo' src={nearsoftLogo} alt='Logo'/>
                <button className='app-button app-button__logout' onClick={handleLogout}> Logout </button>
                <div className='home-wrapper content-wrapper'>
                    <div className='shadow-overlay shadow-overlay-home'></div>
                    <FileActions handleOpenUploadPopup={handleOpenUploadPopup} onDelete={handleDelete} onShare={handleShare} />
                    <div className='uplBackground'>
                        <DisplayUplDocs ipfsCIDAndType={ipfsCIDAndType} loading={loading} maxFilesPerColumn={maxFilesPerColumn}/>
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

            <UploadPopup handleFileUploaded={handleUpload} ipfsCIDAndType={ipfsCIDAndType} show={showUploadPopup} selectedAccount={selectedAccount} handleClose={handleCloseUploadPopup} /> 
        </>
    );

}

export default Home;