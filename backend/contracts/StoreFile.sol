// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../structs/FileStruct.sol";
import "../structs/UserStruct.sol";
import "../structs/UserHasFile.sol";

contract StoreFile {

  event UploadFileResult(bool success, string message);
  File[] private userFiles;
  UserHasFile[] private userHasFile;

  // Upload of a new file
  function uploadFile(File memory file, string memory encSymmetricKey, User memory user) public {
    string memory validFileUpload = fileExists(file, user);  // Checks if there is a file with the same name

    if (bytes(validFileUpload).length == 0) {
      // Adds the corresponding information to the corresponding structs
      userFiles.push(file);
      storeUserHasFile(user, file, encSymmetricKey);

      // Emits the message that the file has been uploaded
      emit UploadFileResult(true, "File uploaded successfully.");
      return;
    }
    emit UploadFileResult(false, validFileUpload);
    return;
  }

  // Returns the files of a giving user
  function getUserFiles(address account) public view returns (File[] memory) {
    File[] memory userFilesResult = new File[](userFiles.length);
    uint resultIndex = 0;

    for (uint i=0; i<userHasFile.length; i++) {
      if (userHasFile[i].userAccount == account) { // Looks for the files the user is associated with 
        string memory fileNameUser = userHasFile[i].fileName;
        File memory fileUser = getFileByName(fileNameUser, userFiles); // Gets the file having the file name

        // Stores the file in the array to be returned
        userFilesResult[resultIndex] = fileUser;
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
    File[] memory usersFiles = getUserFiles(user.account); // gets the files of a given user

    File memory fileReceived = getFileByName(file.fileName, usersFiles); // Sees if there is an already existing file with the same name

    if (keccak256(abi.encodePacked(fileReceived.fileName)) != keccak256(abi.encodePacked(""))) {
      return "User already associated with the file."; 
    }
    
    return ""; 
  }

  // Returns the encrypted symmetric key of a given user and file 
  function getEncSymmetricKeyFileUser (User memory user, File memory file) public view returns (string memory) {
    for (uint256 i=0; i<userHasFile.length; i++) {
        if ((userHasFile[i].userAccount == user.account) && 
            (keccak256(abi.encodePacked(userHasFile[i].fileName)) == keccak256(abi.encodePacked(file.fileName)))
          ) {
            return userHasFile[i].encSymmetricKey;
        }
    }
    return "";   
  }

  // Gets a file having the files' name and the array to search on
  function getFileByName(string memory name, File[] memory files) private pure returns (File memory) {
    for (uint256 i=0; i<files.length; i++) {
      if (keccak256(abi.encodePacked(files[i].fileName)) == keccak256(abi.encodePacked(name))) {
        return files[i];
      }
    }   
    return File({ fileName: "", owner: address(0), ipfsCID: "", fileType: "", iv: "" });
  }

  // Associates a user to a file
  function storeUserHasFile(User memory user, File memory file, string memory encSymmetricKey) public {
    UserHasFile memory userFileData = UserHasFile({
      userAccount: user.account,
      fileName: file.fileName,
      encSymmetricKey: encSymmetricKey
    });
    userHasFile.push(userFileData);                 // TODO: before adding the file i need to ensure the file is not already associated with the user
  }

}
