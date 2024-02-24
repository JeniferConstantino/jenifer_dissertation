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

    mapping(string => File) private files;  // Key: ipfsCID

    // Create a file (Upload)
    function addFile(File memory file) public {
        if (file.owner == msg.sender) { // Only if the one executing the transaction is the file owner
            if (canAddFile(file)) {
                files[file.ipfsCID] = file;
            }
        }
    }

    // Gets a file having the files' IPFS CID
    // No restrictions to execute this function: the content is encrypted
    // It was planned to validate if the user is the owner or if the file was shared with the user, nevertheless this would originate a dependency with the AccessControl which is already dependent with the FileRegister
    function getFileByIpfsCID(string memory fileIpfsCid) public view returns (ResultAction memory) {
        if (bytes(files[fileIpfsCid].fileName).length > 0) {
            return ResultAction(true, files[fileIpfsCid]);       
        } else {
            return ResultAction(false, File("", "", address(0), "", ""));       
        }
    }

    // Verifies if a file can be added
    function canAddFile(File memory file) public view returns (bool) {
        if (file.owner == msg.sender) {
            if (!fileExists(file.ipfsCID) && fileParamValid(file)) { // stores only if the file is not already soted => avoid overlay of information
                return true;
            }
        }
        return false;
    }

    // Verifies if a file is already stored
    // Because no infromarion in particular is disclosed and because it only returns true or false, no validation in the access was made (the one calling this method doesn't need to be the same one of the input)
    // This method is also used by the AccessControl.sol
    function fileExists(string memory fileIpfsCID) public view returns (bool) {
        if (bytes(files[fileIpfsCID].ipfsCID).length != 0) {
            return true;
        }
        return false;
    }

    // Verifies if the file has all parameters valid
    function fileParamValid(File memory file) public view returns (bool) {
        if (file.owner == msg.sender) {
            if (bytes(file.ipfsCID).length != 0 && 
                bytes(file.fileName).length != 0 && 
                bytes(file.fileType).length != 0 && 
                bytes(file.iv).length != 0 && 
                file.owner != address(0)) {
                return true;
            }
        }
        return false;
    } 

    // Returns if the user is the file owner
    // Because no infromarion in particular is disclosed and because it only returns true or false, no validation in the access was made (the one calling this method doesn't need to be the same one of the input)
    // This method is also used by the AccessControl.sol 
    function userIsFileOwner(address userAccount, string memory fileIpfsCID) public view returns (bool) {
        if (files[fileIpfsCID].owner == userAccount) {
            return true;
        }
        return false;
    }
}