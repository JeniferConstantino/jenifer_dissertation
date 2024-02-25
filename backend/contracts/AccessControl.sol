// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./UserRegister.sol";
import "./FileRegister.sol";
import "./Helper.sol";

contract AccessControl {

    struct UserHasFile {
        address userAccount;       // User account
        string ipfsCID;            // ipfsCID 
        string encSymmetricKey;    // Key used for the file encryption
        string[] permissions;      // It can be: delete, update, share
    }

    UserHasFile[] private userHasFile;  // Not using map because solity doesn't accept structs in keys and a map of this would only make sense if userAccound and ipfsCID could simultaneously be considered keys
    FileRegister fileRegister;
    UserRegister userRegister;
    Helper helper;

    constructor(address fileRegisterContract, address userRegisterContract, address helperContract) {
        fileRegister = FileRegister(fileRegisterContract);
        userRegister = UserRegister(userRegisterContract);
        helper = Helper(helperContract);
    }

    // File Upload: only if the transaction executer is the same as the userAccount, 
    //              the transaction executer is the file owner
    //              the transaction executer is not already associate with the file 
    function uploadFile (address userAccount, string memory fileIpfsCID, string memory encSymmetricKey) public {  
        // Verifies if the user is elegible to upload the file
        if (elegibleToUpload(userAccount, fileIpfsCID)) {
            string[] memory permissionsOwner = new string[](3); // because the file owner has all permissions
            permissionsOwner[0] = "share";
            permissionsOwner[1] = "download";
            permissionsOwner[2] = "delete";
            bool validFields = helper.verifyValidFields(userAccount, fileIpfsCID, encSymmetricKey, permissionsOwner); // Validates if the file and the user exist
            if (validFields){
                UserHasFile memory userFileData = UserHasFile({
                    userAccount: userAccount,
                    ipfsCID: fileIpfsCID,
                    encSymmetricKey: encSymmetricKey,
                    permissions: permissionsOwner 
                });
                userHasFile.push(userFileData);
            }
        }
    }  

    // File Share: only if the userAccount!=msg.sender (a user cannot change its own permissions), 
    //             userAccount is not the file owner (file owners' permissions cannot change)
    //             msg.sender has "share" permissions over the file
    //             userAccount is not already associated with the file
    function shareFile (address userAccount, string memory fileIpfsCID, string memory encSymmetricKey, string[] memory permissions) public {
        if (elegibleToShare(userAccount, fileIpfsCID)) {
            bool validFields = helper.verifyValidFields(userAccount, fileIpfsCID, encSymmetricKey, permissions);
            if (validFields) {
                UserHasFile memory userFileData = UserHasFile({
                    userAccount: userAccount,
                    ipfsCID: fileIpfsCID,
                    encSymmetricKey: encSymmetricKey,
                    permissions: permissions 
                });
                userHasFile.push(userFileData);
            }
        }
    } 

    // Updates the permissions a user has over a file if: 
    //              executer has to be different from the user account - userAccount should not be able to give permissions to himself
    //              userAccound cannot be the file owner account: the file owner permissions cannot change - should always be all permissions
    //              the transaction executer has to have share permissions over the file
    function updateUserFilePermissions(address userAccount, string memory fileIpfsCID, string[] memory permissions) public {
        if (elegibleToUpdPermissions(userAccount, fileIpfsCID)) {
            for (uint256 i=0; i<userHasFile.length; i++) {
                if (isKeyEqual(userAccount, userHasFile[i].userAccount, fileIpfsCID, userHasFile[i].ipfsCID)) {
                    userHasFile[i].permissions = permissions;
                    return;
                }
            }
        }
    }

    // Returns the encrypted symmetric key of a given user and file
    // The user can only get the symmetric key if he is associated with the file and if the transaction executer is the same as the account user
    function getEncSymmetricKeyFileUser (address accountUser, string memory fileIpfsCID) public view returns (Helper.ResultString memory) {
        if ((msg.sender == accountUser) && userAssociatedWithFile(accountUser, fileIpfsCID)) {
            for (uint256 i=0; i<userHasFile.length; i++) {
                if (isKeyEqual(accountUser, userHasFile[i].userAccount, fileIpfsCID, userHasFile[i].ipfsCID)) {
                    return Helper.ResultString(true, userHasFile[i].encSymmetricKey);
                }
            }
        } 
        return Helper.ResultString(false, "");
    }

    // Returns the permissions of a given user over a given file
    function getPermissionsOverFile (address userAccount, string memory fileIpfsCID) public view returns (Helper.ResultStringArray memory) {
        if (messageSenderAssociatedToFile(fileIpfsCID)) { // msg.sender has to be associated with the file
            for (uint256 i=0; i<userHasFile.length; i++) {
                if (isKeyEqual(userAccount, userHasFile[i].userAccount, fileIpfsCID, userHasFile[i].ipfsCID)) {
                    return Helper.ResultStringArray(true, userHasFile[i].permissions);
                }
            }
        }
        return Helper.ResultStringArray(false, new string[](0));
    }

    // Returns the files of a giving user
    function getUserFiles(address account) public view returns (FileRegister.ResultFiles memory) {
        if (msg.sender == account) { // Users cannot not see files of other users
            FileRegister.File[] memory userFilesResult = new FileRegister.File[](userHasFile.length); // Stores the users' files
            uint resultIndex = 0;
            for (uint i=0; i<userHasFile.length; i++) {
                if (userHasFile[i].userAccount == account) { // Looks for the files the user is associated with 
                    string memory fileIpfsCIDUser = userHasFile[i].ipfsCID;
                    FileRegister.ResultFile memory result = fileRegister.getFileByIpfsCID(fileIpfsCIDUser); // Gets the file having the IPFS CID
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
                return FileRegister.ResultFiles(true, userFilesResult);
            } 
        }
        return FileRegister.ResultFiles(false, new FileRegister.File[](0));
    }

    // Returns if a user has share Permissions 
    function userHasSharePermissionOverFile(address userAccount, string memory fileIpfsCID) public view returns (bool) {
        string[] memory userPermissions = getPermissionsOverFile(userAccount, fileIpfsCID).resultStrings;
        for (uint256 i=0; i<userPermissions.length; i++) {
            if (keccak256(abi.encodePacked(userPermissions[i])) == keccak256(abi.encodePacked("share"))) {
                return true; // Return true if "share" permission is found
            }
        }
        return false;
    }

    // Sees if a user is already associated with a file
    function userAssociatedWithFile(address userAccount, string memory fileIpfsCID) public view returns (bool) {
        if (messageSenderAssociatedToFile(fileIpfsCID)) {
            for (uint256 i=0; i<userHasFile.length; i++) {
                if (isKeyEqual(userAccount, userHasFile[i].userAccount, fileIpfsCID, userHasFile[i].ipfsCID)) {
                    return true;
                }
            }
        }
        return false;
    }

    // Sees if the message sender is associated with a certain file
    function messageSenderAssociatedToFile(string memory fileIpfsCID) public view returns (bool) {
        for (uint256 i=0; i<userHasFile.length; i++) {
            if (isKeyEqual(msg.sender, userHasFile[i].userAccount, fileIpfsCID, userHasFile[i].ipfsCID)) {
                return true;
            }
        }
        return false;
    }

    // Verifies if the user is elegible to share the file
    function elegibleToShare(address userAccount, string memory fileIpfsCID) public view returns (bool) {
        if (msg.sender != userAccount && // msg.sender can't be the same as the userAccount because the user should not be able to give permissions to himself
            !fileRegister.userIsFileOwner(userAccount, fileIpfsCID) && // the userAccount cannot be the file owner account: the owner permissions cannot change they are always: share, delete, upload
            userHasSharePermissionOverFile(msg.sender, fileIpfsCID) && // The transaction executer can only share a file if he has share permissions 
            !userAssociatedWithFile(userAccount, fileIpfsCID) && // The user cannot be already be associated with the file, in order to not have duplicated records
            fileRegister.fileExists(fileIpfsCID) &&        // verifies if the file exist
            userRegister.existingAddress(userAccount)   // verifies if the user exist
        ) {
            return true;
        }
        return false;
    }

    // Retruns if a user is elegible to update permissions of a user over a file
    function elegibleToUpdPermissions(address userAccount, string memory fileIpfsCID) public view returns (bool) {
        if (msg.sender != userAccount && // msg.sender can't be the same as the userAccount because the user should not be able to give permissions to himself
            !fileRegister.userIsFileOwner(userAccount, fileIpfsCID) && // the userAccount cannot be the file owner account: the owner permissions cannot change they are always: share, delete, upload
            userHasSharePermissionOverFile(msg.sender, fileIpfsCID) // The transaction executer can only share a file if he has share permissions 
        ) {
            return true;
        }
        return false;
    }
    
    // Verifies if the transaction executer is elegible to upload the file
    function elegibleToUpload (address userAccount, string memory fileIpfsCID) public view returns (bool) {
        if (msg.sender == userAccount && // if different it means the transaction is executer is trying to upload a file in the name of another user
            !userAssociatedWithFile(userAccount, fileIpfsCID) &&// if already associated then it should be called the share file()
            fileRegister.userIsFileOwner(userAccount, fileIpfsCID) && // who uploads the file has to be the file owner
            fileRegister.fileExists(fileIpfsCID) &&        // verifies if the file exist
            userRegister.existingAddress(userAccount)   // verifies if the user exist
            ) {
            return true;
        }
        return false;
    }

    // Sees if the ipfsCID and the account (primary keys) are the same as the inputs 
    function isKeyEqual(address accountInput, address accountList, string memory ipfsCIDInput, string memory ipfsCIDList) public pure returns (bool){
        return (accountList == accountInput) && (keccak256(abi.encodePacked(ipfsCIDList)) == keccak256(abi.encodePacked(ipfsCIDInput)));
    }
}