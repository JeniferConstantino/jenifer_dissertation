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

    struct ResultAction {
        bool success;
        FileRegister.File[] files;
    }

    UserHasFile[] private userHasFile;  // Not using map because solity doesn't accept structs in keys and a map of this would only make sense if userAccound and ipfsCID could simultaneously be considered keys
    FileRegister fileRegister;

    constructor(address fileRegisterContract) {
        fileRegister = FileRegister(fileRegisterContract);
    }

    function addUserHasFile (UserRegister.User memory user, FileRegister.File memory file, string memory encSymmetricKey, string[] memory permissions) private {
        UserHasFile memory userFileData = UserHasFile({
            userAccount: user.account,
            ipfsCID: file.ipfsCID,
            encSymmetricKey: encSymmetricKey,
            permissions: permissions
        });
        userHasFile.push(userFileData);
    }

    // Upload a file in the system (associates the file to the user, with the given permissions, and adds to the file map)
    function uploadFile(UserRegister.User memory user, FileRegister.File memory file, string memory encSymmetricKey) public {
        bool isUserAssociatedWithFile = userAssociatedWithFile(user, file);
        if (isUserAssociatedWithFile) {
            return; // failed in the upload
        }

        // Adds the association with the given permissions
        string[] memory permissions = new string[](3); // By default these are the permissions of the owner
        permissions[0] = "download";
        permissions[1] = "delete";
        permissions[2] = "share";
        addUserHasFile(user, file, encSymmetricKey, permissions);        

        // Adds the file to the fileRegister table
        fileRegister.addFile(file);
    }

    function shareFile(UserRegister.User memory user, FileRegister.File memory file, string memory encSymmetricKey, string[] memory permissions) public {
        bool isUserAssociatedWithFile = userAssociatedWithFile(user, file);
        if (isUserAssociatedWithFile) {
            updateUserFilePermissions(user, file, permissions);
            return;
        }

        // Associates the user with the file given the permissions
        addUserHasFile(user, file, encSymmetricKey, permissions);        
    }

    // Updates the permissions a user has over a file
    function updateUserFilePermissions(UserRegister.User memory user, FileRegister.File memory file, string[] memory permissions) private {
        for (uint256 i=0; i<userHasFile.length; i++) {
            if (isKeyEqual(user.account, userHasFile[i].userAccount, file.ipfsCID, userHasFile[i].ipfsCID)) {
                // updates permissions
                userHasFile[i].permissions = permissions;
                return;
            }
        }
    }

    // Returns the encrypted symmetric key of a given user and file 
    function getEncSymmetricKeyFileUser (UserRegister.User memory user, FileRegister.File memory file) public view returns (string memory) {
        for (uint256 i=0; i<userHasFile.length; i++) {
            if (isKeyEqual(user.account, userHasFile[i].userAccount, file.ipfsCID, userHasFile[i].ipfsCID)) {
                return userHasFile[i].encSymmetricKey;
            }
        }
        return "";   
    }

    // Returns the permissions of a given user over a given file
    function getPermissionsOverFile (UserRegister.User memory user, FileRegister.File memory file) public view returns (string[] memory) {
        for (uint256 i=0; i<userHasFile.length; i++) {
            if (isKeyEqual(user.account, userHasFile[i].userAccount, file.ipfsCID, userHasFile[i].ipfsCID)) {
                return userHasFile[i].permissions;
            }
        }
        return new string[](0);   
    }

    // Returns the files of a giving user
    function getUserFiles(address account) public view returns (ResultAction memory) {
        // Stores the users' files
        FileRegister.File[] memory userFilesResult = new FileRegister.File[](userHasFile.length);
        uint resultIndex = 0;
        for (uint i=0; i<userHasFile.length; i++) {
            if (userHasFile[i].userAccount == account) { // Looks for the files the user is associated with 
                string memory fileIpfsCIDUser = userHasFile[i].ipfsCID;
                FileRegister.ResultAction memory result = fileRegister.getFileByIpfsCID(fileIpfsCIDUser); // Gets the file having the IPFS CID
                FileRegister.File memory fileUser = result.file;
                // Stores the file in the array to be returned
                userFilesResult[resultIndex] = fileUser;
                resultIndex++;
            }
        }
        // Resize the result array to remove unused elements
        assembly {
            mstore(userFilesResult, resultIndex)
        }
        // Returns accordingly
        if (resultIndex != 0) {
            return ResultAction(true, userFilesResult);
        } else {
            return ResultAction(false, userFilesResult);
        }
    }

    // Sees if a user is already associated with a file
    function userAssociatedWithFile(UserRegister.User memory user, FileRegister.File memory file) public view returns (bool) {
        for (uint256 i=0; i<userHasFile.length; i++) {
            if (isKeyEqual(user.account, userHasFile[i].userAccount, file.ipfsCID, userHasFile[i].ipfsCID)) {
                return true;
            }
        }
        return false;
    }

    // Sees if the ipfsCID and the account (primary keys) are the same as the inputs 
    function isKeyEqual(address accountInput, address accountList, string memory ipfsCIDInput, string memory ipfsCIDList) public pure returns (bool){
        return (accountList == accountInput) && (keccak256(abi.encodePacked(ipfsCIDList)) == keccak256(abi.encodePacked(ipfsCIDInput)));
    }
}