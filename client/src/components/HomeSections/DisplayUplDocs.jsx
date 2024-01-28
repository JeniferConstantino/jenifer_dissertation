import React from "react";
import FileHandler from '../../helpers/fileHandler';
import { IPFS_BASE_URL } from '../../../ipfs';
import { FcDocument , FcImageFile} from "react-icons/fc";

const DisplayUplDocs = ({ipfsCIDAndType, loading, maxFilesPerColumn}) => {

    const renderFiles = () => {
        const files = Array.from(ipfsCIDAndType.entries());
        const rows = [];

        for (let i=0; i<maxFilesPerColumn; i++) {
            const row = files.filter((file, index) => index % maxFilesPerColumn === i).map(([ipfsCidHash, type], index) => (
                <div key={index}>
                    {type === FileHandler.FileType.Image ? (
                        <a 
                            href={`${IPFS_BASE_URL}${ipfsCidHash}`}
                            download={`file.${type}`}
                            className="uploaded-docs"
                        >
                            <FcImageFile size={50}/>
                            <span style={{ marginTop: '5px' }}>Download Image</span>
                        </a>
                    ) : type === FileHandler.FileType.File ? (
                        <>
                            <a
                                href={`${IPFS_BASE_URL}${ipfsCidHash}`}
                                download={`file.${type}`}
                                className="uploaded-docs"
                            >
                                <FcDocument  size={50}/>
                                <span style={{ marginTop: '5px' }}>Download File</span>
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
                    ) : ipfsCIDAndType.size > 0 ? (
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