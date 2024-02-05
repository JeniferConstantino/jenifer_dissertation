// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../structs/FileStruct.sol";
import "../structs/UserStruct.sol";


contract StoreFile {

  event UploadFileResult(bool success, string message);
  File[] private userFiles;

  // Upload of a new file
  function uploadFile(File memory file, User memory user) public {
    string memory validFileUpload = fileExists(file, user);  // Checks if there is a file with the same name

    if (bytes(validFileUpload).length == 0) {
      userFiles.push(file);
      emit UploadFileResult(true, "File uploaded successfully.");
      return;
    }
    emit UploadFileResult(false, validFileUpload);
    return;
  }

  // Returns the files of a giving user
  function get(address account) public view returns (File[] memory) {
    File[] memory userFilesResult = new File[](userFiles.length);
    uint resultIndex = 0;

    // TODO: Later this will have to change. To get the users' files it will be seen in the UserHasFile table
    for (uint i=0; i< userFiles.length; i++) {
      if (userFiles[i].owner == account) {
        userFilesResult[resultIndex] = userFiles[i];
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
  function fileExists(File memory file, User memory user) public view returns (string memory) {    
    File[] memory usersFiles = get(user.account); // gets the files of a given user
    for (uint256 i=0; i<usersFiles.length; i++) {
      if (keccak256(abi.encodePacked(usersFiles[i].fileName)) == keccak256(abi.encodePacked(file.fileName))) {
        return "File has to have a unique name."; // File with the same name already exists
      }
    }
    return ""; // File with the same name doesn't exist
  }

}
