// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

struct File {
    string fileName;         //Unique
    string owner;           // The owner - who uploaded the file
    string encSymmetricKey; // Key used for the file encryption
    string ipfsCID;         // CID from IPFS (hash)
    string fileType;        // image or file
    string iv;              // Initialization Vector for AES (used in file encryption and decryption with symmetric key)
}
