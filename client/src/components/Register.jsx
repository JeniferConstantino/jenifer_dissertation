import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {useWeb3} from '../helpers/web3Client';
import UserApp from '../helpers/UserApp';
import InfoPopup from './Infos/InfoPopup';
import { FcHighPriority } from "react-icons/fc";

const Register = () => {
    const navigate = useNavigate();
    const {fileManagerFacadeInstance} = useWeb3();
    const [username, setUsername] = useState('');
    const [showInfoPopup, setShowInfoPopup] = useState(false); // controls the info popup visibility
    const [titleInfoPopup, setTitleInfoPopup] = useState("");  // title to be used in the info popup
    const [mnemonic, setMnemonic] = useState();                // mnemonic to be set in the info popup

    const onNext = async (e) => {
        if(username.trim() === ''){
            alert('Please enter a username.');
            return;
        }

        // Adds the user to the blockchain and redirects him to the home page
        UserApp.storeUserBlockchain(fileManagerFacadeInstance.current, username).then((mnemonic)=>{
            if (fileManagerFacadeInstance.current._selectedUser != null) {
                setTitleInfoPopup("Attention");
                setMnemonic(mnemonic);
                setShowInfoPopup(true);
            }
        }).catch(err=>{
            console.log(err);
        })      
    };

    const handleContinue = () => {
        cleanFields();
        navigate('/home');
    }

    const cleanFields = () => {
        setShowInfoPopup(false);
        setMnemonic("");
        setTitleInfoPopup("");
    }

    const handleBack = async (e) => {
        navigate('/');
    }

    const iconComponent = FcHighPriority;

    return (
        <>
            <div className='content-container'>
                <div className='login-wrapper content-wrapper'>
                    <div className='shadow-overlay shadow-overlay-login'></div>
                    <div className='content-column'>
                        <h1 className='nearfile-heading'>Welcome!</h1>
                        <p>Good to see you arrive here! Set a unique name to use in the app.</p>
                    </div>
                    <div className='login-column'>
                        <div className='input-button-container-welcome'>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder='username'
                                className='input-username input-usernameWelcome'
                            />
                        </div>
                        
                        <div className='button-container-welcome'>
                            <button className='app-button app-button__welcome' onClick={handleBack}>Back</button>
                            <button className='app-button app-button__welcome' onClick={onNext}>Next</button>
                        </div>
                    </div>
                </div>
                {showInfoPopup && (
                    <div className='modal-wrapper'>
                        <InfoPopup handleContinue={handleContinue} message={""} title={titleInfoPopup} showInfoPopup = {showInfoPopup} iconComponent={iconComponent} mnemonic={mnemonic}/>
                    </div>
                )}
            </div>
        </>
    );

}

export default Register;