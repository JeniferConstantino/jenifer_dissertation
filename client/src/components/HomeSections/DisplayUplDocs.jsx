import React from "react";
import FileHandler from '../../helpers/fileHandler';
import { FcDocument , FcImageFile} from "react-icons/fc";

const DisplayUplDocs = ({selectedFile, setSelectedFile, uploadedFiles, loading, maxFilesPerColumn}) => {

    const decryptAndDownload = async (file) => {
        if (selectedFile === file) {
            setSelectedFile(null);
        } else {
            setSelectedFile(file);
        }
    }

    const renderFiles = () => {
        const rows = [];
        
        for (let i=0; i<maxFilesPerColumn; i++) {
            const row = uploadedFiles
                .filter((file, index) => index % maxFilesPerColumn === i)
                .map((file, index) => (
                    <div 
                        key={index} 
                        className={`uploaded-docs ${selectedFile === file ? 'selected' : ''}`} 
                        onClick={() => decryptAndDownload(file)}
                    >
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