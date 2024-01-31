// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./UserStruct.sol";

contract StoreUser {

    mapping(address => User) private users; // Even though User[] already stored the address of the user, putting thin in a map failitates when returning the users' information (we don't have to go through all owners in the system)
    address[] private userAddresses; // necessary because solidity doesn't llow to iterate over mappings and their keys. 


    // Adds a new user in the blockchain
    function login(User memory user) public {
        // Check if the address already has a user
        require(users[user.account].account == address(0), "User already exists for this address.");

        // Checks if the name is unique
        require(isNameUnique(user.name), "User has to have a unique name.");

        users[msg.sender] = user;
        userAddresses.push(user.account);
    }

    // Gets the information of a given user
    function getUser(address account) public view returns (User memory) {
        return users[account];
    }

    function isNameUnique(string memory name) internal view returns (bool) {
        for (uint256 i=0; i<userAddresses.length; i++) {
            address userAddress = userAddresses[i];
            if (keccak256(abi.encodePacked(users[userAddress].name)) == keccak256(abi.encodePacked(name))) {
                return false; // Name already exists
            }
        }
        return true;
    }
  
}
