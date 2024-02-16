// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract UserManager {
    
    struct User {
        address account;           // Address Account in MetaMask - Unique
        string name;               // Name of the user - unique
        string publicKey;          // User's public key
        string privateKey;         // User's private key
    }

    User[] private users;
    event RegistrationResult(bool success, string message);

    // Create a new user - adds a new user in the blockchain
    function register(User memory user) public {
        string memory validRegistration = checkRegistration(user);  // Checks if the user already exists - in case the frontend doesn't call
        if (bytes(validRegistration).length == 0) {
            users.push(user);                                       // Adds the user in the blockchain
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

    // Gets a user having the users' name
    function getUserByName(string memory name) public view returns (User memory) {
        for (uint256 i=0; i<users.length; i++) {
            if (keccak256(abi.encodePacked(users[i].name)) == keccak256(abi.encodePacked(name))) {
                return users[i];
        }
        }   
        return User({ name: "", account: address(0), publicKey: "", privateKey: ""});
    }

    // Checks if the user is elegible to register
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