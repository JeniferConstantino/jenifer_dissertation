import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../helpers/web3Client';
import UserApp from '../helpers/UserApp'

const WalletConnection = () => {
    const navigate = useNavigate();
    const {setup, fileManagerFacadeInstance } = useWeb3();

    const onSubmitLogin = async (e) => {
        console.log('Loggin the user ...')
        e.preventDefault()
        
        await setup();
        // Verifies if the entered mnemonic belongs to a given user
        UserApp.verifyIfAccountExists(fileManagerFacadeInstance.current).then(async (existingUser)=>{
            if (existingUser) {
                navigate('/login');
                return;
            } 
            navigate('/register');
        }).catch(err=>{
            console.log(err);
        })  
    };

    return (
        <>
            <div className='content-container'>
                <div className='login-wrapper content-wrapper'>
                    <div className='shadow-overlay shadow-overlay-login'></div>
                    <div className='content-column'>
                        <h1 className='nearfile-heading'>NearFile</h1>
                        <p className='content-wallet-connection'><strong>Manage</strong> your documents safely.<br/>Access other people's documents <strong>easily</strong>. Trust is in your hands.</p>
                    </div>
                    <div className='login-column'>
                        <button className='app-button app-button__login' onClick={onSubmitLogin}> Connect Wallet </button>
                    </div>
                </div>
            </div>
        </>
        
    );

}

export default WalletConnection;