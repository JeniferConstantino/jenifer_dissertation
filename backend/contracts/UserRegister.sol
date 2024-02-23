// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract UserRegister {
    
    struct User {
        address account;           // Address Account in MetaMask - Unique
        string userName;           // Name of the user - unique
        string publicKey;          // User's public key
        string privateKey;         // User's private key
    }

    struct ResultAction {
        bool success;
        User user;
    }

    struct ResultActionAddress {
        bool success;
        address account;
    }

    struct ResultActionString {
        bool success;
        string publicKey;
    }

    mapping(address => User) private users;                  // Key: account 
    mapping(string => User) private usersByName;             // Same information as the map "users" but with the name being the key: helps in the method: getUserByUserName 
    mapping(string => bool) private userNameExists;
    event ResultUser(bool success, User user);

    // Create a new user by adding him to the blockchain
    // Unwanted Usage: incert an existing user and overlap the existing information. 
    // The user to be registered has to have the same address as the one executing the transaction.
    function userRegistered(User memory user) public {
        if (isUserTheTrnsctExec(user.account, msg.sender)) {
            if (canRegister(user)) { // Checks if the user is elegible to register
                users[user.account] = User(user.account, user.userName, user.publicKey, user.privateKey);
                usersByName[user.userName] = User(user.account, user.userName, user.publicKey, user.privateKey);
                userNameExists[user.userName] = true;
            } 
        }
    }

    // Gets the information of a given user. If the user doesn't exist it returns an empty user.
    // The one asking for the users' information should be the same one executing the transaction
    function getUser(address account) public view returns (ResultAction memory) {
        if (isUserTheTrnsctExec(account, msg.sender)) {
            if (users[account].account != address(0)) {
                return ResultAction(true, users[account]);
            } 
        }
        return ResultAction(false, User(address(0), "", "", ""));
    }

    // Given a name, returns the user account, if the user exists
    function getUserAccount(string memory userName) public view returns (ResultActionAddress memory) {
        if (bytes(usersByName[userName].userName).length > 0) {
            return ResultActionAddress(true, usersByName[userName].account);       
        } else {
            return ResultActionAddress(false, address(0));       
        }
    }

    // Given the account, returns the users' public key
    function getPublicKey(address account) public view returns (ResultActionString memory) {
        if (users[account].account != address(0)) {
            return ResultActionString(true, users[account].publicKey);
        } else {
            return ResultActionString(false, "");
        }
    }

    // Checks if the user is elegible to register
    // The one seeing if the user is elegible to register should be the same one executing the transaction
    function canRegister(User memory user) public view returns (bool) {
        if (isUserTheTrnsctExec(user.account, msg.sender)) { 
            if (existingAddress(user.account) == existingUserName(user.userName)) {
                return true;
            }
        }
        return false;        
    }

    // Verifies if the address exists (if the user already exists)
    // The one seeing if the address exists should be the same one executing the transaction
    function existingAddress(address account) public view returns (bool) {
        if(isUserTheTrnsctExec(account, msg.sender)){
            if (users[account].account != address(0)) {
                return true;
            }
        }
        return false;
    }

    // Verifies if the username is taken
    function existingUserName(string memory userName) public view returns (bool) {
        return userNameExists[userName];
    }

    // Sees if a certain user correspondes to the one trying to execute the method
    function isUserTheTrnsctExec(address userAccount, address account) public pure returns (bool) {
        return (userAccount == account);
    }
}