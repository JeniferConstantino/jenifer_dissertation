import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../helpers/web3Client';
import nearsoftLogo from '../imgs/nearsoftLogo.png';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useWeb3();

    const onSubmitLogin = async (e) => {
        console.log('Loggin the user ...')
        e.preventDefault()
        
        let resultLogin = await login();
        if(resultLogin.success){
            console.log(`User logged - ${resultLogin.messageError}`);
            navigate('/home');
        }
        else {
            console.log(`Failed to log in: ${resultLogin.messageError}`);
        }
    };


    return (
        <div className='content-container'>
            <img className='nearsoftLogo' src={nearsoftLogo} alt='Logo'/>
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
    );

}

export default Login;