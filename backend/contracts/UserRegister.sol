// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./Helper.sol";

contract UserRegister {
    
    struct User {
        address account;           // Address Account in MetaMask - Unique
        string userName;           // Name of the user - unique
        string mnemonic;           // Users' mnemonic => seed phrase
        string publicKey;
    }

    struct ResultUser {
        bool success;
        User user;
        string message;
    }

    mapping(address => User) private users;                  // Key: account 
    mapping(string => User) private usersByName;             // Same information as the map "users" but with the name being the key: helps in the method: getUserByUserName 
    mapping(string => bool) private userNameExists;
    Helper helper;

    constructor(address helperContract) {
        helper = Helper(helperContract);
    }

    // Create a new user by adding him to the blockchain
    // Unwanted Usage: incert an existing user and overlap the existing information. 
    // To be able to register: userName has to be unique
    //                         address has to be unique
    //                         the transaction executer has to have the same address as the user
    //                         user fields have to be valid
    function userRegistered(User memory user) external {
        if (user.account == msg.sender) {
            if (canRegister(user)) { // Checks if the user is elegible to register (including validating fields)
                users[user.account] = User(user.account, helper.toLower(user.userName), user.mnemonic, user.publicKey);
                usersByName[user.userName] = User(user.account, user.userName, user.mnemonic, user.publicKey);
                userNameExists[user.userName] = true;
            } 
        }
    }

    // Gets the information of a given user. If the user doesn't exist it returns an empty user.
    // The one asking for the users' information should be the same one executing the transaction
    function getUser(address account) external view returns (ResultUser memory) {
        if (account == msg.sender) {
            if (users[account].account != address(0)) {
                return ResultUser(true, users[account], "");
            } 
        }
        return ResultUser(false, User(address(0), "", "", ""), "The account of the transaction executer should be the same one as the user which the information is being requested from.");
    }

    // Returns the user name of a user
    function getUserUserName(address account) external view returns (Helper.ResultString memory) {
        if (users[account].account != address(0)) {
            return Helper.ResultString(true, users[account].userName, "");
        }
        return Helper.ResultString(false, "", "There is no user with the given account.");
    } 

    // Given a name, returns the user account, if the user exists
    function getUserAccount(string memory userName) external view returns (Helper.ResultAddress memory) {
        if (bytes(usersByName[userName].userName).length > 0) {
            return Helper.ResultAddress(true, usersByName[userName].account, "");       
        } else {
            return Helper.ResultAddress(false, address(0), "There is no user with the given username.");       
        }
    }

    // Given the account, returns the users' public key
    function getPublicKey(address account) external view returns (Helper.ResultString memory) {
        if (users[account].account != address(0)) {
            return Helper.ResultString(true, users[account].publicKey, "");
        } else {
            return Helper.ResultString(false, "", "There is no user with the fiven account.");
        }
    }

    // Checks if the user is elegible to register
    // The one seeing if the user is elegible to register should be the same one executing the transaction
    function canRegister(User memory user) private view returns (bool) {
        if (user.account == msg.sender) { 
            if (!existingAddress(user.account) && !existingUserName(user.userName) && helper.validUserFields(user)) {
                return true;
            }
        }
        return false;        
    }

    // Checks if a user is associated with a certain mnemonic if the user is the same as the transaction executer
    function verifyUserAssociatedMnemonic(string memory mnemonic, address account) external view returns (bool) {
        if (account == msg.sender) {
            if(keccak256(abi.encodePacked(users[account].mnemonic)) == keccak256(abi.encodePacked(mnemonic))){
                return true;
            }
        }
        return false;
    }

    // Verifies if the address exists (if the user already exists)
    // Because no infromarion in particular is disclosed and because it only returns true or false, no validation in the access was made (the one calling this method doesn't need to be the same one of the input)
    // This method is also used by the AccessControl.sol 
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