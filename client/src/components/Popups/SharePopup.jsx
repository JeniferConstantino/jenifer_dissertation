import React, { useState } from 'react';
import { FaAngleLeft } from "react-icons/fa6";
import FileHandler from '../../helpers/fileHandler';
import {useWeb3} from '../../helpers/web3Client';

const SharePopup = ({handleClosePopup, show, selectedFile, selectedUser, children}) => {
    const [username, setUsername] = useState('');
    const {storeUserContract} = useWeb3();


    const showHideClassName = show ? 'modal display-block' : 'modal display-none';

    // Sends the file to IPFS and receivs a CID - a hash that is unique to the stored file
    const handleFileShare = async (e) => {
        
        e.preventDefault()

        // Performs validations
        // TODO: Perform verification:  current user is owner?
        if (username !== "") {
            console.log('Share file ...');

            // Verifies if the user exists 
            var userExists = await FileHandler.verifyUserExist(username, storeUserContract, selectedUser, selectedFile);
            if (userExists) {

                // Verifies if the user is already associated with the file to be shared
                /*var encSymmetricKey = await storeUserContract.current.methods.getEncSymmetricKeyFileUser(selectedUser, selectedFile).call({from: selectedUser.current.account});
                if (encSymmetricKey !== "") {
                    return `File: ${selectedFile.fileName} is already shared with user: ${nameUserToShare}.`;
                } else {
                    console.log("Encrypted Symmetric key: " + encSymmetricKey);
                }*/


                // Perform the sharing 
            } else {
                console.log(`The selected file cannot be shared: ${username} is not a user.`);
            }

        } else {
            console.log("No name was inputed.");
        } 

    }

    const handleCloseSharePopup = () => {
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
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
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