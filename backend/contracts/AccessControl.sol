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
    bool private fileRegisterInitialized; // Solidity initializes contract state variables to their default values, which for complex types like contract instances, is an empty or zero-intiialized state. So one common approach is to use a boolean flag.
    event FileActionLog(address indexed userAccount, string fileIpfsCID, string permissionsOwner, string action);

    constructor(address helperContract) {
        helper = Helper(helperContract);
        fileRegister = new FileRegister(helperContract);
        userRegister = new UserRegister(helperContract);
        auditLogControl = new AuditLogControl();
        fileRegisterInitialized = false;
    }

    // File Upload: only if the transaction executer is the same as the userAccount, 
    //              the transaction executer is the file owner
    //              the transaction executer is not already associate with the file 
    //              the file and the user exist
    //              fields are valid
    function uploadFile (address userAccount, FileRegister.File memory file, string memory encSymmetricKey) public {  
        if (elegibleToUpload(userAccount, file.ipfsCID)) {
            string[] memory permissionsOwner = new string[](4); // because the file owner has all permissions
            permissionsOwner[0] = "share";
            permissionsOwner[1] = "download";
            permissionsOwner[2] = "delete";
            permissionsOwner[3] = "edit";
            bool validFields = helper.verifyValidFields(userAccount, file.ipfsCID, encSymmetricKey, permissionsOwner, file.state); // Validates if the file and the user exist
            if (validFields){
                // Adds the file
                fileRegister.addFile(file);

                // Performs the association between the user and the file
                User_Has_File memory userFileData = User_Has_File({
                    userAccount: userAccount,
                    ipfsCID: file.ipfsCID,
                    encSymmetricKey: encSymmetricKey,
                    permissions: permissionsOwner
                });
                user_Has_File.push(userFileData);

                // Writes the audit log
                auditLogControl.recordLogFromAccessControl(msg.sender, file.ipfsCID, userAccount, helper.stringArrayToString(permissionsOwner), "upload");
            }
        }
    }  

    // Edit file if: the transaction executer as "Edit" permissions over a file
    //               the file exists in the active state
    // TODO: I need to see if it has valid fields
    // TODO: I have to make sure the user is not editing an old version of the file
    function editFile(FileRegister.File memory selectedFile, FileRegister.File memory newFile, string memory encSymmetricKey) public {
        if (elegibleToEdit(selectedFile.ipfsCID)) {
            // Adds the file
            fileRegister.editFile(selectedFile, newFile);
            // Performs the association between the users and this edited file
            for (uint256 i=0; i<user_Has_File.length; i++) {
                if (keccak256(abi.encodePacked(user_Has_File[i].ipfsCID)) == keccak256(abi.encodePacked(selectedFile.ipfsCID))) {
                    // Performs the association between the user and the file
                    User_Has_File memory userFileData = User_Has_File({
                        userAccount: user_Has_File[i].userAccount,
                        ipfsCID: newFile.ipfsCID,
                        encSymmetricKey: encSymmetricKey,
                        permissions: user_Has_File[i].permissions
                    });
                    user_Has_File.push(userFileData);
                }
            }
            // Writes the audit log
            auditLogControl.recordLogFromAccessControl(msg.sender, selectedFile.ipfsCID, msg.sender, "-", "edit");
        }
    }

    // File Share: only if the userAccount!=msg.sender (a user cannot change its own permissions), 
    //             userAccount is not the file owner (file owners' permissions cannot change)
    //             msg.sender has "share" permissions over the file
    //             userAccount is not already associated with the file
    //             file exists with "active" state
    //             user exists
    function shareFile (address userAccount, string memory fileIpfsCID, string memory encSymmetricKey, string[] memory permissions) public {
        if (elegibleToShare(userAccount, fileIpfsCID) &&
            keccak256(abi.encodePacked(fileRegister.getFileState(fileIpfsCID).resultString)) == keccak256(abi.encodePacked("active"))
        ) {
            bool validFields = helper.verifyValidFields(userAccount, fileIpfsCID, encSymmetricKey, permissions, "");
            if (validFields) {
                // Associates the given user with the file
                User_Has_File memory userFileData = User_Has_File({
                    userAccount: userAccount,
                    ipfsCID: fileIpfsCID,
                    encSymmetricKey: encSymmetricKey,
                    permissions: permissions
                });
                user_Has_File.push(userFileData);

                // Writes the audit log
                auditLogControl.recordLogFromAccessControl(msg.sender, fileIpfsCID, userAccount, helper.stringArrayToString(permissions), "share");
            }
        }
    } 

    // Updates the permissions a user has over a file if: 
    //              executer has to be different from the user account - userAccount should not be able to give permissions to himself
    //              userAccound cannot be the file owner account: the file owner permissions cannot change - should always be all permissions
    //              the transaction executer has to have share permissions over the file
    //              the file is in the active state
    function updateUserFilePermissions(address userAccount, string memory fileIpfsCID, string[] memory permissions) public {
        if (elegibleToUpdPermissions(userAccount, fileIpfsCID)) {
            for (uint256 i=0; i<user_Has_File.length; i++) {
                if (isKeyEqual(userAccount, user_Has_File[i].userAccount, fileIpfsCID, user_Has_File[i].ipfsCID)) {
                    // Updates the users' permissions
                    user_Has_File[i].permissions = permissions;

                    // Writes the audit log
                    auditLogControl.recordLogFromAccessControl(msg.sender, fileIpfsCID, userAccount, helper.stringArrayToString(permissions), "update permissions");
                    return;
                }
            }
        }
    }

    // Downloads the file, if: the transaction executer is the same as the user
    //                         the user has download permissions over the file
    //                         the file is active
    function downloadFileAudit(string memory fileIpfsCid, address userAccount) public {
        if (msg.sender == userAccount &&
            userHasPermissionOverFile(userAccount, fileIpfsCid, "download") &&
            keccak256(abi.encodePacked(fileRegister.getFileState(fileIpfsCid).resultString)) == keccak256(abi.encodePacked("active"))
        ) {
            // No precessing is done (as it happens with updateUserFilePermissions or shareFile or updateFile)

            // Writes to the Audit Log
            auditLogControl.recordLogFromAccessControl(msg.sender, fileIpfsCid, userAccount, "-", "download");
        }
    }

    // Deletes a file if: the transaction executer as "Delete" permissions over the file
    //                    the file exists in the active state
    function deactivateFile(address userAccount, string memory fileIpfsCid) public {
        if( userHasPermissionOverFile(msg.sender, fileIpfsCid, "delete") && 
           keccak256(abi.encodePacked(fileRegister.getFileState(fileIpfsCid).resultString)) == keccak256(abi.encodePacked("active"))
        ) {
            fileRegister.deactivateFile(fileIpfsCid);

            // Writes to the Audit Log
            auditLogControl.recordLogFromAccessControl(msg.sender, fileIpfsCid, userAccount, "-", "deleted");
        }
    }

    // Remove the relationship between a user and a file
    function removeUserFileAssociation(address userAccount, string memory fileIpfsCID) public {
        for (uint i=0; i<user_Has_File.length; i++) {
            if (user_Has_File[i].userAccount == userAccount && 
                keccak256(bytes(user_Has_File[i].ipfsCID)) == keccak256(bytes(fileIpfsCID))) {
                // Remove the entry by swapping it with the last element and then reducing the array length
                user_Has_File[i] = user_Has_File[user_Has_File.length - 1];
                user_Has_File.pop();

                // Writes to the Audit Log
                auditLogControl.recordLogFromAccessControl(msg.sender, fileIpfsCID, userAccount, "-", "removed access");
                return;
            }
        }
    }

    // Returns the encrypted symmetric key of a given user and file
    // The user can only get the symmetric key if: he is associated with the file 
    //                                             the transaction executer is the same as the account user
    //                                             the file is in the active state
    function getEncSymmetricKeyFileUser (address accountUser, string memory fileIpfsCID) public view returns (Helper.ResultString memory) {
        if ((msg.sender == accountUser) && 
             userAssociatedWithFile(accountUser, fileIpfsCID) &&
             (keccak256(abi.encodePacked(fileRegister.getFileState(fileIpfsCID).resultString)) == keccak256(abi.encodePacked("active")) ||
              keccak256(abi.encodePacked(fileRegister.getFileState(fileIpfsCID).resultString)) == keccak256(abi.encodePacked("edited")) 
             )) {
            for (uint256 i=0; i<user_Has_File.length; i++) {
                if (isKeyEqual(accountUser, user_Has_File[i].userAccount, fileIpfsCID, user_Has_File[i].ipfsCID)) {
                    return Helper.ResultString(true, user_Has_File[i].encSymmetricKey);
                }
            }
        } 
        return Helper.ResultString(false, "");
    }

    // Returns the permissions of a given user over a given file if: mesg.sender is associated with the file
    //                                                               the file is in the active state
    function getPermissionsOverFile (address userAccount, string memory fileIpfsCID) public view returns (Helper.ResultStringArray memory) {
        if (messageSenderAssociatedToFile(fileIpfsCID) &&
            keccak256(abi.encodePacked(fileRegister.getFileState(fileIpfsCID).resultString)) ==  keccak256(abi.encodePacked("active"))
        ) { // msg.sender has to be associated with the file
            for (uint256 i=0; i<user_Has_File.length; i++) {
                if (isKeyEqual(userAccount, user_Has_File[i].userAccount, fileIpfsCID, user_Has_File[i].ipfsCID)) {
                    return Helper.ResultStringArray(true, user_Has_File[i].permissions);
                }
            }
        }
        return Helper.ResultStringArray(false, new string[](0));
    }

    // Returns the files of a giving user in a certain state, independently of the version
    function getUserFiles(address account, string memory state) public view returns (FileRegister.ResultFiles memory) {
        if (msg.sender == account) { // Users cannot not see files of other users
            FileRegister.File[] memory userFilesResult = new FileRegister.File[](user_Has_File.length); // Stores the users' files
            uint resultIndex = 0;
            for (uint i=0; i<user_Has_File.length; i++) {
                if (user_Has_File[i].userAccount == account &&
                    (keccak256(abi.encodePacked(state)) == keccak256(abi.encodePacked(fileRegister.getFileState(user_Has_File[i].ipfsCID).resultString)) || keccak256(abi.encodePacked(state)) == keccak256(abi.encodePacked(""))) // when "" => all files
                ){
                    string memory fileIpfsCIDUser = user_Has_File[i].ipfsCID;
                    FileRegister.ResultFile memory result = fileRegister.getFileByIpfsCID(fileIpfsCIDUser, state); // Gets the file having the IPFS CID
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

    // Returns if a user has a certain permission over a file if the file is in the active state
    function userHasPermissionOverFile(address userAccount, string memory fileIpfsCID, string memory permission) public view returns (bool) {
        if (true/*keccak256(abi.encodePacked(getFileState(fileIpfsCID).resultString)) == keccak256(abi.encodePacked("active"))*/) {
            string[] memory userPermissions = getPermissionsOverFile(userAccount, fileIpfsCID).resultStrings;
            for (uint256 i=0; i<userPermissions.length; i++) {
                if (keccak256(abi.encodePacked(userPermissions[i])) == keccak256(abi.encodePacked(permission))) {
                    return true; // Return true if permission is found
                }
            }
        }
        return false;
    }

    // Sees if a user is already associated with a file if: the message sender is associated with the file
    //                                                      or the message sender is the auditLogControl
    function userAssociatedWithFile(address userAccount, string memory fileIpfsCID) public view returns (bool) {
        if ((messageSenderAssociatedToFile(fileIpfsCID) ||
            msg.sender == address(auditLogControl) // AuditLogControl also calls this method for the validation of one of his methods    
            )
        ) {
            for (uint256 i=0; i<user_Has_File.length; i++) {
                if (isKeyEqual(userAccount, user_Has_File[i].userAccount, fileIpfsCID, user_Has_File[i].ipfsCID)) {
                    return true;
                }
            }
        }
        return false;
    }

    // See if a user is already associated with a file with the given name: the file needs to be in the state active
    //                                                                      no matter the file version
    function userAssociatedWithFileName(address userAccount, string memory fileName) public view returns (bool) {
        // Gets CIDs of files with the given name no matter the version and in the state active
        string[] memory filesIpfsCID = fileRegister.getIpfsCIDsForName(fileName); 
        
        // Sees if the user is associated to any of those files
        for (uint256 i = 0; i < user_Has_File.length; i++) {
            for (uint256 j = 0; j < filesIpfsCID.length; j++) {
                if (user_Has_File[i].userAccount == userAccount && keccak256(abi.encodePacked(user_Has_File[i].ipfsCID)) == keccak256(abi.encodePacked(filesIpfsCID[j]))) {
                    return true;
                }
            }
        }
        return false;
    }

    // Sees if the message sender is associated with a certain file in the active state
    function messageSenderAssociatedToFile(string memory fileIpfsCID) public view returns (bool) {
        for (uint256 i=0; i<user_Has_File.length; i++) {
            if (isKeyEqual(msg.sender, user_Has_File[i].userAccount, fileIpfsCID, user_Has_File[i].ipfsCID) &&
                ( keccak256(abi.encodePacked(fileRegister.getFileState(fileIpfsCID).resultString)) ==  keccak256(abi.encodePacked("active")) ||
                  keccak256(abi.encodePacked(fileRegister.getFileState(fileIpfsCID).resultString)) ==  keccak256(abi.encodePacked("edited")) 
                )
            ) {
                return true;
            }
        }
        return false;
    }

    // Verifies if the user is elegible to share the file
    function elegibleToShare(address userAccount, string memory fileIpfsCID) public view returns (bool) {
        if (msg.sender != userAccount && // msg.sender can't be the same as the userAccount because the user should not be able to give permissions to himself
            !fileRegister.userIsFileOwner(userAccount, fileIpfsCID) && // the userAccount cannot be the file owner account: the owner permissions cannot change they are always: share, delete, upload
            userHasPermissionOverFile(msg.sender, fileIpfsCID, "share") && // The transaction executer can only share a file if he has share permissions 
            !userAssociatedWithFile(userAccount, fileIpfsCID) && // The user cannot be already be associated with the file, in order to not have duplicated records
            fileRegister.fileExists(fileIpfsCID) &&        // verifies if the file exist
            keccak256(abi.encodePacked(fileRegister.getFileState(fileIpfsCID).resultString)) == keccak256(abi.encodePacked("active")) &&
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
            userHasPermissionOverFile(msg.sender, fileIpfsCID, "share") && // The transaction executer can only share a file if he has share permissions 
            keccak256(abi.encodePacked(fileRegister.getFileState(fileIpfsCID).resultString)) == keccak256(abi.encodePacked("active"))
        ) {
            return true;
        }
        return false;
    }
    
    // Verifies if the transaction executer is elegible to upload the file
    function elegibleToUpload (address userAccount, string memory fileIpfsCID) public view returns (bool) {
        if (msg.sender == userAccount && // if different it means the transaction is executer is trying to upload a file in the name of another user
            !userAssociatedWithFile(userAccount, fileIpfsCID) &&// if already associated then it should be called the share file()
            userRegister.existingAddress(userAccount)   // verifies if the user exist
            ) {
            return true;
        }
        return false;
    }

    // Verifies if the user is elegible to edit the file: if the user has edit permissions over the file
    //                                                    if the file is in the state active
    function elegibleToEdit(string memory fileIpfsCID) public view returns (bool) {
        if (userHasPermissionOverFile(msg.sender, fileIpfsCID, "edit") &&
            keccak256(abi.encodePacked(fileRegister.getFileState(fileIpfsCID).resultString)) == keccak256(abi.encodePacked("active"))
        ) {
            return true;
        }
        return false;
    }

    // Verifies if a file is valid or not. 
    // A file is valid if: the user has a file (is associated with a file)
    //                     in the active state 
    //                     with the same file hash
    function verifyValidFile (address userAccount, string memory fileHash) public view returns (bool) {
        // Look for a file, that belongs to the user and has the same fileHash, and is in the active state
        for (uint256 i=0; i<user_Has_File.length; i++) {
            string memory fileHashFile = fileRegister.getFileHash(user_Has_File[i].ipfsCID).resultString;
            string memory stateFile = fileRegister.getFileState(user_Has_File[i].ipfsCID).resultString;
            if ( user_Has_File[i].userAccount == userAccount &&
                (keccak256(abi.encodePacked(fileHashFile)) == keccak256(abi.encodePacked(fileHash))) &&
                (keccak256(abi.encodePacked(stateFile)) == keccak256(abi.encodePacked("active")))
            ){
                return true;
            }
        }
        return false;
    }

    // Sees if the ipfsCID and the account (primary keys) are the same as the inputs 
    function isKeyEqual(address accountInput, address accountList, string memory ipfsCIDInput, string memory ipfsCIDList) public pure returns (bool){
        return (accountList == accountInput) && (keccak256(abi.encodePacked(ipfsCIDList)) == keccak256(abi.encodePacked(ipfsCIDInput)));
    }

    // Getter function for auditLogControl address
    function getAuditLogControlAddress() public  view returns (address) {
        return address(auditLogControl);
    }

    // Getter function for fileRegister address
    function getFileRegisterAddress() public  view returns (address) {
        return address(fileRegister);
    }

    // Getter function for userRegister address
    function getUserRegisterAddress() public  view returns (address) {
        return address(userRegister);
    }
}