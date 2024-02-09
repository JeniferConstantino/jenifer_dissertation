// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

struct File {
    string fileName;         // Unique
    address owner;           // The owner - who uploaded the file
    string ipfsCID;          // CID from IPFS (hash)
    string fileType;         // Image or file
    string iv;               // Initialization Vector for AES (used in file encryption and decryption with symmetric key)
}
