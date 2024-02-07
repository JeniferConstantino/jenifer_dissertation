import React, { useState } from 'react';
import { FaAngleLeft } from "react-icons/fa6";
import FileHandler from '../../helpers/fileHandler';
import {useWeb3} from '../../helpers/web3Client';

const SharePopup = ({handleClosePopup, show, selectedFile, selectedUser, children}) => {
    const [usernameToShare, setUsernameToShare] = useState('');
    const {storeUserContract, storeFileContract} = useWeb3();

    const showHideClassName = show ? 'modal display-block' : 'modal display-none';

    // Sends the file to IPFS and receivs a CID - a hash that is unique to the stored file
    const handleFileShare = async (e) => {
        
        e.preventDefault()

        // TODO: Perform verification:  current user is owner?
        if (usernameToShare !== "") {
            console.log('Share file ...');
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
            }
        } else {
            console.log("No name was inputed.");
        } 

        setUsernameToShare('');
    }

    const handleCloseSharePopup = () => {
        setUsernameToShare('');
        handleClosePopup("share"); // TODO: PUT THIS AS A VARIABLE READ FROM ANOTHER PLACE
    }

    return(
        <div className={showHideClassName}>
            <section className='model-main'>
                {children}
                <div className='popup-section section-title-upload-popup'>
                    <FaAngleLeft size={18} className="app-button_back" onClick={handleCloseSharePopup}/>
                    <h2 className='upload-file-header'>Share File</h2>
                </div>
                { selectedFile ? (
                    <p>You're about to share the file <strong><em>"{selectedFile.fileName}"</em></strong>. Input the name of the user to share the file with.</p>
                ) : (
                    <p>No file was selected.</p>
                )
                }
                <div className='popup-section input-button-container'>
                    <input
                        type="text"
                        id="usernameToShare"
                        value={usernameToShare}
                        onChange={(e) => setUsernameToShare(e.target.value)}
                        placeholder='name'
                        className='input-username input-usernameShare'
                    />
                    <button className="app-button__share app-button" onClick={handleFileShare}>Share</button>
                </div>
            </section>
        </div>
    );    

}

export default SharePopup;