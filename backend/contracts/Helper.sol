// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./UserRegister.sol";
import "./FileRegister.sol";
import "./AuditLogControl.sol";

contract Helper {
    
    struct ResultAddress {
        bool success;
        address resultAddress;
        string message;
    }
    struct ResultString {
        bool success;
        string resultString;
        string message;
    }
    struct ResultInt {
        bool success;
        int resultInt;
        string message;
    }
    struct ResultStringArray {
        bool success;
        string[] resultStrings;
        string message;
    }
    struct ResultAddressArray {
        bool success;
        address[] resultAddresses;
        string message;
    }

    // Verifies if the fields are valid 
    function validUserFields(UserRegister.User memory user) external pure returns (bool) {
        if (user.account != address(0) &&
        user.account == address(uint160(user.account)) &&
        bytes(user.userName).length != 0) {
            return true;
        }
        return false;
    }

    // Verifies if the file has all parameters valid
    function fileParamValid(FileRegister.File memory file) external pure returns (bool) {
        if (bytes(file.ipfsCID).length != 0 && 
            bytes(file.fileName).length != 0 && 
            bytes(file.fileType).length != 0 && 
            bytes(file.iv).length != 0 && 
            file.owner != address(0) &&
            file.owner == address(uint160(file.owner))
            ) {
            return true;
        }
        return false;
    } 

    // Verify if the fields of userFileData are valid
    function verifyValidFields (address userAccount, string memory fileIpfsCID, string memory encSymmetricKey, string[] memory permissions, string memory state) external pure returns (bool) {
        if (userAccount != address(0) &&
            userAccount == address(uint160(userAccount)) &&
            bytes(fileIpfsCID).length != 0 && 
            bytes(encSymmetricKey).length != 0 && 
            permissions.length != 0 &&
            bytes(state).length == 0
            ) {
            return true;
        }
        return false;
    }

    // Converts a string array into a string
    function stringArrayToString(string[] memory permissions) external pure returns (ResultString memory) {
        string memory permissionsString;
        for (uint i = 0; i<permissions.length; i++) {
            permissionsString = string(abi.encodePacked(permissionsString, permissions[i]));
            if (i < permissions.length -1) {
                permissionsString = string(abi.encodePacked(permissionsString, ", "));
            }
        }
        return ResultString(true, permissionsString, "");
    }

    // Validates if a given set of permissions are valid
    function validPermissions(string[] memory permissions) external pure returns (bool) {
        for (uint i = 0; i<permissions.length; i++) {
            if (keccak256(abi.encodePacked(permissions[i])) != keccak256(abi.encodePacked("download")) && 
            keccak256(abi.encodePacked(permissions[i]))!=keccak256(abi.encodePacked("edit")) &&
            keccak256(abi.encodePacked(permissions[i]))!=keccak256(abi.encodePacked("delete")) &&
            keccak256(abi.encodePacked(permissions[i]))!=keccak256(abi.encodePacked("share")) &&
            keccak256(abi.encodePacked(permissions[i]))!=keccak256(abi.encodePacked("verify")) &&
            keccak256(abi.encodePacked(permissions[i]))!=keccak256(abi.encodePacked("info"))
            ){
                return false;
            }
        }
        return true;
    }

    // Sees if the ipfsCID and the account (primary keys) are the same as the inputs 
    function isKeyEqual(address accountInput, address accountList, string memory ipfsCIDInput, string memory ipfsCIDList) external pure returns (bool){
        return (accountList == accountInput) && (keccak256(abi.encodePacked(ipfsCIDList)) == keccak256(abi.encodePacked(ipfsCIDInput)));
    }

    // Puts a string in lower case
    function toLower(string memory _str) external pure returns (string memory) {
        bytes memory strBytes = bytes(_str);
        for (uint i = 0; i < strBytes.length; i++) {
            if ((uint8(strBytes[i]) >= 65) && (uint8(strBytes[i]) <= 90)) {
                strBytes[i] = bytes1(uint8(strBytes[i]) + 32); // Convert uppercase to lowercase
            }
        }
        return string(strBytes);
    }

}