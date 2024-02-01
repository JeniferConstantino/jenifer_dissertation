// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

struct File {
    string fileName; // Unique
    string owner;    // the own who uploaded the file
    string encSymmetricKey;
    string ipfsCID;
    string fileType;
    string iv;
}
