import React from "react";
import { GoPerson   } from "react-icons/go";
import {useWeb3} from '../../helpers/web3Client';

const Logout = () => {

    const {logOut, selectedUser} = useWeb3();

    // Performs the users' loggout
    const handleLogout = () => {           
        logOut();              
    }

    return (
        <div className='logout-section'>
            <div className="icon-column">
                <GoPerson className='icon-person'/>
            </div>
            <div className='button-column'>
                <p className='username-text'>Username: {selectedUser.current.name}</p>
                <button className='app-button app-button__logout' onClick={handleLogout}> Logout </button> 
            </div>
        </div>
    );
}

export default Logout;