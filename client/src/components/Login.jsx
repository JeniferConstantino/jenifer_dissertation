import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../helpers/web3Client';
import UserApp from '../helpers/UserApp'


const Login = () => {
    const navigate = useNavigate();
    const {setup, fileManagerFacadeInstance } = useWeb3();

    const onSubmitLogin = async (e) => {
        console.log('Loggin the user ...')
        e.preventDefault()
        
        await setup();
        const existingUser = await UserApp.verifyIfAccountExists(fileManagerFacadeInstance.current);

        if (existingUser) {
            navigate('/home');
        } else if (!existingUser) {
            navigate('/welcome');
        }
    };

    return (
        <>
            <div className='content-container'>
                <div className='login-wrapper content-wrapper'>
                    <div className='shadow-overlay shadow-overlay-login'></div>
                    <div className='content-column'>
                        <h1 className='nearfile-heading'>NearFile</h1>
                        <p>Store and share your documents safely. Access other people's documents easily.</p>
                    </div>
                    <div className='login-column'>
                        <button className='app-button app-button__login' onClick={onSubmitLogin}> Connect Wallet </button>
                    </div>
                </div>
            </div>
        </>
        
    );

}

export default Login;