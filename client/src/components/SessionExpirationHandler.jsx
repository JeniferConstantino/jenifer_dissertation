import {useEffect, useState} from 'react';
import { useWeb3 } from '../helpers/web3Client';
import PropTypes from 'prop-types';

const SessionExpirationHandler = ({handleSessionExpire}) => {

    const { logOut } = useWeb3();
    const [lastActionTime, setLastActionTime] = useState(Date.now());

    useEffect(() => {
        const handleUserActivity = () => {
            setLastActionTime(Date.now());
        };
        window.addEventListener('mousemove', handleUserActivity);
        window.addEventListener('keydown', handleUserActivity);
        return () => {
            window.removeEventListener('mousemove', handleUserActivity);
            window.removeEventListener('keydown', handleUserActivity);
        }
    });

    useEffect(() => {
        const sessionExpirationTime = 60*60*1000; //1h
        //const sessionExpirationTime = 10*1000; //10 seconds => testing purposes
        const intervalId = setInterval(() => { // setInterval() => function used to repeatedly execute a specified function at defined intervals in milliseconds. It returns an interval ID that identifies the interval so it can be later canceled using clearInterval()
            const timeSinceLastAction = Date.now() - lastActionTime;
            if (timeSinceLastAction > sessionExpirationTime) {
                handleSessionExpire();
                return;
            }
        }, 1000); // Check every second        
        return () => {
            clearInterval(intervalId);
        };
    }, [lastActionTime, logOut, handleSessionExpire]); // check every second
    return null;
};

SessionExpirationHandler.propTypes = {
    handleSessionExpire: PropTypes.func.isRequired,
};

export default SessionExpirationHandler;