import React from 'react';
import { FcExternal , FcFullTrash , FcShare, FcOk  } from 'react-icons/fc';

const FileActions = ({ handleOpenUploadPopup, onDelete, onShare }) => {
    return (
        <div className="file-actions-wrapper">
            <h1 className='files-header'>Files</h1>
            <button onClick={handleOpenUploadPopup}>
                <FcExternal  size={25} />
            </button>
            <button onClick={onDelete}>
                <FcFullTrash  size={25} />
            </button>
            <button onClick={onShare}>
                <FcShare size={25} />
            </button>
            <button onClick={onShare}>
                <FcOk  size={25} />
            </button>
        </div>
    );
}

export default FileActions;