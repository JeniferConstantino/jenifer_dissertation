import React from "react";
import { FcDocument , FcImageFile} from "react-icons/fc";
import { FileApp } from "../../helpers/FileApp";

const DisplayUplDocs = ({selectedFile, setSelectedFile, uploadedActiveFiles, loading, maxFilesPerColumn}) => {

    // Sends the file to be decrypt
    const select = async (file) => {
        if (selectedFile === file) {
            setSelectedFile(null);
        } else {
            console.log("selected file: ", file);
            setSelectedFile(file);
        }
    }

    const renderFiles = () => {
        const rows = [];
        for (let i=0; i<maxFilesPerColumn; i++) {
            const row = uploadedActiveFiles
                .filter((file, index) => index % maxFilesPerColumn === i)
                .map((file, index) => (
                    <div 
                        key={index} 
                        className={`uploaded-docs ${selectedFile === file ? 'selected' : ''}`} 
                        onClick={() => select(file)}
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
            <div className="content-home-wrapper">
                <div className="uploaded-files-container">
                    <div className="uploaded-files">
                        {loading ? (
                            <p>Loading...</p>
                        ) : uploadedActiveFiles.length > 0 ? (
                            renderFiles()
                        ) : (
                            <p>No documents uploaded</p>
                        )}
                    </div>
                </div>
                <div className='background'></div>                
            </div>
        </>
    );
}

export default DisplayUplDocs;