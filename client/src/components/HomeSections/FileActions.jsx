import React from 'react';
import { FcExternal , FcInternal, FcFullTrash , FcShare, FcOk  } from 'react-icons/fc';
import FileHandler from '../../helpers/fileHandler';
import {useWeb3} from '../../helpers/web3Client';

const FileActions = ({handleOpenPopup, selectedUser, selectedFile}) => {
    
    const {storeFileContract} = useWeb3();

    const handlePopupOpenUpload = () => {
        handleOpenPopup("upload"); // TODO: PUT THIS AS A VARIABLE READ FROM ANOTHER PLACE
    }

    const handleDownload = async () => {
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
    }

    const handlePopupOpenDelete = () => {
        handleOpenPopup("delte"); // TODO: PUT THIS AS A VARIABLE READ FROM ANOTHER PLACE
    }

    const handlePopupOpenShare = () => {
        handleOpenPopup("share"); // TODO: PUT THIS AS A VARIABLE READ FROM ANOTHER PLACE
    }

    const handlePopupOpenVerify = () => {
        handleOpenPopup("verify"); // TODO: PUT THIS AS A VARIABLE READ FROM ANOTHER PLACE
    }

    return (
        <div className="file-actions-wrapper">
            <h1 className='files-header'>Files</h1>
            <button onClick={handlePopupOpenUpload}>
                <FcExternal  size={25} />
            </button>
            <button onClick={handleDownload}>
                <FcInternal size={25}/>
            </button>
            <button onClick={handlePopupOpenDelete}>
                <FcFullTrash  size={25} />
            </button>
            <button onClick={handlePopupOpenShare}>
                <FcShare size={25} />
            </button>
            <button onClick={handlePopupOpenVerify}>
                <FcOk  size={25} />
            </button>
        </div>
    );
}

export default FileActions;