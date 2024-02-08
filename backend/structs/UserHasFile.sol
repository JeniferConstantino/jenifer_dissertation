// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

struct UserHasFile {
    address userAccount;           // User account
    string fileName;               // File Name 
    string encSymmetricKey;        // Key used for the file encryption
    string[] permissions;          // It can be: delete, update, share
}
