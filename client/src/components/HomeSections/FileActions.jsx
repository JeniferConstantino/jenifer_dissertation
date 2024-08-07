import React, { useEffect } from 'react';
import { FcExternal , FcInternal, FcFullTrash , FcShare, FcOk, FcInfo } from 'react-icons/fc';
import { MdOutlineEdit } from "react-icons/md";
import { FileApp } from '../../helpers/FileApp';
import PropTypes from 'prop-types';

const FileActions = ({fileManagerFacadeInstance, handleOpenPopup, setPermissions, permissions, selectedFile}) => {

    // When rendering, the permissions of the selected file are set
    useEffect( () => {
        const fetchPermissions = async () => {
            if (selectedFile) {
                const result = await fileManagerFacadeInstance.getPermissionsUserOverFile(fileManagerFacadeInstance.selectedUser.account, selectedFile.ipfsCID);
                if (!result.success) {
                    console.log("No permissions were found between the user and the file.");
                    return;
                }
                const permissions = result.resultStrings;
                setPermissions(permissions);
            } else {
                setPermissions([]);
            }
        };

        fetchPermissions();
    }, [selectedFile, fileManagerFacadeInstance, setPermissions]);

    // Sets to open the popup for upload file
    const handlePopupOpenUpload = () => {
        handleOpenPopup("upload");
    }

    // Sets to open the popup to verify file
    const handlePopupOpenVerify = async () => {
        handleOpenPopup(FileApp.FilePermissions.Verify); 
    }

    // Sets to open the popup on the files' information
    const handlePopupOpenInfo = async () => {
        if (selectedFile === null) {
            console.log("Please select a file");
        } else {
            handleOpenPopup(FileApp.FilePermissions.Info); 
        }
    }

    // Downloads the selected file
    const handleDownload = async () => {
        // Verifies if the user has permissions to download
        if (permissions.includes(FileApp.FilePermissions.Download)) {
            if (selectedFile === null) {
                console.log("Please select a file");
            } else {
                handleOpenPopup(FileApp.FilePermissions.Download); 
            }
        } else {
            console.log("User doesn't have permissions to download the file.");
        }
    }

    // Edits the selected file (a new version will be uploaded)
    const handleEditFile = async () => {
        // Verifies if the user has permissions to edit the file
        if (permissions.includes(FileApp.FilePermissions.Edit)) {
            if (selectedFile === null) {
                console.log("Please select a file");
            } else {
                handleOpenPopup(FileApp.FilePermissions.Edit);
            }
        } else {
            console.log("User doesn't have permissions to edit the file.");
        }
    }

    // Sets to open the popup to delete file
    const handlePopupOpenDelete = async () => {
        if (selectedFile === null) {
            console.log("Please select a file");
        } else {
            // Verifies if the user has permissions to delete
            if (permissions.includes(FileApp.FilePermissions.Delete)) {
                handleOpenPopup(FileApp.FilePermissions.Delete); 
            } else {
                console.log("User doesn't have permissions to delete the file.");
            } 
        }
    }

    // Sets to open the popup to share file
    const handlePopupOpenShare = async () => {
        if (selectedFile === null) {
            console.log("Please select a file");
        } else {
            // Verifies if the user has permissions to share
            if (permissions.includes(FileApp.FilePermissions.Share)) {
                handleOpenPopup(FileApp.FilePermissions.Share); 
            } else {
                console.log("User doesn't have permissions to share the file.");
            }
        }
    }

    return (
        <div className="file-actions-wrapper">
            <h1 className='files-header'>Files</h1>
            <button onClick={handlePopupOpenUpload} title="upload">
                <FcExternal size={25} />
            </button>
            <button onClick={handleDownload} title="download">
                <FcInternal className={!(selectedFile && permissions.includes(FileApp.FilePermissions.Download)) ? "faded" : "not-faded"} size={25}/>
            </button>
            <button onClick={handleEditFile} title="edit">
                <MdOutlineEdit className={!(selectedFile && permissions.includes(FileApp.FilePermissions.Edit)) ? "faded" : "not-faded"} size={25}/>
            </button>
            <button onClick={handlePopupOpenDelete} title="delete">
                <FcFullTrash  className={!(selectedFile && permissions.includes(FileApp.FilePermissions.Delete)) ? "faded" : "not-faded"} size={25} />
            </button>
            <button onClick={handlePopupOpenShare} title="share">
                <FcShare className={!(selectedFile && permissions.includes(FileApp.FilePermissions.Share)) ? "faded" : "not-faded"} size={25} />
            </button>
            <button onClick={handlePopupOpenVerify} title="verify">
                <FcOk size={25} />
            </button>
            <button onClick={handlePopupOpenInfo} title="info">
                <FcInfo className={!(selectedFile) ? "faded" : "not-faded"} size={25} />
            </button>
        </div>
    );
}

FileActions.propTypes = {
    fileManagerFacadeInstance: PropTypes.object.isRequired,
    handleOpenPopup: PropTypes.func.isRequired,
    setPermissions: PropTypes.func.isRequired,
    permissions: PropTypes.array.isRequired,
    selectedFile: PropTypes.object,
};

export default FileActions;