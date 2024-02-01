// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

struct File {
    string fileName; // Unique
    string encSymmetricKey;
    string owner;
    string ipfsCID;
    string fileType;
    string iv;
}
