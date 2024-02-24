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
    struct ResultActionStringArray {
        bool success;
        string[] permissions;
    }
    struct ResultActionString {
        bool success;
        string encSymmetricKey;
    }

    UserHasFile[] private userHasFile;  // Not using map because solity doesn't accept structs in keys and a map of this would only make sense if userAccound and ipfsCID could simultaneously be considered keys
    FileRegister fileRegister;

    constructor(address fileRegisterContract) {
        fileRegister = FileRegister(fileRegisterContract);
    }

    // Adds a user to the list userHasFile
    function addUserHasFile (address userAccount, FileRegister.File memory file, string memory encSymmetricKey, string[] memory permissions) public {
        // TODO: Need to verify if the user exist. Need to verify if the file exist. (before adding them)
        // TODO: It's enough to receive the fileIPFS
        // TODO: Verifies if the one executing this function is the file owner or was someone to whom the file was shared with    
        // TODO: Verify if fields to be added are valid fields
        // TODO: Verify if the user is already associated with the file

        /*
        bool isUserAssociatedWithFile = userAssociatedWithFile(userAccount, file);
        if (isUserAssociatedWithFile) {
            return;
        }*/

        UserHasFile memory userFileData = UserHasFile({
            userAccount: userAccount,
            ipfsCID: file.ipfsCID,
            encSymmetricKey: encSymmetricKey,
            permissions: permissions
        });
        userHasFile.push(userFileData);
    }

    // Updates the permissions a user has over a file
    function updateUserFilePermissions(address userAccount, FileRegister.File memory file, string[] memory permissions) public {
        // Verify if the user is associated with the file
        // Verify if the one executing this method is associated with the file because it's owner or has permission of share over the file
        // It's enough to receive the file IPFS
        for (uint256 i=0; i<userHasFile.length; i++) {
            if (isKeyEqual(userAccount, userHasFile[i].userAccount, file.ipfsCID, userHasFile[i].ipfsCID)) {
                userHasFile[i].permissions = permissions;
                return;
            }
        }
    }

    // Returns the encrypted symmetric key of a given user and file 
    function getEncSymmetricKeyFileUser (UserRegister.User memory user, FileRegister.File memory file) public view returns (ResultActionString memory) {
        // TODO: It's enough to receive the user acount and the file IPFS
        // TODO: Verify if the user executing this method is the file owner or has access to the file
        for (uint256 i=0; i<userHasFile.length; i++) {
            if (isKeyEqual(user.account, userHasFile[i].userAccount, file.ipfsCID, userHasFile[i].ipfsCID)) {
                return ResultActionString(true, userHasFile[i].encSymmetricKey);
            }
        }
        return ResultActionString(false, "");
    }

    // Returns the permissions of a given user over a given file
    function getPermissionsOverFile (address userAccount, FileRegister.File memory file) public view returns (ResultActionStringArray memory) {
        // TODO: It's enough to receive the user acount and the file IPFS
        // TODO: Verify if the user executing this method is the file owner or has access to the file
        for (uint256 i=0; i<userHasFile.length; i++) {
            if (isKeyEqual(userAccount, userHasFile[i].userAccount, file.ipfsCID, userHasFile[i].ipfsCID)) {
                return ResultActionStringArray(true, userHasFile[i].permissions);
            }
        }
        return ResultActionStringArray(false, new string[](0));
    }

    // Returns the files of a giving user
    function getUserFiles(address account) public view returns (ResultAction memory) {
        // TODO: Verify if the user executing the method is the same as the account
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
    function userAssociatedWithFile(address userAccount, FileRegister.File memory file) public view returns (bool) {
        // TODO: Verify if the user executing the method is the same as the userAccount
        // TODO: It's enough to receive the fileIPFS
        for (uint256 i=0; i<userHasFile.length; i++) {
            if (isKeyEqual(userAccount, userHasFile[i].userAccount, file.ipfsCID, userHasFile[i].ipfsCID)) {
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