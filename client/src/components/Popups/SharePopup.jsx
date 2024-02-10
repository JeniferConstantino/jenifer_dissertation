import React, { useState } from 'react';
import { FaAngleLeft } from "react-icons/fa6";
import FileApp from '../../helpers/FileApp';

const SharePopup = ({fileManagerFacadeInstance, handleClosePopup, show, selectedFile, children}) => {
    const [usernameToShare, setUsernameToShare] = useState('');
    const [userShareFileWith, setUserShareFileWith] = useState(null);
    const [showPermissions, setShowPermissions] = useState(false);
    const [permissions, setCheckboxes] = useState({
        download: false,
        delete: false,
        share: false
    });

    const showHideClassName = show ? 'modal display-block' : 'modal display-none';

    // Sends the file to IPFS and receivs a CID - a hash that is unique to the stored file
    const handleFileShare = async (e) => {
        e.preventDefault()
        console.log('Share file ...');
        
        // Performs the sharing
        fileManagerFacadeInstance.shareFile(selectedFile, permissions, userShareFileWith);
        setUsernameToShare('');
        setShowPermissions(false);
    }

    // Verifies if the user exists. If so, it displays the permissions of that user, so they can be edited
    const handleNext = async (e) => {
        e.preventDefault()
        if (usernameToShare !== "") {
            var userToShareFileWith = await fileManagerFacadeInstance.getUserToShareFile(usernameToShare);
            if (userToShareFileWith !== null) {  // User exists

                // Grabs the permissions that the user to share the file with already has over the current file
                var userPermissions = await fileManagerFacadeInstance.getPermissionsUserOverFile(userToShareFileWith, selectedFile);
                
                // Sets the checkboxes to the permissions the user already has
                userPermissions.forEach(permission => {
                    switch (permission) {
                      case FileApp.FilePermissions.Download:
                        permissions.download = true;
                        break;
                      case FileApp.FilePermissions.Delete:
                        permissions.delete = true;
                        break;
                      case FileApp.FilePermissions.Share:
                        permissions.share = true;
                        break;
                      default:
                        console.log("UNEXPECTED PERMISSION");
                    }
                  });
                // Displays to the user the checkboxes and make username field readonly 
                setShowPermissions(true);
                setUserShareFileWith(userToShareFileWith);
            } else {
                console.log(`The file: ${selectedFile.fileName} cannot be shared with: ${usernameToShare}. Since the name doesn't correspond to a user.`);
            }
        } else {
            console.log("No name was inputed.");
        } 
    }

    // Hnadles changes on the checkboxes values
    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setCheckboxes({
            ...permissions,
            [name]: checked
        });
    } 

    // Closes the share name popup
    const handleCloseShareNamePopup = () => {
        setUsernameToShare('');
        setShowPermissions(false);
        handleClosePopup(FileApp.FilePermissions.Share); 
    }

    // Hides the permissions from the popup
    const handleCloseSharePermissionsPopup = () => {
        setShowPermissions(false);
    }

    return(
        <div className={showHideClassName}>
            <section className='model-main'>
                {children}
                
                { selectedFile ? (
                    <>
                        <div className='popup-section input-button-container'>
                            
                            {showPermissions ? (
                                <>
                                    <div className='section-title-upload-popup'>
                                        <FaAngleLeft size={18} className="app-button_back" onClick={handleCloseSharePermissionsPopup}/>
                                        <h2 className='upload-file-header'>Share File - Permissions</h2>
                                    </div>
                                    <p className='share-file-description note'>You're about to share the file <strong><em>"{selectedFile.fileName}"</em></strong>.</p>
                                    <p className='share-file-description'>Edit the user's permissions.</p>
                                </>
                            ) : (
                                <>
                                    <div className='section-title-upload-popup'>
                                        <FaAngleLeft size={18} className="app-button_back" onClick={handleCloseShareNamePopup}/>
                                        <h2 className='upload-file-header'>Share File - Name</h2>
                                    </div>
                                    <p className='share-file-description note'>You're about to share the file <strong><em>"{selectedFile.fileName}"</em></strong>.</p>
                                    <p className='share-file-description'>Input the name of the user to share the file with.</p>
                                </>
                            )}
                            <input
                                type="text"
                                id="usernameToShare"
                                value={usernameToShare}
                                onChange={(e) => setUsernameToShare(e.target.value)}
                                placeholder='name'
                                className={`input-username input-usernameShare ${showPermissions ? 'readonly' : ''}`}
                                readOnly ={showPermissions}
                            />
                            {showPermissions ? (
                                <>
                                    <div className="permissions-checkbox">
                                        <label >
                                            <input type="checkbox" name="download" checked={permissions.download} onChange={handleCheckboxChange} />
                                            Download
                                        </label>
                                        <label >
                                            <input type="checkbox" name="delete" checked={permissions.delete} onChange={handleCheckboxChange} />
                                            Delete
                                        </label>
                                        <label >
                                            <input type="checkbox" name="share" checked={permissions.share} onChange={handleCheckboxChange} />
                                            Share
                                        </label>
                                    </div> 
                                    <button className="app-button__share app-button" onClick={handleFileShare}>Share</button>
                                </>
                            ):(
                                <button className="app-button__share app-button" onClick={handleNext}>Next</button>
                            )}
                        </div>
                    </>
                ) : (
                    <p>No file was selected.</p>
                )
                }
            </section>
        </div>
    );    
}

export default SharePopup;