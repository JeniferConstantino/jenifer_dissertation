// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../structs/FileStruct.sol";

contract StoreFile {

  // Even though File[] already stores the address of the owner, putting thin in a map failitates when returning the files of a given owner (we don't have to go through all files in the system)
  mapping(address => File[]) private userFiles;
  event UploadFileResult(bool success, string message);

  // Upload of a new file
  function uploadFile(File memory file) public {
    string memory validFileUpload = fileExists(file);  // Checks if there is a file with the same name

    if (bytes(validFileUpload).length == 0) {
      userFiles[msg.sender].push(file);
      emit UploadFileResult(true, "File uploaded successfully.");
      return;
    }
    emit UploadFileResult(false, validFileUpload);
    return;
  }

  // Returns the files of a calling user
  function get() public view returns (File[] memory) {
    if (userFiles[msg.sender].length != 0) {
      return userFiles[msg.sender];
    }
    return (new File[](0));
  }

  // See if a user already has a file with a given name
  function fileExists(File memory file) public view returns (string memory) {
    File[] memory files = userFiles[msg.sender]; // Gets the files of a given user
    for (uint256 i=0; i<files.length; i++) {
      if (keccak256(abi.encodePacked(files[i].fileName)) == keccak256(abi.encodePacked(file.fileName))) {
        return "File has to have a unique name."; // File with the same name already exists
      }
    }
    return ""; // File with the same name doesn't exist
  }

}
