import React from "react";
import FileHandler from '../../helpers/fileHandler';
import { IPFS_BASE_URL } from '../../../ipfs';
import { FcDocument , FcImageFile} from "react-icons/fc";

const DisplayUplDocs = ({uploadedFiles, loading, maxFilesPerColumn}) => {

    const renderFiles = () => {
        const rows = [];
        
        for (let i=0; i<maxFilesPerColumn; i++) {
            const row = uploadedFiles.filter((file, index) => index % maxFilesPerColumn === i).map((file, index) => (
                <div key={index}>
                    {file.fileType === FileHandler.FileType.Image ? (
                        <a 
                            href={`${IPFS_BASE_URL}${file.ipfsCID}`}
                            download={`file.${file.fileType}`}
                            className="uploaded-docs"
                        >
                            <FcImageFile size={50}/>
                            <div className="fileName">
                                <span>{file.fileName}</span>
                            </div>
                        </a>
                    ) : file.fileType === FileHandler.FileType.File ? (
                        <>
                            <a
                                href={`${IPFS_BASE_URL}${file.ipfsCID}`}
                                download={`file.${file.fileType}`}
                                className="uploaded-docs"
                            >
                                <FcDocument  size={50}/>
                                <div className="fileName">
                                    <span>{file.fileName}</span>
                                </div>
                            </a>
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