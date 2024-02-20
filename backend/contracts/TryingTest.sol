// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TryingTest {
    
    struct User {
        address account;           // Address Account in MetaMask - Unique
        string userName;           // Name of the user - unique
        string publicKey;          // User's public key
        string privateKey;         // User's private key
    }

    mapping(address => User) private nums;

    function getNum(address account) public view returns (User memory) {
        return nums[account];
    }

    // Verifies if the username is taken
    function existingUserName(address account) public returns (User memory) {
        nums[account] = User(address(123123), "Joao", "asd", "qwe");
        return nums[account];
    }
}