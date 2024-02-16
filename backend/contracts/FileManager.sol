// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./UserManager.sol";

contract FileManager {

    struct File {
        string ipfsCID;            // CID from IPFS (hash) - Unique
        string fileName;           // File Name - cannot be repeated
        address owner;             // The owner - who uploaded the file
        string fileType;           // Image or file
        string iv;                 // Initialization Vector for AES (used in file encryption and decryption with symmetric key)
    }

    File[] private userFiles;

    // Create a file (Upload)
    function uploadFile(File memory file) public {
        // Adds the corresponding information to the corresponding structs
        userFiles.push(file);       
    }

    // Returns the users' file
    function getFiles() public view returns (File[] memory) {
        return userFiles;
    }

    // Gets a file having the files' IPFS CID
    function getFileByIpfsCID(string memory fileIpfsCid) public view returns (FileManager.File memory) {
        for (uint256 i=0; i<userFiles.length; i++) {
            if (keccak256(abi.encodePacked(userFiles[i].ipfsCID)) == keccak256(abi.encodePacked(fileIpfsCid))) {
                return userFiles[i];
            }
        }   
        return File({ fileName: "", owner: address(0), ipfsCID: "", fileType: "", iv: "" });
    }

}