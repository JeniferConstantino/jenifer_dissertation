// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

struct User {
    address account;           // Address Account in MetaMask - Unique
    string name;               // Name of the user - unique
    string publicKey;          // User's public key
    string privateKey;         // User's private key
}
