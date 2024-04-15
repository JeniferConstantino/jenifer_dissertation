// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./UserRegister.sol";

contract LoginRegister {

    uint constant TIMEOUT_LIMIT = 90000; // time limit in which the user is able to execute methods in seconds
    mapping(address => uint) private loginTime; // stores the time in which the user logged in the application
    mapping(address => bool) private loggedIn; // Tracks the login status
    UserRegister userRegister;

    constructor(address userRegisterContract) {
        userRegister = UserRegister(userRegisterContract);
    }

    // Logs the user in
    function logsInUser() external {
        if (!loggedIn[msg.sender]) { // If the user is not already logged in
            loggedIn[msg.sender] = true;
            loginTime[msg.sender] = block.timestamp;
        }
    }

    // Registers the user and sets the log
    function registerUser(UserRegister.User memory user) external {
        userRegister.userRegistered(user);
        loggedIn[msg.sender] = true;
        loginTime[msg.sender] = block.timestamp;
    }

    // Logs the user out
    function logOutUser() external {
        if(loggedIn[msg.sender]){ // If the user is logged in
           loggedIn[msg.sender] = false; 
        }
    }

    // Verify if user is logged in
    // Returns true if the user is logged in and false otherwise
    // Does not need any validation to ensure who executes the method because it only returns if a user is or isn't logged in
    function userLoggedIn(address userAccount) external view returns (bool) {
        if(loggedIn[userAccount]) {
            return true;
        }
        return false;
    }

    // Verifies if the timeout has been reached
    // returns true if the timeout hasn't been reached and false otherwise
    // Does not need any validation to ensure who executes the method because it only returns if a user has reached timeout or not
    function noTimeOut(address userAccount) external view returns (bool) {
        uint intervalTimeLogged = block.timestamp - loginTime[userAccount];
        if(intervalTimeLogged <= TIMEOUT_LIMIT) {
            return true;
        }
        return false;
    }

    function getTimeOutLimit() external pure returns (uint){
        return TIMEOUT_LIMIT;
    }
}