import React from 'react';
import { FcExternal , FcFullTrash , FcShare, FcOk  } from 'react-icons/fc';

const FileActions = ({handleOpenPopup}) => {
    
    const handlePopupOpenUpload = () => {
        handleOpenPopup("upload"); // TODO: PUT THIS AS A VARIABLE READ FROM ANOTHER PLACE
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