import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {useWeb3} from '../helpers/web3Client';


const Welcome = () => {
    const navigate = useNavigate();
    const {storeUserBlockchain, selectedUser} = useWeb3();
    const [username, setUsername] = useState('');

    const onNext = async (e) => {
        if(username.trim() === ''){
            alert('Please enter a username.');
            return;
        }

        // Adds the user to the blockchain and redirects him to the home page
        storeUserBlockchain(username).then(()=>{
            if (selectedUser.current != null) {
                navigate('/home');
            }
        }).catch(err=>{
            console.log(err);
        })      
    };

    const handleBack = async (e) => {
        navigate('/');
    }

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
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder='username'
                            className='input-username'
                        />
                            <div className='button-container'>
                                <button className='app-button app-button__welcome' onClick={handleBack}>Back</button>
                                <button className='app-button app-button__welcome' onClick={onNext}>Next</button>
                            </div>
                    </div>
                </div>
            </div>
        </>
        
    );

}

export default Welcome;