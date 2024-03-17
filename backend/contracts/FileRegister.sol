// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./Helper.sol";
import "./AccessControl.sol";

contract FileRegister {

    struct File {                 
        string ipfsCID;            // CID from IPFS (hash) - Unique
        string fileName;           // File Name         
        int version;               // Keeps the version of the file
        address owner;             // The owner - who uploaded the file
        string fileType;           // Image or file
        string iv;                 // Initialization Vector for AES (used in file encryption and decryption with symmetric key)
        string state;              // active and deactive
        string fileHash;           // hash of the file: SHA-256
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
    string[] ipfsCids; // Stores the unique ipfs CIDs => Solidity doesn't allow to iterate over a map
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
                file.state = "active";
                files[file.ipfsCID] = file;
                ipfsCids.push(file.ipfsCID);
            }
        }
    }

    // Deletes a file if: the transaction executer is the accessControl address
    function deactivateFile(string memory fileIpfsCid) public {
        if(msg.sender == accessControlAddress) {
            files[fileIpfsCid].state = "deactive";
        }
    }

    // Gets a file having the files' IPFS CID: doesn't need validations since files are already encrypted
    //                                         only returns if the file is in the state "active"
    function getFileByIpfsCID(string memory fileIpfsCid, string memory state) public view returns (ResultFile memory) {
        if (bytes(files[fileIpfsCid].fileName).length > 0 &&
            (keccak256(abi.encodePacked(files[fileIpfsCid].state)) == keccak256(abi.encodePacked(state)) || keccak256(abi.encodePacked(state))==keccak256(abi.encodePacked("")))
        ) {
            return ResultFile(true, files[fileIpfsCid]);       
        }
        return ResultFile(false, File("", "", 0, address(0), "", "", "", ""));       
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

    // Function to return all IPFS CIDs associated with a given file name: no matter the version
    //                                                                     in the state active 
    function getIpfsCIDsForName(string memory name) public view returns (string[] memory) {
        string[] memory ipfsCIDs = new string[](ipfsCids.length);
        uint256 count = 0;
        for (uint256 i=0; i<ipfsCids.length; i++) {
            if (keccak256(abi.encodePacked(files[ipfsCids[i]].fileName)) == keccak256(abi.encodePacked(name)) &&
                keccak256(abi.encodePacked(files[ipfsCids[i]].state)) == keccak256(abi.encodePacked("active"))
            ) {
                ipfsCIDs[count] = files[ipfsCids[i]].ipfsCID;
                count++;
            }
        }
        assembly {
            mstore(ipfsCIDs, count)
        }
        return ipfsCIDs;
    }

    // Returns the latest version of a file by its name. No metter if the file is in the active or deactive state
    function getLatestVersionOfFile(string memory fileName) public view returns (int) {
        int latestVersion = -1; 
        for (uint256 i = 0; i < ipfsCids.length; i++) {
            if (keccak256(abi.encodePacked(files[ipfsCids[i]].fileName)) == keccak256(abi.encodePacked(fileName)) && files[ipfsCids[i]].version > latestVersion) {
                latestVersion = files[ipfsCids[i]].version;  // Update the latest version
            }
        }
        return latestVersion;  // Return the latest file with the desired fileName
    }

    // Returns the owner of the original file (version 0), given its name
    function getFileOwner(string memory fileName) public view returns (address) {
        for (uint256 i = 0; i < ipfsCids.length; i++) {
            if (keccak256(abi.encodePacked(files[ipfsCids[i]].fileName)) == keccak256(abi.encodePacked(fileName)) && files[ipfsCids[i]].version == 0) {
                return files[ipfsCids[i]].owner;  // Update the latest version
            }
        }
        return address(0);
    }

    // Returns the state of a file if: the transaction executer is the AccessControl contract
    function getFileState(string memory fileIpfsCID) public view returns (Helper.ResultString memory) {
        if(msg.sender == accessControlAddress) {
            return Helper.ResultString(true, files[fileIpfsCID].state);
        }
        return Helper.ResultString(false, "");
    }

    // Returns the file hash of a file if: the transaction executes is the AccessControl contract
    function getFileHash(string memory fileIpfsCID) public view returns (Helper.ResultString memory) {
        if (msg.sender == accessControlAddress) {
            return Helper.ResultString(true, files[fileIpfsCID].fileHash);
        }
        return Helper.ResultString(false, "");
    }

}