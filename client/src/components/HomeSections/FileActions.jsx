import React, { useEffect, useState } from 'react';
import { FcExternal , FcInternal, FcFullTrash , FcShare, FcOk  } from 'react-icons/fc';
import FileHandler from '../../helpers/fileHandler';
import {useWeb3} from '../../helpers/web3Client';

const FileActions = ({handleOpenPopup, selectedUser, selectedFile}) => {
    
    const {storeFileContract} = useWeb3();
    const [permissions, setPermissions] = useState([]);

    // When rendering the permissions of the selected file are set
    useEffect( () => {
        const fetchPermissions = async () => {
            if (selectedFile) {
                const permissions = await FileHandler.getPermissionsUserOverFile(storeFileContract, selectedUser.current, selectedFile, selectedUser);
                setPermissions(permissions);
            } else {
                setPermissions([]);
            }
        };

        fetchPermissions();
    }, [selectedFile, selectedUser, storeFileContract]);

    // Sets to open the popup for upload file
    const handlePopupOpenUpload = () => {
        handleOpenPopup("upload");
    }

    // Downloads the selected file
    const handleDownload = async () => {
        if (selectedFile === null) {
            console.log("Please select a file");
        } else {
            // Verifies if the user has permissions to download
            if (permissions.includes(FileHandler.FilePermissions.Download)) {
                try {
                    // Gets the file from IPFS
                    const fileContent = await FileHandler.getFileFromIPFS(selectedFile.ipfsCID);
                    console.log("Accessed file in IPFS.");
        
                    // Decrypts the file
                    const decryptedFileBuffer = await FileHandler.decryptFileWithSymmetricKey(storeFileContract, selectedFile, selectedUser, fileContent);
                    const blob = new Blob([decryptedFileBuffer]);
                    console.log("File Decrypted.");
                    
                    // Creates a downloaded link 
                    const downloadLink = document.createElement("a");
                    downloadLink.href = URL.createObjectURL(blob);
                    downloadLink.download = selectedFile.fileName;
                    document.body.appendChild(downloadLink);
                    downloadLink.click();
                    document.body.removeChild(downloadLink);
                } catch (error) {
                    console.error("Error decrypting or downloading file: ", error);
                }
            } else {
                console.log("User does't have permissions to download the file.");
            }
        }
    }

    // Sets to open the popup to delete file
    const handlePopupOpenDelete = async () => {
        // Verifies if the user has permissions to delete
        if (selectedFile !== null) {
            if (permissions.includes(FileHandler.FilePermissions.Delete)) {
                handleOpenPopup(FileHandler.FilePermissions.Delete); 
            } else {
                console.log("User does't have permissions to delete the file.");
            } 
        } else {
            console.log("Please select a file");
        } 
    }

    // Sets to open the popup to share file
    const handlePopupOpenShare = async () => {
        if (selectedFile !== null) {
            // Verifies if the user has permissions to share
            if (permissions.includes(FileHandler.FilePermissions.Share)) {
                handleOpenPopup(FileHandler.FilePermissions.Share); 
            } else {
                console.log("User does't have permissions to share the file.");
            }
        } else {
            console.log("Please select a file");
        }   
    }

    // Sets to open the popup to verify file
    const handlePopupOpenVerify = async () => {
        if (selectedFile !== null) {
            // Verifies if the user has permissions to verify
            if (permissions.includes(FileHandler.FilePermissions.Verify)) {
                handleOpenPopup(FileHandler.FilePermissions.Verify); 
            } else {
                console.log("User does't have permissions to verify the file.");
            }
        } else {
            console.log("Please select a file");
        }
    }

    return (
        <div className="file-actions-wrapper">
            <h1 className='files-header'>Files</h1>
            <button onClick={handlePopupOpenUpload}>
                <FcExternal size={25} />
            </button>
            <button onClick={handleDownload}>
                <FcInternal className={!(selectedFile && permissions.includes(FileHandler.FilePermissions.Download)) ? "faded" : "not-faded"} size={25}/>
            </button>
            <button onClick={handlePopupOpenDelete}>
                <FcFullTrash  className={!(selectedFile && permissions.includes(FileHandler.FilePermissions.Delete)) ? "faded" : "not-faded"} size={25} />
            </button>
            <button onClick={handlePopupOpenShare}>
                <FcShare className={!(selectedFile && permissions.includes(FileHandler.FilePermissions.Share)) ? "faded" : "not-faded"} size={25} />
            </button>
            <button onClick={handlePopupOpenVerify}>
                <FcOk  className={!(selectedFile && permissions.includes(FileHandler.FilePermissions.Verify)) ? "faded" : "not-faded"} size={25} />
            </button>
        </div>
    );
}

export default FileActions;