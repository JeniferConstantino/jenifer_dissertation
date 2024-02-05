import React from "react";
import FileHandler from '../../helpers/fileHandler';
import { FcDocument , FcImageFile} from "react-icons/fc";
import {useWeb3} from '../../helpers/web3Client';

const DisplayUplDocs = ({uploadedFiles, loading, maxFilesPerColumn, selectedUser}) => {

    const {storeFileContract} = useWeb3();

    const decryptAndDownload = async (file) => {
        
        try {
            // Gets the file from IPFS
            const fileContent = await FileHandler.getFileFromIPFS(file.ipfsCID);
            console.log("Accessed file in IPFS.");

            // Decrypts the file
            const decryptedFileBuffer = await FileHandler.decryptFileWithSymmetricKey(storeFileContract, file, selectedUser, fileContent);
            const blob = new Blob([decryptedFileBuffer]);
            console.log("File Decrypted.");
            
            // Creates a downloaded link 
            const downloadLink = document.createElement("a");
            downloadLink.href = URL.createObjectURL(blob);
            downloadLink.download = file.fileName;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        } catch (error) {
            console.error("Error decrypting or downloading file: ", error);
        }

    }

    const renderFiles = () => {
        const rows = [];
        
        for (let i=0; i<maxFilesPerColumn; i++) {
            const row = uploadedFiles
                .filter((file, index) => index % maxFilesPerColumn === i)
                .map((file, index) => (
                    <div key={index} className="uploaded-docs" onClick={() => decryptAndDownload(file)}>
                        {file.fileType === FileHandler.FileType.Image ? (
                            <>
                                <FcImageFile size={50}/>
                                <div className="fileName">
                                    <span>{file.fileName}</span>
                                </div>
                            </>
                        ) : file.fileType === FileHandler.FileType.File ? (
                            <>
                                <FcDocument  size={50}/>
                                <div className="fileName">
                                    <span>{file.fileName}</span>
                                </div>
                            </>
                        ) : (
                            // TODO: Later on I'll probably send an alert saying the type is not valid
                            <>ERROR</>
                        )}
                    </div>
            ));

            rows.push(<div key={i} className="file-column">{row}</div>);
        }
        return rows;
    }

    return (
        <>
            <div className="uploaded-files-container">
                <div className="uploaded-files">
                    {loading ? (
                        <p>Loading...</p>
                    ) : uploadedFiles.length > 0 ? (
                        renderFiles()
                    ) : (
                        <p>No documents uploaded</p>
                    )}
                </div>
            </div>
        </>
    );
}

export default DisplayUplDocs;