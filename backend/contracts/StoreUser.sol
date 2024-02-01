// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../structs/UserStruct.sol";

contract StoreUser {

    event RegistrationResult(bool success, string message);
    User[] private users; // necessary because solidity doesn't allow to iterate over mappings and their keys. 

    // Adds a new user in the blockchain - registers the user
    function register(User memory user) public {
        // Checks if the user already exists - in case the frontend doesn't call
        string memory validRegistration = checkRegistration(user); 

        if (bytes(validRegistration).length == 0) {
            users.push(user); // Adds the user in the blockchain
            emit RegistrationResult(true, "User registered successfully");
            return;
        } 
        
        emit RegistrationResult(false, validRegistration);
        return;
    }

    // Gets the information of a given user. If the user doesn't exist it returns an empty user.
    function getUser(address account) public view returns (User memory) {
        for (uint i=0; i< users.length; i++) {
            if (users[i].account == account) {
                return users[i];
            }
        }
        User memory emptyUser;
        return emptyUser;
    }

    function checkRegistration(User memory user) public view returns (string memory) {
        for (uint i=0; i< users.length; i++) {
            if (users[i].account == user.account) {
                return "User already exists for this address.";
            }
            else if (keccak256(bytes(users[i].name)) == keccak256(bytes(user.name))) {
                return "User has to have a unique name.";
            }
        }
        return "";
    }
  
}
