// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./UserManager.sol";
import "./FileManager.sol";


contract AccessManager {

    struct UserHasFile {
        address userAccount;       // User account
        string fileName;           // File Name 
        string encSymmetricKey;    // Key used for the file encryption
        string[] permissions;      // It can be: delete, update, share
    }

    UserHasFile[] private userHasFile;

    constructor() {}

    // Associates a user to a file
    function storeUserHasFile(UserManager.User memory user, FileManager.File memory file, string memory encSymmetricKey, string[] memory permissions) public {
        bool found = false;
        // See if the user is already associated with the file
        for (uint256 i=0; i<userHasFile.length; i++) {
            if (userHasFile[i].userAccount == user.account && keccak256(abi.encodePacked(userHasFile[i].fileName)) == keccak256(abi.encodePacked(file.fileName))) {
            // Update permissions
            userHasFile[i].permissions = permissions;
            found = true;
            break;
            }
        }

        if (!found) {
            // Creates a new row
            UserHasFile memory userFileData = UserHasFile({
            userAccount: user.account,
            fileName: file.fileName,
            encSymmetricKey: encSymmetricKey,
            permissions: permissions
            });
            userHasFile.push(userFileData);                
        }    
    }

    // Returns the encrypted symmetric key of a given user and file 
    function getEncSymmetricKeyFileUser (UserManager.User memory user, FileManager.File memory file) public view returns (string memory) {
        for (uint256 i=0; i<userHasFile.length; i++) {
            if ((userHasFile[i].userAccount == user.account) && 
                (keccak256(abi.encodePacked(userHasFile[i].fileName)) == keccak256(abi.encodePacked(file.fileName)))
            ) {
                return userHasFile[i].encSymmetricKey;
            }
        }
        return "";   
    }

    // Returns the permissions of a given user over a given file
    function getPermissionsOverFile (UserManager.User memory user, FileManager.File memory file) public view returns (string[] memory) {
        for (uint256 i=0; i<userHasFile.length; i++) {
            if ((userHasFile[i].userAccount == user.account) && 
                (keccak256(abi.encodePacked(userHasFile[i].fileName)) == keccak256(abi.encodePacked(file.fileName)))
            ) {
                return userHasFile[i].permissions;
            }
        }
        return new string[](0);   
    }

    function getUserHasFileArray() public view returns (UserHasFile[] memory) {
        return userHasFile;
    } 
}