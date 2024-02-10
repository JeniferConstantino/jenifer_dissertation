import React, { useEffect, useState } from 'react';
import { FcExternal , FcInternal, FcFullTrash , FcShare, FcOk  } from 'react-icons/fc';
import FileApp from '../../helpers/FileApp';
import BlockchainManager from '../../helpers/BlockchainManager';

const FileActions = ({fileManagerFacadeInstance, handleOpenPopup, selectedFile}) => {
    
    const [permissions, setPermissions] = useState([]);

    // When rendering, the permissions of the selected file are set
    useEffect( () => {
        const fetchPermissions = async () => {
            if (selectedFile) {
                const permissions = await BlockchainManager.getPermissionsUserOverFile(fileManagerFacadeInstance.storeFileContract, fileManagerFacadeInstance.selectedUser, selectedFile, fileManagerFacadeInstance.selectedUser);
                setPermissions(permissions);
            } else {
                setPermissions([]);
            }
        };

        fetchPermissions();
    }, [selectedFile, fileManagerFacadeInstance]);

    // Sets to open the popup for upload file
    const handlePopupOpenUpload = () => {
        handleOpenPopup("upload");
    }

    // Downloads the selected file
    const handleDownload = async () => {
        // Verifies if the user has permissions to download
        if (permissions.includes(FileApp.FilePermissions.Download)) {
            if (selectedFile === null) {
                console.log("Please select a file");
            } else {
                fileManagerFacadeInstance.downloadFile(selectedFile);
            }
        } else {
            console.log("User does't have permissions to download the file.");
        }
    }

    // Sets to open the popup to delete file
    const handlePopupOpenDelete = async () => {
        if (selectedFile === null) {
            console.log("Please select a file");
        } else {
            // Verifies if the user has permissions to delete
            if (permissions.includes(FileApp.FilePermissions.Delete)) {
                handleOpenPopup(FileApp.FilePermissions.Delete); 
            } else {
                console.log("User does't have permissions to delete the file.");
            } 
        }
    }

    // Sets to open the popup to share file
    const handlePopupOpenShare = async () => {
        if (selectedFile === null) {
            console.log("Please select a file");
        } else {
            // Verifies if the user has permissions to share
            if (permissions.includes(FileApp.FilePermissions.Share)) {
                handleOpenPopup(FileApp.FilePermissions.Share); 
            } else {
                console.log("User does't have permissions to share the file.");
            }
        }
    }

    // Sets to open the popup to verify file
    const handlePopupOpenVerify = async () => {
        if (selectedFile === null) {
            console.log("Please select a file");
        } else {
            // Verifies if the user has permissions to verify
            if (permissions.includes(FileApp.FilePermissions.Verify)) {
                handleOpenPopup(FileApp.FilePermissions.Verify); 
            } else {
                console.log("User does't have permissions to verify the file.");
            }
        }
    }

    return (
        <div className="file-actions-wrapper">
            <h1 className='files-header'>Files</h1>
            <button onClick={handlePopupOpenUpload}>
                <FcExternal size={25} />
            </button>
            <button onClick={handleDownload}>
                <FcInternal className={!(selectedFile && permissions.includes(FileApp.FilePermissions.Download)) ? "faded" : "not-faded"} size={25}/>
            </button>
            <button onClick={handlePopupOpenDelete}>
                <FcFullTrash  className={!(selectedFile && permissions.includes(FileApp.FilePermissions.Delete)) ? "faded" : "not-faded"} size={25} />
            </button>
            <button onClick={handlePopupOpenShare}>
                <FcShare className={!(selectedFile && permissions.includes(FileApp.FilePermissions.Share)) ? "faded" : "not-faded"} size={25} />
            </button>
            <button onClick={handlePopupOpenVerify}>
                <FcOk  className={!(selectedFile && permissions.includes(FileApp.FilePermissions.Verify)) ? "faded" : "not-faded"} size={25} />
            </button>
        </div>
    );
}

export default FileActions;