// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./UserRegister.sol";
import "./FileRegister.sol";
import "./AuditLogControl.sol";
import "./Helper.sol";

contract AccessControl {

    struct User_Has_File {
        address userAccount;       // User account
        string ipfsCID;            // ipfsCID 
        string encSymmetricKey;    // Key used for the file encryption
        string[] permissions;      // It can be: delete, update, share
    }

    User_Has_File[] private user_Has_File;  // Not using map because solity doesn't accept structs in keys and a map of this would only make sense if userAccound and ipfsCID could simultaneously be considered keys
    FileRegister fileRegister;
    UserRegister userRegister;
    AuditLogControl auditLogControl;
    Helper helper;
    event FileActionLog(address indexed userAccount, string fileIpfsCID, string permissionsOwner, string action);

    constructor(address fileRegisterContract, address userRegisterContract, address helperContract) {
        fileRegister = FileRegister(fileRegisterContract);
        userRegister = UserRegister(userRegisterContract);
        helper = Helper(helperContract);
        auditLogControl = new AuditLogControl();
    }

    // File Upload: only if the transaction executer is the same as the userAccount, 
    //              the transaction executer is the file owner
    //              the transaction executer is not already associate with the file 
    //              the file and the user exist
    //              fields are valid
    function uploadFile (address userAccount, string memory fileIpfsCID, string memory encSymmetricKey) public {  
        if (elegibleToUpload(userAccount, fileIpfsCID)) {
            string[] memory permissionsOwner = new string[](3); // because the file owner has all permissions
            permissionsOwner[0] = "share";
            permissionsOwner[1] = "download";
            permissionsOwner[2] = "delete";
            bool validFields = helper.verifyValidFields(userAccount, fileIpfsCID, encSymmetricKey, permissionsOwner); // Validates if the file and the user exist
            if (validFields){
                User_Has_File memory userFileData = User_Has_File({
                    userAccount: userAccount,
                    ipfsCID: fileIpfsCID,
                    encSymmetricKey: encSymmetricKey,
                    permissions: permissionsOwner 
                });
                user_Has_File.push(userFileData);
                auditLogControl.recordLogFromAccessControl(msg.sender, fileIpfsCID, userAccount, helper.stringArrayToString(permissionsOwner), "upload");
            }
        }
    }  

    // File Share: only if the userAccount!=msg.sender (a user cannot change its own permissions), 
    //             userAccount is not the file owner (file owners' permissions cannot change)
    //             msg.sender has "share" permissions over the file
    //             userAccount is not already associated with the file
    //             file exists
    //             user exists
    function shareFile (address userAccount, string memory fileIpfsCID, string memory encSymmetricKey, string[] memory permissions) public {
        if (elegibleToShare(userAccount, fileIpfsCID)) {
            bool validFields = helper.verifyValidFields(userAccount, fileIpfsCID, encSymmetricKey, permissions);
            if (validFields) {
                User_Has_File memory userFileData = User_Has_File({
                    userAccount: userAccount,
                    ipfsCID: fileIpfsCID,
                    encSymmetricKey: encSymmetricKey,
                    permissions: permissions 
                });
                user_Has_File.push(userFileData);
                auditLogControl.recordLogFromAccessControl(msg.sender, fileIpfsCID, userAccount, helper.stringArrayToString(permissions), "share");
            }
        }
    } 

    // Updates the permissions a user has over a file if: 
    //              executer has to be different from the user account - userAccount should not be able to give permissions to himself
    //              userAccound cannot be the file owner account: the file owner permissions cannot change - should always be all permissions
    //              the transaction executer has to have share permissions over the file
    function updateUserFilePermissions(address userAccount, string memory fileIpfsCID, string[] memory permissions) public {
        if (elegibleToUpdPermissions(userAccount, fileIpfsCID)) {
            for (uint256 i=0; i<user_Has_File.length; i++) {
                if (isKeyEqual(userAccount, user_Has_File[i].userAccount, fileIpfsCID, user_Has_File[i].ipfsCID)) {
                    user_Has_File[i].permissions = permissions;
                    auditLogControl.recordLogFromAccessControl(msg.sender, fileIpfsCID, userAccount, helper.stringArrayToString(permissions), "update permissions");
                    return;
                }
            }
        }
    }

    // Downloads the file, if: the transaction executer is the same as the user
    //                         the user has download permissions over the file
    function downloadFileAudit(string memory fileIpfsCid, address userAccount) public {
        if (msg.sender == userAccount &&
            userHasDownloadPermissionOverFile(userAccount, fileIpfsCid)
        ) {
            // No precessing is done (as it happens with updateUserFilePermissions or shareFile or updateFile)
            auditLogControl.recordLogFromAccessControl(msg.sender, fileIpfsCid, userAccount, "-", "download");
        }
    }

    // Returns the encrypted symmetric key of a given user and file
    // The user can only get the symmetric key if he is associated with the file and if the transaction executer is the same as the account user
    function getEncSymmetricKeyFileUser (address accountUser, string memory fileIpfsCID) public view returns (Helper.ResultString memory) {
        if ((msg.sender == accountUser) && userAssociatedWithFile(accountUser, fileIpfsCID)) {
            for (uint256 i=0; i<user_Has_File.length; i++) {
                if (isKeyEqual(accountUser, user_Has_File[i].userAccount, fileIpfsCID, user_Has_File[i].ipfsCID)) {
                    return Helper.ResultString(true, user_Has_File[i].encSymmetricKey);
                }
            }
        } 
        return Helper.ResultString(false, "");
    }

    // Returns the permissions of a given user over a given file
    function getPermissionsOverFile (address userAccount, string memory fileIpfsCID) public view returns (Helper.ResultStringArray memory) {
        if (messageSenderAssociatedToFile(fileIpfsCID)) { // msg.sender has to be associated with the file
            for (uint256 i=0; i<user_Has_File.length; i++) {
                if (isKeyEqual(userAccount, user_Has_File[i].userAccount, fileIpfsCID, user_Has_File[i].ipfsCID)) {
                    return Helper.ResultStringArray(true, user_Has_File[i].permissions);
                }
            }
        }
        return Helper.ResultStringArray(false, new string[](0));
    }

    // Returns the files of a giving user
    function getUserFiles(address account) public view returns (FileRegister.ResultFiles memory) {
        if (msg.sender == account) { // Users cannot not see files of other users
            FileRegister.File[] memory userFilesResult = new FileRegister.File[](user_Has_File.length); // Stores the users' files
            uint resultIndex = 0;
            for (uint i=0; i<user_Has_File.length; i++) {
                if (user_Has_File[i].userAccount == account) { // Looks for the files the user is associated with 
                    string memory fileIpfsCIDUser = user_Has_File[i].ipfsCID;
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

    // Returns if a user has download Permissions
    function userHasDownloadPermissionOverFile(address userAccount, string memory fileIpfsCID) public view returns (bool) {
        string[] memory userPermissions = getPermissionsOverFile(userAccount, fileIpfsCID).resultStrings;
        for (uint256 i=0; i<userPermissions.length; i++) {
            if (keccak256(abi.encodePacked(userPermissions[i])) == keccak256(abi.encodePacked("download"))) {
                return true; // Return true if "download" permission is found
            }
        }
        return false;
    }

    // Sees if a user is already associated with a file
    function userAssociatedWithFile(address userAccount, string memory fileIpfsCID) public view returns (bool) {
        if (messageSenderAssociatedToFile(fileIpfsCID) ||
            msg.sender == address(auditLogControl) // AuditLogControl also calls this method for the validation of one of his methods
        ) {
            for (uint256 i=0; i<user_Has_File.length; i++) {
                if (isKeyEqual(userAccount, user_Has_File[i].userAccount, fileIpfsCID, user_Has_File[i].ipfsCID)) {
                    return true;
                }
            }
        }
        return false;
    }

    // Sees if the message sender is associated with a certain file
    function messageSenderAssociatedToFile(string memory fileIpfsCID) public view returns (bool) {
        for (uint256 i=0; i<user_Has_File.length; i++) {
            if (isKeyEqual(msg.sender, user_Has_File[i].userAccount, fileIpfsCID, user_Has_File[i].ipfsCID)) {
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

    // Getter function for auditLogControl address
    function getAuditLogControlAddress() public view returns (address) {
        return address(auditLogControl);
    }

}