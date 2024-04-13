import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../helpers/web3Client';
import UserApp from '../helpers/UserApp'

const WalletConnection = () => {
    const navigate = useNavigate();
    const {setsFileManagerFacadeWSelectedUser, setFileManagerFacadeWSelectedAccount, initializeFileManagerFacadeWContracts, fileManagerFacadeInstance } = useWeb3();

    const onSubmitLogin = async (e) => {
        console.log('Loggin the user ...')
        e.preventDefault()
        
        // Initializes FileManagerFacadeInstance with contracts
        await initializeFileManagerFacadeWContracts();

        // Sets the FileManagerFacadeInstance with the selectedAccount
        await setFileManagerFacadeWSelectedAccount();

        // Verifies if the account exists  in the dApp
        UserApp.getUserWithAccount(fileManagerFacadeInstance.current).then( async (resultUser) => {
            if (resultUser.success == false) {
                console.log("User first time in the app");
                navigate('/register');
                return;
            }
            console.log("User already in the app.");
            await setsFileManagerFacadeWSelectedUser(resultUser.user);
            navigate('/login');
        }).catch( err => {
            // eslint-disable-next-line security-node/detect-crlf
            console.log(err);
        });
    };

    return (
        <>
            <div className='content-container'>
                <div className='login-wrapper content-wrapper'>
                    <div className='shadow-overlay shadow-overlay-login'></div>
                    <div className='content-column'>
                        <h1 className='nearfile-heading'>NearFile</h1>
                        <p className='content-wallet-connection'><strong className='boltColor'>Manage</strong> your documents <strong className='boltColor'>safely</strong>.<br/>Access other people&apos;s documents <strong className='boltColor'>easily</strong>. Trust is in your hands.</p>
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