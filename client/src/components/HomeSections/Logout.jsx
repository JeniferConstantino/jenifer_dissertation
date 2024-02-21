import React from "react";
import { GoPerson   } from "react-icons/go";
import {useWeb3} from '../../helpers/web3Client';

const Logout = ({selectedUser}) => {

    const {logOut} = useWeb3();

    // Performs the users' logout
    const handleLogout = () => {           
        logOut();              
    }

    return (
        <div className='logout-section'>
            <div className="icon-column">
                <GoPerson className='icon-person'/>
            </div>
            <div className='button-column'>
                <p className='username-text'>Username: {selectedUser.userName}</p>
                <button className='app-button app-button__logout' onClick={handleLogout}> Logout </button> 
            </div>
        </div>
    );
}

export default Logout;