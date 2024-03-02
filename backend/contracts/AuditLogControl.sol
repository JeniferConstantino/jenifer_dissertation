// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./AccessControl.sol";

contract AuditLogControl {

    struct ResultAuditLogs {
        bool success;
        AuditLog[] logs;
    }
    
    struct AuditLog {
        string fileIpfsCid;          // foreign key
        address userAccount;         // foreign key
        uint256 timestamp;           // primary key
        string action;
        string permissions;
        address executer;            // stores who performed the log registration => avoids people writing: "User A uploaded file B" when it wasn't user A
    }

    AuditLog[] private logs;  // Not using map because solity doesn't accept structs in keys and a map of this would only make sense if userAccound, ipfsCID, and timestamp could simultaneously be considered keys

    AccessControl accessControl;
    address accessControlContractAddress;

    constructor() {
        accessControl = AccessControl(msg.sender);
        accessControlContractAddress = msg.sender;
    }

    // Records executions performed by the AccessControl.sol contract. Be it: upload, share, delete, or update permissions
    function recordLogFromAccessControl(address executer, string memory fileIpfsCid, address userAccount, string memory permissions, string memory action) public {
        if (msg.sender == accessControlContractAddress) {
            AuditLog memory auditLog = AuditLog({
                fileIpfsCid: fileIpfsCid,
                userAccount: userAccount,
                timestamp: block.timestamp,
                action: action,
                permissions: permissions,
                executer: executer
            });
            logs.push(auditLog);
        }
    }

    // Returns the logs of a given set of files only if: transaction executer is associated with the file         
    function getLogs(string[] memory filesIpfsCid) public view returns (ResultAuditLogs memory){ 
        AuditLog[] memory auditLogFile = new AuditLog[](logs.length); // Stores the logs of the files
        uint resultIndex = 0;
        for (uint256 i = 0; i < filesIpfsCid.length; i++) {
            if (accessControl.userAssociatedWithFile(msg.sender, filesIpfsCid[i])) {
                for (uint j=0; j<logs.length; j++) {
                    if (keccak256(abi.encodePacked(logs[j].fileIpfsCid)) == keccak256(abi.encodePacked(filesIpfsCid[i]))) {
                        auditLogFile[resultIndex] = logs[j];
                        resultIndex++;
                    }
                }
            }
        }

        // Resize the result array to remove unused elements
        assembly {
            mstore(auditLogFile, resultIndex)
        }
        // Returns accordingly
        if (resultIndex != 0) {
            return ResultAuditLogs(true, auditLogFile);
        }
        return ResultAuditLogs(false, new AuditLog[](0));
    }

}
