// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./UserStruct.sol";

contract StoreUser {

    // Even though User[] already stored the address of the user, putting thin in a map failitates when returning the users' information (we don't have to go through all owners in the system)
    mapping(address => User) private users;

    // Adds a new user in the blockchain
    function login(User memory user) public {
        // Check if the address already has a user
        require(users[user.account].account == address(0), "User already exists for this address");

        users[msg.sender] = user;
    }

    // Gets the information of a given user
    function getUser(address account) public view returns (User memory) {
        return users[account];
    }
  
}
