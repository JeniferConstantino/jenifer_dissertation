// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./Helper.sol";
import "./AccessControl.sol";

contract FileRegister {

    struct File {
        string ipfsCID;            // CID from IPFS (hash) - Unique
        string fileName;           // File Name - cannot be repeated
        address owner;             // The owner - who uploaded the file
        string fileType;           // Image or file
        string iv;                 // Initialization Vector for AES (used in file encryption and decryption with symmetric key)
    }
    struct ResultFile {
        bool success;
        File file;
    }
    struct ResultFiles {
        bool success;
        File[] files;
    }

    mapping(string => File) private files;  // Key: ipfsCID
    Helper helper;
    address accessControlAddress;

    constructor(address helperContract) {
        helper = Helper(helperContract);
    }

    // Sets the file register contract interface to be used if: the fileRegisterContract was deployes (is different than 0)
    //                                                          the fileRegisterContract is not already initialized
    function setAccessControlAddress(address accessControlContractAddress) external {
        if (accessControlContractAddress != address(0) && accessControlAddress == address(0)) {
            accessControlAddress = accessControlContractAddress;
        }
    }

    // Create a file (Upload)
    // Should add file if: the transaction executer is the AccessControl.sol
    //                     the file exists
    //                     file parameter inputs are valid
    function addFile(File memory file) public {
        if (msg.sender == accessControlAddress) { 
            if (canAddFile(file)) {
                files[file.ipfsCID] = file;
            }
        }
    }

    // Gets a file having the files' IPFS CID. 
    // Doesn't need validations since files are encrypted
    function getFileByIpfsCID(string memory fileIpfsCid) public view returns (ResultFile memory) {
        if (bytes(files[fileIpfsCid].fileName).length > 0) {
            return ResultFile(true, files[fileIpfsCid]);       
        }
        return ResultFile(false, File("", "", address(0), "", ""));       
    }

    // Verifies if a file can be added if: the transaction executer is the AccessControl.sol
    //                                     file is not already stored => avoid overlay of information
    //                                     file parameters are valid
    function canAddFile(File memory file) public view returns (bool) {
        if (!fileExists(file.ipfsCID) && 
            helper.fileParamValid(file) && 
            msg.sender == accessControlAddress
        ) {
            return true;
        }
        return false;
    }

    // Verifies if a file is already stored if: the transaction executer is the AccessControl.sol
    function fileExists(string memory fileIpfsCID) public view returns (bool) {
        if (bytes(files[fileIpfsCID].ipfsCID).length != 0 && msg.sender == accessControlAddress) {
            return true;
        }
        return false;
    }

    // Returns if the user is the file owner if: the transaction executer is the AccessControl.sol
    function userIsFileOwner(address userAccount, string memory fileIpfsCID) public view returns (bool) {
        if (files[fileIpfsCID].owner == userAccount && msg.sender == accessControlAddress) {
            return true;
        }
        return false;
    }
}