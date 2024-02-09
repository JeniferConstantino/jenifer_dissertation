import React from "react";
import { FcDocument , FcImageFile} from "react-icons/fc";
import FileApp from "../../helpers/FileApp";

const DisplayUplDocs = ({selectedFile, setSelectedFile, uploadedFiles, loading, maxFilesPerColumn}) => {

    // Sends the file to be decrypt
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
                        {file.fileType === FileApp.FileType.Image ? (
                            <>
                                <FcImageFile size={50}/>
                                <div className="fileName">
                                    <span>{file.fileName}</span>
                                </div>
                            </>
                        ) : file.fileType === FileApp.FileType.File ? (
                            <>
                                <FcDocument  size={50}/>
                                <div className="fileName">
                                    <span>{file.fileName}</span>
                                </div>
                            </>
                        ) : (
                            <>ERROR. Type of file not permited: {file.fileType}</>
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