// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./UserRegister.sol";
import "./FileRegister.sol";
import "./AuditLogControl.sol";

contract Helper {
    
    struct ResultAddress {
        bool success;
        address resultAddress;
    }
    struct ResultString {
        bool success;
        string resultString;
    }
    struct ResultStringArray {
        bool success;
        string[] resultStrings;
    }

    // Verifies if the fields are valid 
    // The one seeing if the user has the right fields should be the same one executing the transaction
    function validUserFields(UserRegister.User memory user) public pure returns (bool) {
        if (user.account != address(0) && bytes(user.userName).length != 0 && bytes(user.publicKey).length != 0 && bytes(user.privateKey).length != 0) {
            return true;
        }
        return false;
    }

    // Verifies if the file has all parameters valid
    function fileParamValid(FileRegister.File memory file) public pure returns (bool) {
        if (bytes(file.ipfsCID).length != 0 && 
            bytes(file.fileName).length != 0 && 
            bytes(file.fileType).length != 0 && 
            bytes(file.iv).length != 0 && 
            file.owner != address(0)) {
            return true;
        }
        return false;
    } 

    // Verify if the fields of userFileData are valid
    function verifyValidFields (address userAccount, string memory fileIpfsCID, string memory encSymmetricKey, string[] memory permissions) public pure returns (bool) {
        if (userAccount != address(0) &&
            bytes(fileIpfsCID).length != 0 && 
            bytes(encSymmetricKey).length != 0 && 
            permissions.length != 0 ) {
            return true;
        }
        return false;
    }

    // Converts a string array into a string
    function stringArrayToString(string[] memory permissions) public pure returns (string memory) {
        string memory permissionsString;
        for (uint i = 0; i<permissions.length; i++) {
            permissionsString = string(abi.encodePacked(permissionsString, permissions[i]));
            if (i < permissions.length -1) {
                permissionsString = string(abi.encodePacked(permissionsString, ", "));
            }
        }
        return permissionsString;
    }

}