import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {useWeb3} from '../helpers/web3Client';
import UserApp from '../helpers/UserApp';
import InfoPopup from './Infos/InfoPopup';
import { FcHighPriority } from "react-icons/fc";

const Register = () => {
    const navigate = useNavigate();
    const {setsFileManagerFacadeWSelectedUser, fileManagerFacadeInstance} = useWeb3();
    const [username, setUsername] = useState('');
    const [showInfoMnemonicPopup, setShowInfoMnemonicPopup] = useState(false); // controls the info mnemonic popup visibility
    const [showInfoNamePopup, setShowInfoNamePopup] = useState(false); // controls the info name popup visibility
    const [titleInfoMnemonicPopup, setTitleInfoMnemonicPopup] = useState("");  // title to be used in the info mnemonic popup
    const [titleInfoNamePopup, setTitleInfoNamePopup] = useState("");  // title to be used in the info name popup
    const [mnemonic, setMnemonic] = useState();                // mnemonic to be set in the info popup

    // On page refresh redirects the user to the WalletConnection page
    useEffect(() => {
        async function fetchData() {
            if (fileManagerFacadeInstance.current == null) {
                navigate("/");
            }
        }
        fetchData();
    }, [fileManagerFacadeInstance, navigate]);

    const onNext = async () => {
        const words = username.trim().split(/\s+/);
       
        // Verifies if there is a user with the same account or with the same name
        var existingAddress = await fileManagerFacadeInstance.current.existingAddress(fileManagerFacadeInstance.current.selectedAccount.current);
        var existingUserName = await fileManagerFacadeInstance.current.existingUserName(username.toLowerCase());     
        if (existingAddress || existingUserName || words.length > 2 || username.trim() === '') {
            console.log("Error in registration! Address and username have to be unique and the username should not have more than 2 workds");
            setShowInfoNamePopup(true);
            setTitleInfoNamePopup("Attention");
            return;
        }

        // Generates a mnemonic
        const mnemonic = await fileManagerFacadeInstance.current.generateMnemonic();

        // Adds the user to the blockchain and redirects him to the home page
        UserApp.storeUserBlockchain(fileManagerFacadeInstance.current, username, mnemonic).then((userLogged)=>{
            if (userLogged != null) {
                setsFileManagerFacadeWSelectedUser(userLogged);
                setTitleInfoMnemonicPopup("Attention");
                setMnemonic(mnemonic);
                setShowInfoMnemonicPopup(true);
            }
        }).catch(err=>{
            // eslint-disable-next-line security-node/detect-crlf
            console.log(err);
        })      
    };

    const handleContinueMnemonic = async () => {
        cleanFields();
        console.log("GOING HOME");
        navigate('/home');
    }

    const handleContinueName = () => {
        cleanFields();
        navigate('/register');
    }

    const cleanFields = () => {
        setShowInfoMnemonicPopup(false);
        setShowInfoNamePopup(false);
        setMnemonic("");
        setTitleInfoMnemonicPopup("");
        setTitleInfoNamePopup("");
    }

    const handleBack = async () => {
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
                        <p>Welcome! Let`&apos;s get started by setting a <strong className='boltColor'>unique name</strong> for you to use in the app.</p>
                    </div>
                    <div className='login-column'>
                        <div className='input-button-container-welcome'>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value.toLowerCase())}
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
                {showInfoMnemonicPopup && (
                    <div className='modal-wrapper'>
                        <InfoPopup handleContinue={handleContinueMnemonic} message={""} title={titleInfoMnemonicPopup} showInfoPopup = {showInfoMnemonicPopup} iconComponent={iconComponent} changeWithButton={true} mnemonic={mnemonic}/>
                    </div>
                )}
                {showInfoNamePopup && (
                    <div className='modal-wrapper'>
                        <InfoPopup handleContinue={handleContinueName} message={"Oops! It looks like there's an issue. Please make sure you've entered a unique name with a maximum of two words."} title={titleInfoNamePopup} showInfoPopup = {showInfoNamePopup} iconComponent={iconComponent} changeWithButton={true} mnemonic={""}/>
                    </div>
                )}
            </div>
        </>
    );

}

export default Register;