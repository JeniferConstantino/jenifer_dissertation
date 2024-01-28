// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./FileStruct.sol";

contract StoreFile {

  // Even though File[] already stored the address of the owner, putting thin in a map failitates when returning the files of a given owne (we don't have to go through all files in the system)
  mapping(address => File[]) private userFiles;

  // Upload of a new file: stores in the blockchain the files' CID, type, and owner
  function set(File memory file) public {
    userFiles[msg.sender].push(file);
  }

  // Returns the files of a calling user
  function get() public view returns (File[] memory) {
    if (userFiles[msg.sender].length != 0) {
      return userFiles[msg.sender];
    }
    return (new File[](0));
  }
  
}
