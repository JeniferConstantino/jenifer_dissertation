import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {useWeb3} from '../helpers/web3Client';
import UserApp from '../helpers/UserApp'
import InfoPopup from './Infos/InfoPopup';
import { FcHighPriority } from "react-icons/fc";

const Login = () => {
    const [showInfoNamePopup, setShowInfoNamePopup] = useState(false); // controls the info name popup visibility
    const [message, setMessage] = useState("");
    const [titleInfoNamePopup, setTitleInfoNamePopup] = useState("");
    const navigate = useNavigate();
    const {fileManagerFacadeInstance} = useWeb3();
    const [mnemonic, setMnemonic] = useState('');

    const onNext = async (e) => {
        if(mnemonic.trim() === ''){
            alert('Please enter your mnemonic.');
            return;
        }

        // Hashes the inserted mnemonic
        var hashedMnemonic = await fileManagerFacadeInstance.current.hashMnemonicSymmetricEncryption(mnemonic);
        // Verifies if the entered mnemonic belongs to a given user
        UserApp.verifyMnemonic(hashedMnemonic, fileManagerFacadeInstance.current).then(async (correctMnemonic)=>{
            if (correctMnemonic) {
                // Regenerates the public and private keys for the given mnomonic and sets on the local storage 
                const {privateKey, publicKey, address} = await fileManagerFacadeInstance.current.generateKeysFromMnemonic(mnemonic);
                await fileManagerFacadeInstance.current.storeLocalSotrage(privateKey, publicKey, address);
                handleContinue();
                return;
            } 
            // TODO: Shows error popup
            setShowInfoNamePopup(true);
            setMessage("Invalid Mnemonic");
            setTitleInfoNamePopup("Attention");
        }).catch(err=>{
            console.log(err);
        })   

    };

    const handleContinue = () => {
        cleanFields();
        navigate('/home');
    }

    const handleContinueName = () => {
        cleanFields();
        navigate('/login');
    }

    const cleanFields = () => {
        setShowInfoNamePopup(false);
        setMessage("");
        setTitleInfoNamePopup("");
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
                        <h1 className='nearfile-heading'>Welcome back!</h1>
                        <p>Please enter your secret seed phrase.</p>
                    </div>
                    <div className='login-column'>
                        <div className='input-button-container-welcome'>
                            <input
                                type="text"
                                id="mnemonic"
                                value={mnemonic}
                                onChange={(e) => setMnemonic(e.target.value)}
                                placeholder='mnemonic'
                                className='input-username input-usernameWelcome'
                            />
                        </div>
                        
                        <div className='button-container-welcome'>
                            <button className='app-button app-button__welcome' onClick={handleBack}>Back</button>
                            <button className='app-button app-button__welcome' onClick={onNext}>Next</button>
                        </div>
                    </div>
                </div>
            </div>
            {showInfoNamePopup && (
                <div className='modal-wrapper'>
                    <InfoPopup handleContinue={handleContinueName} message={message} title={titleInfoNamePopup} showInfoPopup = {showInfoNamePopup} iconComponent={iconComponent} changeWithButton={false} mnemonic={""}/>
                </div>
            )}
        </>
    );

}

export default Login;