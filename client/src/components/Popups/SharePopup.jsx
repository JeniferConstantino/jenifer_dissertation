import React, { useState } from 'react';
import { FaAngleLeft } from "react-icons/fa6";
import FileHandler from '../../helpers/fileHandler';
import {useWeb3} from '../../helpers/web3Client';

const SharePopup = ({handleClosePopup, show, selectedFile, selectedUser, children}) => {
    const [usernameToShare, setUsernameToShare] = useState('');
    const [showPermissions, setShowPermissions] = useState(false);
    const [checkboxes, setCheckboxes] = useState({
        upload: false,
        delete: false,
        share: false
    });

    const {storeUserContract, storeFileContract} = useWeb3();

    const showHideClassName = show ? 'modal display-block' : 'modal display-none';

    // Sends the file to IPFS and receivs a CID - a hash that is unique to the stored file
    const handleFileShare = async (e) => {
        
        e.preventDefault()

        if (usernameToShare !== "") {

            // Display permissions checkbox and make username field readonly
            setShowPermissions(true);

            /*console.log('Share file ...');
            // Gets the user to share the file with 
            var userToShareFileWith = await FileHandler.getUserToShareFile(usernameToShare, storeUserContract, selectedUser);
            if (userToShareFileWith !== null) { 
                // Make sure the user is not already associated with the given file
                var errorUserAssociatedFile = await FileHandler.verifyUserAssociatedWithFile(storeFileContract, selectedFile, userToShareFileWith, selectedUser.current);
                
                if (errorUserAssociatedFile.length === 0) { // File can be shared 
                    // Performs the sharing
                    FileHandler.performFileShare(storeFileContract, selectedFile, selectedUser, userToShareFileWith);
                } else {
                    console.log(`The file: ${selectedFile.fileName} is already shared with: ${usernameToShare}. `);
                }
            } else {
                console.log(`The file: ${selectedFile.fileName} cannot be shared with: ${usernameToShare}. Since the name doesn't correspond to a user.`);
            }*/
        } else {
            console.log("No name was inputed.");
        } 

    }

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setCheckboxes({
            ...checkboxes,
            [name]: checked
        });
    } 

    const handleCloseShareNamePopup = () => {
        setUsernameToShare('');
        setShowPermissions(false);
        handleClosePopup("share"); // TODO: PUT THIS AS A VARIABLE READ FROM ANOTHER PLACE
    }

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
                                            <input type="checkbox" name="upload" checked={checkboxes.upload} onChange={handleCheckboxChange} />
                                            Upload
                                        </label>
                                        <label >
                                            <input type="checkbox" name="delete" checked={checkboxes.delete} onChange={handleCheckboxChange} />
                                            Delete
                                        </label>
                                        <label >
                                            <input type="checkbox" name="share" checked={checkboxes.share} onChange={handleCheckboxChange} />
                                            Share
                                        </label>
                                    </div> 
                                    <button className="app-button__share app-button" onClick={handleFileShare}>Share</button>
                                </>
                            ):(
                                <button className="app-button__share app-button" onClick={handleFileShare}>Next</button>
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