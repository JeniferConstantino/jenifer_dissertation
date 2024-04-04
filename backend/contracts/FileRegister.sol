// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./Helper.sol";
import "./AccessControl.sol";

contract FileRegister {

    struct File {                 
        string ipfsCID;            // CID from IPFS (hash) - Unique
        string fileName;           // File Name         
        int version;               // Keeps the version of the file
        string prevIpfsCID;        // Keeps the file IPFS from which it was edited. If 1st upload => 0
        address owner;             // The owner - who uploaded the file
        string fileType;           // Image or file
        string iv;                 // Initialization Vector for AES (used in file encryption and decryption with symmetric key)
        string state;              // active and deactive
        string fileHash;           // hash of the file: SHA-256
    }
    struct ResultFile {
        bool success;
        File file;
        string message;
    }
    struct ResultFiles {
        bool success;
        File[] files;
        string message;
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
        if (accessControlContractAddress != address(0) && 
            accessControlAddress == address(0)  &&
            accessControlAddress == address(uint160(accessControlAddress))
            ) {
            accessControlAddress = accessControlContractAddress;
        }
    }

    // Create a file (Upload)
    // Should add file if: the transaction executer is the AccessControl.sol
    //                     the file exists
    //                     file parameter inputs are valid
    function addFile(File memory file) external {
        if (msg.sender == accessControlAddress) { 
            if (canAddFile(file)) {
                file.state = "active";
                file.prevIpfsCID = "0"; // because it's the first upload 
                files[file.ipfsCID] = file;
                ipfsCids.push(file.ipfsCID);
            }
        }
    }

    // Edits a file - like an upload 
    // Edit a file if: the transaction executer is the accessControl address
    // In here: the file owner is the same 
    //          the previousIpfsCid is the one from which the file is being edited from
    //          the file version is incremented to one
    //          the file state is now edited but the new edited file is in the state active
    function editFile(File memory selectedFile, File memory newFile) external {
        if (msg.sender == accessControlAddress &&
            selectedFile.owner == address(uint160(selectedFile.owner)) &&
            selectedFile.owner != address(0)
        ) {
            files[selectedFile.ipfsCID].state = "edited";

            newFile.owner = selectedFile.owner;
            newFile.prevIpfsCID = selectedFile.ipfsCID;
            newFile.version = selectedFile.version + 1;
            newFile.state = "active";

            files[newFile.ipfsCID] = newFile; // adds the new file
            ipfsCids.push(newFile.ipfsCID);
        }
    }

    // Deletes a file if: the transaction executer is the accessControl address
    function deactivateFile(string memory fileIpfsCid) external {
        if(msg.sender == accessControlAddress) {
            files[fileIpfsCid].state = "deactive";
        }
    }

    // Gets a file having the files' IPFS CID: doesn't need validations since files are already encrypted
    //                                         only returns if the file is in the selected state
    function getFileByIpfsCID(string memory fileIpfsCid, string memory state) external view returns (ResultFile memory) {
        if (bytes(files[fileIpfsCid].fileName).length > 0 &&
            (keccak256(abi.encodePacked(files[fileIpfsCid].state)) == keccak256(abi.encodePacked(state)) || keccak256(abi.encodePacked(state))==keccak256(abi.encodePacked("")))
        ) {
            return ResultFile(true, files[fileIpfsCid], "");       
        }
        return ResultFile(false, File("", "", 0, "", address(0), "", "", "", ""), "Thre is no file, in the given state, that has the given IPFS CID.");       
    }

    // Gets the edited files of a given file: doesn't need validations since files are already encrypted
    //                                        returns the historic of file edition. "prevIpfsCID" fields is the responsible for keeping the track
    function getEditedFilesByIpfsCid(string memory fileIpfsCid) external view returns (ResultFiles memory) {
        File[] memory editedFiles = new File[](ipfsCids.length);
        
        File memory currentFile = files[fileIpfsCid];
        uint256 indexEditedFiles = 0;

        // Loop until a file with prevIpfsCid reaches 0
        while(keccak256(abi.encodePacked(currentFile.prevIpfsCID)) != keccak256(abi.encodePacked("0"))) {
            editedFiles[indexEditedFiles] = currentFile;
            indexEditedFiles++;

            string memory prevIpfsCID = currentFile.prevIpfsCID;
            currentFile = files[prevIpfsCID];
        }

        // Stores the final (with prevIpfsCid = 0) on the editedFiles
        editedFiles[indexEditedFiles] = currentFile;
        indexEditedFiles++;
        
        // Resize the result array to remove unused elements
        assembly {
            mstore(editedFiles, indexEditedFiles)
        }

        return ResultFiles(true, editedFiles, "");
    }

    // Function to return all IPFS CIDs associated with a given file name: no matter the version
    //                                                                     in the state active 
    function getIpfsCIDsByName(string memory name) external view returns (Helper.ResultStringArray memory) {
        if(msg.sender == accessControlAddress) {
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
            return Helper.ResultStringArray(true, ipfsCIDs, "");
        }
        return Helper.ResultStringArray(false, new string[](0), "Only the AccessControl.sol contract is able to execute this method.");
    }

    // Returns the state of a file if: the transaction executer is the AccessControl contract
    function getFileState(string memory fileIpfsCID) external view returns (Helper.ResultString memory) {
        return Helper.ResultString(true, files[fileIpfsCID].state, "");
    }

    // Returns the file hash of a file if: the transaction executes is the AccessControl contract
    function getFileHash(string memory fileIpfsCID) external view returns (Helper.ResultString memory) {
        if (msg.sender == accessControlAddress) {
            return Helper.ResultString(true, files[fileIpfsCID].fileHash, "");
        }
        return Helper.ResultString(false, "", "The transaction executer can only be the AccessControl.sol contract.");
    }

    // Verifies if a file can be added if: the transaction executer is the AccessControl.sol
    //                                     file is not already stored => avoid overlay of information
    //                                     file parameters are valid
    function canAddFile(File memory file) private view returns (bool) {
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
        if (bytes(files[fileIpfsCID].ipfsCID).length != 0 && 
            msg.sender == accessControlAddress) {
            return true;
        }
        return false;
    }

    // Returns if the user is the file owner
    function userIsFileOwner(address userAccount, string memory fileIpfsCID) external view returns (bool) {
        if (files[fileIpfsCID].owner == userAccount) {
            return true;
        }
        return false;
    }
}