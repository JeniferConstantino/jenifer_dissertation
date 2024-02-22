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

    mapping(address => User) private users;                  // Key: account 
    mapping(string => User) private usersByName;             // Same information as the map "users" but with the name being the key: helps in the method: getUserByUserName 
    mapping(string => bool) private userNameExists;
    event ResultUser(bool success, User user);

    // Create a new user by adding him to the blockchain
    function userRegistered(User memory user) public {
        // Checks if the user is elegible to register
        if (canRegister(user)) {
            users[user.account] = User(user.account, user.userName, user.publicKey, user.privateKey);
            usersByName[user.userName] = User(user.account, user.userName, user.publicKey, user.privateKey);
            userNameExists[user.userName] = true;
        } 
    }

    // Gets the information of a given user. If the user doesn't exist it returns an empty user.
    function getUser(address account) public view returns (ResultAction memory) {
        if (users[account].account != address(0)) {
            return ResultAction(true, users[account]);
        } else {
            return ResultAction(false, User(address(0), "", "", ""));
        }
    }

    // Gets a user having the users' userName
    function getUserByUserName(string memory userName) public view returns (ResultAction memory) {
        if (bytes(usersByName[userName].userName).length > 0) {
            return ResultAction(true, usersByName[userName]);       
        } else {
            return ResultAction(false, User(address(0), "", "", ""));       
        }

    }

    // Checks if the user is elegible to register
    function canRegister(User memory user) public view returns (bool) {
        if (existingAddress(user.account) || existingUserName(user.userName)) {
            return false;
        }
        return true;        
    }

    // Verifies if the address exists (if the user already exists)
    function existingAddress(address account) public view returns (bool) {
        if (users[account].account != address(0)) {
            return true;
        }
        return false;
    }

    // Verifies if the username is taken
    function existingUserName(string memory userName) public view returns (bool) {
        return userNameExists[userName];
    }
}