// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./UserRegister.sol";
import "./FileRegister.sol";


contract AccessControl {

    struct UserHasFile {
        address userAccount;       // User account
        string ipfsCID;            // ipfsCID 
        string encSymmetricKey;    // Key used for the file encryption
        string[] permissions;      // It can be: delete, update, share
    }

    UserHasFile[] private userHasFile;
    FileRegister fileRegister;
    event UploadFileResult(bool success, string message);

    constructor(address fileRegisterContract) {
        fileRegister = FileRegister(fileRegisterContract);
    }
    // Associates a user to a file
    function storeUserHasFile(UserRegister.User memory user, FileRegister.File memory file, string memory encSymmetricKey, string[] memory permissions) public {
        // See if the user is already associated with the file
        string memory validFileUpload = fileExists(user, file, permissions);

        if (bytes(validFileUpload).length == 0) {
            // Creates a new row
            UserHasFile memory userFileData = UserHasFile({
                userAccount: user.account,
                ipfsCID: file.ipfsCID,
                encSymmetricKey: encSymmetricKey,
                permissions: permissions
            });
            userHasFile.push(userFileData);    

            // Adds the file to the fileRegister table
            fileRegister.uploadFile(file);

            // Emits the message that the file has been uploaded
            emit UploadFileResult(true, "File uploaded successfully.");
            return;
        }    

        emit UploadFileResult(false, validFileUpload);
        return;
    }

    // Returns the encrypted symmetric key of a given user and file 
    function getEncSymmetricKeyFileUser (UserRegister.User memory user, FileRegister.File memory file) public view returns (string memory) {
        for (uint256 i=0; i<userHasFile.length; i++) {
            if ((userHasFile[i].userAccount == user.account) && (keccak256(abi.encodePacked(userHasFile[i].ipfsCID)) == keccak256(abi.encodePacked(file.ipfsCID)))) {
                return userHasFile[i].encSymmetricKey;
            }
        }
        return "";   
    }

    // Returns the permissions of a given user over a given file
    function getPermissionsOverFile (UserRegister.User memory user, FileRegister.File memory file) public view returns (string[] memory) {
        for (uint256 i=0; i<userHasFile.length; i++) {
            if ((userHasFile[i].userAccount == user.account) && (keccak256(abi.encodePacked(userHasFile[i].ipfsCID)) == keccak256(abi.encodePacked(file.ipfsCID)))) {
                return userHasFile[i].permissions;
            }
        }
        return new string[](0);   
    }

    // Returns the files of a giving user
    function getUserFiles(address account) public view returns (FileRegister.File[] memory) {
        // Stores the users' files
        FileRegister.File[] memory userFilesResult = new FileRegister.File[](userHasFile.length);
        uint resultIndex = 0;

        for (uint i=0; i<userHasFile.length; i++) {
        if (userHasFile[i].userAccount == account) { // Looks for the files the user is associated with 
            string memory fileIpfsCIDUser = userHasFile[i].ipfsCID;
            FileRegister.File memory fileUser = fileRegister.getFileByIpfsCID(fileIpfsCIDUser); // Gets the file having the IPFS CID

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

    // See if a user already has a file with a given name
    function fileExists(UserRegister.User memory user, FileRegister.File memory file, string[] memory permissions) public returns (string memory) {    
        for (uint256 i=0; i<userHasFile.length; i++) {
            if ((userHasFile[i].userAccount == user.account) && (keccak256(abi.encodePacked(userHasFile[i].ipfsCID)) == keccak256(abi.encodePacked(file.ipfsCID)))) {
                // Update permissions
                userHasFile[i].permissions = permissions;
                return "User already associated with the file";
            }
        }
        return "";
    }
}