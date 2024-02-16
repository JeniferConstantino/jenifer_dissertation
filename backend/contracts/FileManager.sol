// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./UserManager.sol";
import "./AccessManager.sol";

contract FileManager {

    struct File {
        string fileName;           // Unique
        address owner;             // The owner - who uploaded the file
        string ipfsCID;            // CID from IPFS (hash)
        string fileType;           // Image or file
        string iv;                 // Initialization Vector for AES (used in file encryption and decryption with symmetric key)
    }

    event UploadFileResult(bool success, string message);
    File[] private userFiles;
    AccessManager accessManager;

    constructor(address accessManagerAddress) {
        accessManager = AccessManager(accessManagerAddress);
    }

    // Create a file (Upload)
    function uploadFile(File memory file, string memory encSymmetricKey, UserManager.User memory user) public {
        string memory validFileUpload = fileExists(file, user);  // Checks if there is a file with the same name

        if (bytes(validFileUpload).length == 0) {
        // Adds the corresponding information to the corresponding structs
        userFiles.push(file);

        // Sets the permissions. Who uploads the file is the owner. And for so he has: download, delete, and share file
        string[] memory defaultPermissions = new string[](3);
        defaultPermissions[0] = "download";
        defaultPermissions[1] = "delete";
        defaultPermissions[2] = "share";

        accessManager.storeUserHasFile(user, file, encSymmetricKey, defaultPermissions);

        // Emits the message that the file has been uploaded
        emit UploadFileResult(true, "File uploaded successfully.");
        return;
        }
        emit UploadFileResult(false, validFileUpload);
        return;
    }

    // See if a user already has a file with a given name
    function fileExists(File memory file, UserManager.User memory user) public view returns (string memory) {    
        File[] memory usersFiles = getUserFiles(user.account); // gets the files of a given user

        File memory fileReceived = getFileByName(file.fileName, usersFiles); // Sees if there is an already existing file with the same name

        if (keccak256(abi.encodePacked(fileReceived.fileName)) != keccak256(abi.encodePacked(""))) {
            return "User already associated with the file."; 
        }

        return ""; 
    }

    // Gets a file having the files' name and the array to search on
    function getFileByName(string memory name, File[] memory files) public pure returns (File memory) {
        for (uint256 i=0; i<files.length; i++) {
            if (keccak256(abi.encodePacked(files[i].fileName)) == keccak256(abi.encodePacked(name))) {
                return files[i];
            }
        }   
        return File({ fileName: "", owner: address(0), ipfsCID: "", fileType: "", iv: "" });
    }

    // Returns the users' file
    function getFiles() public view returns (File[] memory) {
        return userFiles;
    }

    // Returns the files of a giving user
    function getUserFiles(address account) public view returns (FileManager.File[] memory) {
        // Stores the users' files
        FileManager.File[] memory userFilesResult = new FileManager.File[](userFiles.length);
        uint resultIndex = 0;

        // Gets the users' files names
        AccessManager.UserHasFile[] memory usersFiles = accessManager.getUserHasFileArray();

        for (uint i=0; i<usersFiles.length; i++) {
        if (usersFiles[i].userAccount == account) { // Looks for the files the user is associated with 
            string memory fileNameUser = usersFiles[i].fileName;
            FileManager.File memory fileUser = getFileByName(fileNameUser, userFiles); // Gets the file having the file name

            // Stores the file in the array to be returned
            userFilesResult[resultIndex] = fileUser;
            resultIndex++;
        }
        }
        // Resize the result array to remove unused elements
        assembly {
        mstore(userFilesResult, resultIndex)
        }
        return userFilesResult;
    }

}