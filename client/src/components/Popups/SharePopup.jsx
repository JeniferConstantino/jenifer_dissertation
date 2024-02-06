import React, { useState } from 'react';
import { FaAngleLeft } from "react-icons/fa6";

const SharePopup = ({ handleClosePopup, show, selectedFile, children}) => {
    const [username, setUsername] = useState('');


    const showHideClassName = show ? 'modal display-block' : 'modal display-none';

    // Sends the file to IPFS and receivs a CID - a hash that is unique to the stored file
    const handleFileShare = async (e) => {
        
        console.log('Share file ...')
        e.preventDefault()

        // Read input name 

            // Perform verification: is empty? user exists? user is already associated with that file? current user is owner?

            // Perform the sharing 


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