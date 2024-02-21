// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FileRegister {

    struct File {
        string ipfsCID;            // CID from IPFS (hash) - Unique
        string fileName;           // File Name - cannot be repeated
        address owner;             // The owner - who uploaded the file
        string fileType;           // Image or file
        string iv;                 // Initialization Vector for AES (used in file encryption and decryption with symmetric key)
    }
    struct ResultAction {
        bool success;
        FileRegister.File file;
    }

    mapping(string => File) private files;

    // Create a file (Upload)
    /*function uploadFile(File memory file) public {
        // Adds the corresponding information to the corresponding structs
        userFiles.push(file);       
    }

    // Returns the users' file
    function getFiles() public view returns (File[] memory) {
        return userFiles;
    }*/

    // Gets a file having the files' IPFS CID
    function getFileByIpfsCID(string memory fileIpfsCid) public view returns (ResultAction memory) {
        if (bytes(files[fileIpfsCid].fileName).length > 0) {
            return ResultAction(true, files[fileIpfsCid]);       
        } else {
            return ResultAction(false, File("", "", address(0), "", ""));       
        }
    }

}