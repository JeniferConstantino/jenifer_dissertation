"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _BlockchainWrapper = _interopRequireDefault(require("./Managers/BlockchainWrapper"));

var _EncryptionWrapper = _interopRequireDefault(require("./Managers/EncryptionWrapper"));

var _IPFSWrapper = _interopRequireDefault(require("./Managers/IPFSWrapper"));

var _DropUpload = _interopRequireDefault(require("./Commands/DropUpload"));

var _DropEdit = _interopRequireDefault(require("./Commands/DropEdit"));

var _VerifyFileCommand = _interopRequireDefault(require("./Commands/VerifyFileCommand"));

var _DownloadFileCommand = _interopRequireDefault(require("./Commands/DownloadFileCommand"));

var _ShareFileCommand = _interopRequireDefault(require("./Commands/ShareFileCommand"));

var _UpdatePermissionsCommand = _interopRequireDefault(require("./Commands/UpdatePermissionsCommand"));

var _DeleteFileCommand = _interopRequireDefault(require("./Commands/DeleteFileCommand"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var FileManagerFacade =
/*#__PURE__*/
function () {
  function FileManagerFacade(fileRegisterContract, userRegisterContract, accessControlContract, auditLogControlContract) {
    _classCallCheck(this, FileManagerFacade);

    this.fileRegisterContract = fileRegisterContract;
    this.userRegisterContract = userRegisterContract;
    this.accessControlContract = accessControlContract;
    this.auditLogControlContract = auditLogControlContract;
    this._selectedAccount = "";
    this._selectedUser = null;
  } // returns the selectedUser


  _createClass(FileManagerFacade, [{
    key: "uploadFile",
    // Uploads File into the system
    value: function uploadFile(fileUplName, fileAsBuffer, handleFileUploaded, uploadedActiveFiles, uploadedFiles) {
      var uploadCommand;
      return regeneratorRuntime.async(function uploadFile$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              uploadCommand = new _DropUpload["default"](this, fileUplName, fileAsBuffer, handleFileUploaded, uploadedActiveFiles, uploadedFiles);
              _context.next = 3;
              return regeneratorRuntime.awrap(uploadCommand.execute());

            case 3:
            case "end":
              return _context.stop();
          }
        }
      }, null, this);
    } // Edits an existing file 

  }, {
    key: "editFile",
    value: function editFile(fileUplName, fileAsBuffer, selectedFile, handleFileUploaded, uploadedActiveFiles, uploadedFiles) {
      var editCommand;
      return regeneratorRuntime.async(function editFile$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              editCommand = new _DropEdit["default"](this, fileUplName, selectedFile, fileAsBuffer, handleFileUploaded, uploadedActiveFiles, uploadedFiles);
              _context2.next = 3;
              return regeneratorRuntime.awrap(editCommand.execute());

            case 3:
            case "end":
              return _context2.stop();
          }
        }
      }, null, this);
    } // Gets the file from IPFS, decryts and downloads

  }, {
    key: "downloadFile",
    value: function downloadFile(selectedFile) {
      var downloadCommand;
      return regeneratorRuntime.async(function downloadFile$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              downloadCommand = new _DownloadFileCommand["default"](this, selectedFile);
              _context3.next = 3;
              return regeneratorRuntime.awrap(downloadCommand.execute());

            case 3:
              return _context3.abrupt("return", _context3.sent);

            case 4:
            case "end":
              return _context3.stop();
          }
        }
      }, null, this);
    } // Deletes the file from IPFS and the association between the user and the file

  }, {
    key: "deleteFile",
    value: function deleteFile(selectedFile, handleFileDeleted, uploadedFiles) {
      var deleteCommand;
      return regeneratorRuntime.async(function deleteFile$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              deleteCommand = new _DeleteFileCommand["default"](this, selectedFile, handleFileDeleted, uploadedFiles);
              _context4.next = 3;
              return regeneratorRuntime.awrap(deleteCommand.execute());

            case 3:
            case "end":
              return _context4.stop();
          }
        }
      }, null, this);
    } // Shares the file with a given user that was not already associated with a file

  }, {
    key: "shareFileCommand",
    value: function shareFileCommand(selectedFile, permissions, accountUserShareFileWith) {
      var shareCommand;
      return regeneratorRuntime.async(function shareFileCommand$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              shareCommand = new _ShareFileCommand["default"](this, selectedFile, permissions, accountUserShareFileWith);
              _context5.next = 3;
              return regeneratorRuntime.awrap(shareCommand.execute());

            case 3:
            case "end":
              return _context5.stop();
          }
        }
      }, null, this);
    } // Updates permissions of a given user over a file

  }, {
    key: "updateUserFilePermissionsCommand",
    value: function updateUserFilePermissionsCommand(selectedFile, permissions, accountUserShareFileWith) {
      var updatePermissionsCommand;
      return regeneratorRuntime.async(function updateUserFilePermissionsCommand$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              updatePermissionsCommand = new _UpdatePermissionsCommand["default"](this, selectedFile, permissions, accountUserShareFileWith);
              _context6.next = 3;
              return regeneratorRuntime.awrap(updatePermissionsCommand.execute());

            case 3:
            case "end":
              return _context6.stop();
          }
        }
      }, null, this);
    } // Verifies if a file already exists in the app

  }, {
    key: "verifyFile",
    value: function verifyFile(fileAsBuffer) {
      var verifyFileCommand;
      return regeneratorRuntime.async(function verifyFile$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              verifyFileCommand = new _VerifyFileCommand["default"](this, fileAsBuffer);
              _context7.next = 3;
              return regeneratorRuntime.awrap(verifyFileCommand.execute());

            case 3:
              return _context7.abrupt("return", _context7.sent);

            case 4:
            case "end":
              return _context7.stop();
          }
        }
      }, null, this);
    } // Associates a user with a file given certain permissions 

  }, {
    key: "associateUserFilePermissions",
    value: function associateUserFilePermissions(selectedFile, permissions, accountUserShareFileWith) {
      var userAssociatedWithFile;
      return regeneratorRuntime.async(function associateUserFilePermissions$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              _context8.next = 2;
              return regeneratorRuntime.awrap(_BlockchainWrapper["default"].verifyUserAssociatedWithFile(this.accessControlContract, selectedFile.ipfsCID, accountUserShareFileWith, this.selectedUser.account));

            case 2:
              userAssociatedWithFile = _context8.sent;

              if (!userAssociatedWithFile) {
                _context8.next = 7;
                break;
              }

              _context8.next = 6;
              return regeneratorRuntime.awrap(this.updateUserFilePermissionsCommand(selectedFile, permissions, accountUserShareFileWith));

            case 6:
              return _context8.abrupt("return");

            case 7:
              _context8.next = 9;
              return regeneratorRuntime.awrap(this.shareFileCommand(selectedFile, permissions, accountUserShareFileWith));

            case 9:
            case "end":
              return _context8.stop();
          }
        }
      }, null, this);
    } // Verifies if the user is already associated with a file with the same name

  }, {
    key: "userAssociatedWithFileName",
    value: function userAssociatedWithFileName(userAccount, fileName) {
      return regeneratorRuntime.async(function userAssociatedWithFileName$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
              _context9.next = 2;
              return regeneratorRuntime.awrap(_BlockchainWrapper["default"].userAssociatedWithFileName(this.accessControlContract, userAccount, fileName, this.selectedUser.account));

            case 2:
              return _context9.abrupt("return", _context9.sent);

            case 3:
            case "end":
              return _context9.stop();
          }
        }
      }, null, this);
    } // Get all active files that were uploaded too the blockchain

  }, {
    key: "getFilesUploadedBlockchain",
    value: function getFilesUploadedBlockchain(selectedUser, state) {
      return regeneratorRuntime.async(function getFilesUploadedBlockchain$(_context10) {
        while (1) {
          switch (_context10.prev = _context10.next) {
            case 0:
              _context10.next = 2;
              return regeneratorRuntime.awrap(_BlockchainWrapper["default"].getFilesUploadedBlockchain(this.accessControlContract, selectedUser.account, state, this.selectedUser.account));

            case 2:
              return _context10.abrupt("return", _context10.sent);

            case 3:
            case "end":
              return _context10.stop();
          }
        }
      }, null, this);
    } // Get the historic of a file - get previous edited files from the oldest to the most recent one

  }, {
    key: "getPrevEditedFiles",
    value: function getPrevEditedFiles(fileIpfsCid) {
      return regeneratorRuntime.async(function getPrevEditedFiles$(_context11) {
        while (1) {
          switch (_context11.prev = _context11.next) {
            case 0:
              _context11.next = 2;
              return regeneratorRuntime.awrap(_BlockchainWrapper["default"].getPrevEditedFiles(this.fileRegisterContract, fileIpfsCid, this.selectedUser.account));

            case 2:
              return _context11.abrupt("return", _context11.sent);

            case 3:
            case "end":
              return _context11.stop();
          }
        }
      }, null, this);
    } // Get all logs that were stored in the blockchain

  }, {
    key: "getLogsUserFilesBlockchain",
    value: function getLogsUserFilesBlockchain(uploadedFiles) {
      var filesIpfsCid;
      return regeneratorRuntime.async(function getLogsUserFilesBlockchain$(_context12) {
        while (1) {
          switch (_context12.prev = _context12.next) {
            case 0:
              filesIpfsCid = uploadedFiles.map(function (file) {
                return file.ipfsCID;
              });
              _context12.next = 3;
              return regeneratorRuntime.awrap(_BlockchainWrapper["default"].getLogsUserFilesBlockchain(this.auditLogControlContract, filesIpfsCid, this.selectedUser.account));

            case 3:
              return _context12.abrupt("return", _context12.sent);

            case 4:
            case "end":
              return _context12.stop();
          }
        }
      }, null, this);
    } // Gets the user, according to a certain username

  }, {
    key: "getUserAccount",
    value: function getUserAccount(usernameToShare) {
      return regeneratorRuntime.async(function getUserAccount$(_context13) {
        while (1) {
          switch (_context13.prev = _context13.next) {
            case 0:
              _context13.next = 2;
              return regeneratorRuntime.awrap(_BlockchainWrapper["default"].getUserAccount(usernameToShare, this.userRegisterContract, this.selectedUser.account));

            case 2:
              return _context13.abrupt("return", _context13.sent);

            case 3:
            case "end":
              return _context13.stop();
          }
        }
      }, null, this);
    } // Verifies if the user is elegibe to get a file shared with or get the permissions updated

  }, {
    key: "validUserShareUpdtPerm",
    value: function validUserShareUpdtPerm(userAccount, fileIpfsCid) {
      return regeneratorRuntime.async(function validUserShareUpdtPerm$(_context14) {
        while (1) {
          switch (_context14.prev = _context14.next) {
            case 0:
              _context14.next = 2;
              return regeneratorRuntime.awrap(_BlockchainWrapper["default"].validUserShareUpdtPerm(this.fileRegisterContract, userAccount, fileIpfsCid, this.selectedUser.account));

            case 2:
              return _context14.abrupt("return", _context14.sent);

            case 3:
            case "end":
              return _context14.stop();
          }
        }
      }, null, this);
    } // Get the user, according to the account

  }, {
    key: "getUserUserName",
    value: function getUserUserName(userAccount) {
      return regeneratorRuntime.async(function getUserUserName$(_context15) {
        while (1) {
          switch (_context15.prev = _context15.next) {
            case 0:
              _context15.next = 2;
              return regeneratorRuntime.awrap(_BlockchainWrapper["default"].getUserUserName(this.userRegisterContract, userAccount, this.selectedUser.account));

            case 2:
              return _context15.abrupt("return", _context15.sent);

            case 3:
            case "end":
              return _context15.stop();
          }
        }
      }, null, this);
    } // Get the symmetric key of a single file asociated with a given user

  }, {
    key: "getEncSymmetricKeyFileUser",
    value: function getEncSymmetricKeyFileUser(userAccount, fileIpfscid) {
      return regeneratorRuntime.async(function getEncSymmetricKeyFileUser$(_context16) {
        while (1) {
          switch (_context16.prev = _context16.next) {
            case 0:
              _context16.next = 2;
              return regeneratorRuntime.awrap(_BlockchainWrapper["default"].getEncSymmetricKeyFileUser(this.accessControlContract, userAccount, fileIpfscid));

            case 2:
              return _context16.abrupt("return", _context16.sent);

            case 3:
            case "end":
              return _context16.stop();
          }
        }
      }, null, this);
    } // Get the all the encrypted symmetric keys of a file (including passed editings) associated with a given user 

  }, {
    key: "getAllEncSymmetricKeyFileUser",
    value: function getAllEncSymmetricKeyFileUser(userAccount, fileIpfscid) {
      return regeneratorRuntime.async(function getAllEncSymmetricKeyFileUser$(_context17) {
        while (1) {
          switch (_context17.prev = _context17.next) {
            case 0:
              _context17.next = 2;
              return regeneratorRuntime.awrap(_BlockchainWrapper["default"].getAllEncSymmetricKeyFileUser(this.accessControlContract, userAccount, fileIpfscid));

            case 2:
              return _context17.abrupt("return", _context17.sent);

            case 3:
            case "end":
              return _context17.stop();
          }
        }
      }, null, this);
    } // Gets the permissions a given user has over a file

  }, {
    key: "getPermissionsUserOverFile",
    value: function getPermissionsUserOverFile(accountUserToGetPermssion, selectedFileIpfsCid) {
      return regeneratorRuntime.async(function getPermissionsUserOverFile$(_context18) {
        while (1) {
          switch (_context18.prev = _context18.next) {
            case 0:
              _context18.next = 2;
              return regeneratorRuntime.awrap(_BlockchainWrapper["default"].getPermissionsUserOverFile(this.accessControlContract, accountUserToGetPermssion, selectedFileIpfsCid, this.selectedUser.account));

            case 2:
              return _context18.abrupt("return", _context18.sent);

            case 3:
            case "end":
              return _context18.stop();
          }
        }
      }, null, this);
    } // Gets the public key of a given user

  }, {
    key: "getPubKeyUser",
    value: function getPubKeyUser(accountUser) {
      return regeneratorRuntime.async(function getPubKeyUser$(_context19) {
        while (1) {
          switch (_context19.prev = _context19.next) {
            case 0:
              _context19.next = 2;
              return regeneratorRuntime.awrap(_BlockchainWrapper["default"].getPublicKey(this.userRegisterContract, accountUser, this.selectedUser.account));

            case 2:
              return _context19.abrupt("return", _context19.sent);

            case 3:
            case "end":
              return _context19.stop();
          }
        }
      }, null, this);
    } // Get file IPFS CID

  }, {
    key: "getFileByIpfsCID",
    value: function getFileByIpfsCID(fileIpfsCid, state) {
      return regeneratorRuntime.async(function getFileByIpfsCID$(_context20) {
        while (1) {
          switch (_context20.prev = _context20.next) {
            case 0:
              _context20.next = 2;
              return regeneratorRuntime.awrap(_BlockchainWrapper["default"].getFileByIpfsCID(this.fileRegisterContract, fileIpfsCid, state, this.selectedUser.account));

            case 2:
              return _context20.abrupt("return", _context20.sent);

            case 3:
            case "end":
              return _context20.stop();
          }
        }
      }, null, this);
    } // Get users' permissions over a file

  }, {
    key: "getPermissionsOverFile",
    value: function getPermissionsOverFile(userAccount, fileIpfsCid) {
      return regeneratorRuntime.async(function getPermissionsOverFile$(_context21) {
        while (1) {
          switch (_context21.prev = _context21.next) {
            case 0:
              _context21.next = 2;
              return regeneratorRuntime.awrap(_BlockchainWrapper["default"].getPermissionsOverFile(this.accessControlContract, userAccount, fileIpfsCid, this.selectedUser.account));

            case 2:
              return _context21.abrupt("return", _context21.sent);

            case 3:
            case "end":
              return _context21.stop();
          }
        }
      }, null, this);
    } // Adds the file in the blockchain

  }, {
    key: "addFile",
    value: function addFile(file) {
      return regeneratorRuntime.async(function addFile$(_context22) {
        while (1) {
          switch (_context22.prev = _context22.next) {
            case 0:
              _context22.next = 2;
              return regeneratorRuntime.awrap(_BlockchainWrapper["default"].addFile(this.fileRegisterContract, file, this.selectedUser.account));

            case 2:
              return _context22.abrupt("return", _context22.sent);

            case 3:
            case "end":
              return _context22.stop();
          }
        }
      }, null, this);
    } // Associates a user with a file

  }, {
    key: "uploadFileUser",
    value: function uploadFileUser(userAccount, file, encSymmetricKey) {
      return regeneratorRuntime.async(function uploadFileUser$(_context23) {
        while (1) {
          switch (_context23.prev = _context23.next) {
            case 0:
              _context23.next = 2;
              return regeneratorRuntime.awrap(_BlockchainWrapper["default"].uploadFileUser(this.accessControlContract, userAccount, file, encSymmetricKey, this.selectedUser.account));

            case 2:
              return _context23.abrupt("return", _context23.sent);

            case 3:
            case "end":
              return _context23.stop();
          }
        }
      }, null, this);
    } // Edits the uploaded file

  }, {
    key: "editFileUpl",
    value: function editFileUpl(selectedFile, fileEdited, usersWithDownlodPermSelectFile, pubKeyUsersWithDownloadPermSelectFile) {
      return regeneratorRuntime.async(function editFileUpl$(_context24) {
        while (1) {
          switch (_context24.prev = _context24.next) {
            case 0:
              _context24.next = 2;
              return regeneratorRuntime.awrap(_BlockchainWrapper["default"].editFileUpl(this.accessControlContract, selectedFile, fileEdited, usersWithDownlodPermSelectFile, pubKeyUsersWithDownloadPermSelectFile, this.selectedUser.account));

            case 2:
              return _context24.abrupt("return", _context24.sent);

            case 3:
            case "end":
              return _context24.stop();
          }
        }
      }, null, this);
    } // Updates the users' permissions over a file

  }, {
    key: "updateUserFilePermissions",
    value: function updateUserFilePermissions(userAccount, fileIpfsCid, permissionsArray) {
      return _BlockchainWrapper["default"].updateUserFilePermissions(this.accessControlContract, userAccount, fileIpfsCid, permissionsArray, this.selectedUser.account);
    } // Remove the relationship between a user and a file

  }, {
    key: "removeUserFileAssociation",
    value: function removeUserFileAssociation(userAccount, fileIpfsCid) {
      return _BlockchainWrapper["default"].removeUserFileAssociation(this.accessControlContract, userAccount, fileIpfsCid, this.selectedUser.account);
    } // Deletes the files' association with the users, and deletes the file

  }, {
    key: "deactivateFile",
    value: function deactivateFile(userAccount, fileIpfsCid) {
      return regeneratorRuntime.async(function deactivateFile$(_context25) {
        while (1) {
          switch (_context25.prev = _context25.next) {
            case 0:
              _context25.next = 2;
              return regeneratorRuntime.awrap(_BlockchainWrapper["default"].deactivateFile(this.accessControlContract, userAccount, fileIpfsCid, this.selectedUser.account));

            case 2:
              return _context25.abrupt("return", _context25.sent);

            case 3:
            case "end":
              return _context25.stop();
          }
        }
      }, null, this);
    } // Deletes permanently the file

  }, {
    key: "deleteFilePermanently",
    value: function deleteFilePermanently(fileIpfsCid) {
      return _BlockchainWrapper["default"].deleteFilePermanently(this.fileRegisterContract, fileIpfsCid, this.selectedUser.account);
    } // Associates a user with a file, given certain permissions

  }, {
    key: "fileShare",
    value: function fileShare(userAccount, fileIpfCid, encryptedSymmetricKeysShared, permissionsArray) {
      return _BlockchainWrapper["default"].fileShare(this.accessControlContract, userAccount, fileIpfCid, encryptedSymmetricKeysShared, permissionsArray, this.selectedUser.account);
    } // Downloads the users' file

  }, {
    key: "downloadFileAudit",
    value: function downloadFileAudit(fileIpfsCid, userAccount) {
      return _BlockchainWrapper["default"].downloadFileAudit(this.accessControlContract, fileIpfsCid, userAccount, this.selectedUser.account);
    } // Verifies if a user address exist

  }, {
    key: "existingAddress",
    value: function existingAddress(userAccount) {
      return _BlockchainWrapper["default"].existingAddress(this.userRegisterContract, userAccount, this.selectedAccount.curent);
    } // Verifies if a user name exist

  }, {
    key: "existingUserName",
    value: function existingUserName(userUserName) {
      return _BlockchainWrapper["default"].existingUserName(this.userRegisterContract, userUserName, this.selectedAccount.curent);
    } // Adds a user into the blockchain

  }, {
    key: "userRegistered",
    value: function userRegistered(user) {
      return _BlockchainWrapper["default"].userRegistered(this.userRegisterContract, user, this.selectedAccount.current);
    } // Returns if a user is associated with a file

  }, {
    key: "verifyUserAssociatedWithFile",
    value: function verifyUserAssociatedWithFile(userAccount, fileIpfsCid) {
      return regeneratorRuntime.async(function verifyUserAssociatedWithFile$(_context26) {
        while (1) {
          switch (_context26.prev = _context26.next) {
            case 0:
              _context26.next = 2;
              return regeneratorRuntime.awrap(_BlockchainWrapper["default"].verifyUserAssociatedWithFile(this.accessControlContract, fileIpfsCid, userAccount, this.selectedUser.account));

            case 2:
              return _context26.abrupt("return", _context26.sent);

            case 3:
            case "end":
              return _context26.stop();
          }
        }
      }, null, this);
    } // Returns if a file is valid or not

  }, {
    key: "verifyValidFile",
    value: function verifyValidFile(userAccount, fileHash) {
      return regeneratorRuntime.async(function verifyValidFile$(_context27) {
        while (1) {
          switch (_context27.prev = _context27.next) {
            case 0:
              _context27.next = 2;
              return regeneratorRuntime.awrap(_BlockchainWrapper["default"].verifyValidFile(this.accessControlContract, userAccount, fileHash, this.selectedUser.account));

            case 2:
              return _context27.abrupt("return", _context27.sent);

            case 3:
            case "end":
              return _context27.stop();
          }
        }
      }, null, this);
    } // Records the file verification

  }, {
    key: "recordFileVerification",
    value: function recordFileVerification(userAccount, fileHash) {
      return regeneratorRuntime.async(function recordFileVerification$(_context28) {
        while (1) {
          switch (_context28.prev = _context28.next) {
            case 0:
              _context28.next = 2;
              return regeneratorRuntime.awrap(_BlockchainWrapper["default"].recordFileVerification(this.accessControlContract, userAccount, fileHash, this.selectedUser.account));

            case 2:
              return _context28.abrupt("return", _context28.sent);

            case 3:
            case "end":
              return _context28.stop();
          }
        }
      }, null, this);
    } // Verifies if a mnemonic belongs to a given user

  }, {
    key: "verifyUserAssociatedMnemonic",
    value: function verifyUserAssociatedMnemonic(mnemonic, user) {
      return regeneratorRuntime.async(function verifyUserAssociatedMnemonic$(_context29) {
        while (1) {
          switch (_context29.prev = _context29.next) {
            case 0:
              _context29.next = 2;
              return regeneratorRuntime.awrap(_BlockchainWrapper["default"].verifyUserAssociatedMnemonic(this.userRegisterContract, mnemonic, user, this.selectedUser.account));

            case 2:
              return _context29.abrupt("return", _context29.sent);

            case 3:
            case "end":
              return _context29.stop();
          }
        }
      }, null, this);
    } // Returns the user

  }, {
    key: "getUser",
    value: function getUser(user) {
      return regeneratorRuntime.async(function getUser$(_context30) {
        while (1) {
          switch (_context30.prev = _context30.next) {
            case 0:
              _context30.next = 2;
              return regeneratorRuntime.awrap(_BlockchainWrapper["default"].getUser(this.userRegisterContract, user, this._selectedAccount.current));

            case 2:
              return _context30.abrupt("return", _context30.sent);

            case 3:
            case "end":
              return _context30.stop();
          }
        }
      }, null, this);
    } // Gets the users with download permissions over a file 

  }, {
    key: "getUsersWithDownloadPermissionsFile",
    value: function getUsersWithDownloadPermissionsFile(file) {
      return regeneratorRuntime.async(function getUsersWithDownloadPermissionsFile$(_context31) {
        while (1) {
          switch (_context31.prev = _context31.next) {
            case 0:
              _context31.next = 2;
              return regeneratorRuntime.awrap(_BlockchainWrapper["default"].getUsersWithDownloadPermissionsFile(this.accessControlContract, file, this.selectedUser.account));

            case 2:
              return _context31.abrupt("return", _context31.sent);

            case 3:
            case "end":
              return _context31.stop();
          }
        }
      }, null, this);
    } // Hashes the mnemonic using symmetric encryption

  }, {
    key: "hashMnemonicSymmetricEncryption",
    value: function hashMnemonicSymmetricEncryption(mnemonic) {
      return regeneratorRuntime.async(function hashMnemonicSymmetricEncryption$(_context32) {
        while (1) {
          switch (_context32.prev = _context32.next) {
            case 0:
              _context32.next = 2;
              return regeneratorRuntime.awrap(_EncryptionWrapper["default"].hashMnemonicSymmetricEncryption(mnemonic));

            case 2:
              return _context32.abrupt("return", _context32.sent);

            case 3:
            case "end":
              return _context32.stop();
          }
        }
      });
    } // Generates a hash using SHA-256

  }, {
    key: "generateHash256",
    value: function generateHash256(fileAsBuffer) {
      return regeneratorRuntime.async(function generateHash256$(_context33) {
        while (1) {
          switch (_context33.prev = _context33.next) {
            case 0:
              _context33.next = 2;
              return regeneratorRuntime.awrap(_EncryptionWrapper["default"].generateHash256(fileAsBuffer));

            case 2:
              return _context33.abrupt("return", _context33.sent);

            case 3:
            case "end":
              return _context33.stop();
          }
        }
      });
    } // Generates a symmetric key

  }, {
    key: "generateSymmetricKey",
    value: function generateSymmetricKey() {
      return _EncryptionWrapper["default"].generateSymmetricKey();
    } // Encrypts a file using a symmetric key

  }, {
    key: "encryptFileWithSymmetricKey",
    value: function encryptFileWithSymmetricKey(file, symmetricKey) {
      var _ref, encryptedFile, iv;

      return regeneratorRuntime.async(function encryptFileWithSymmetricKey$(_context34) {
        while (1) {
          switch (_context34.prev = _context34.next) {
            case 0:
              _context34.next = 2;
              return regeneratorRuntime.awrap(_EncryptionWrapper["default"].encryptFileWithSymmetricKey(file, symmetricKey));

            case 2:
              _ref = _context34.sent;
              encryptedFile = _ref.encryptedFile;
              iv = _ref.iv;
              return _context34.abrupt("return", {
                encryptedFile: encryptedFile,
                iv: iv
              });

            case 6:
            case "end":
              return _context34.stop();
          }
        }
      });
    } // Generates the mnemonic associated with a user

  }, {
    key: "generateMnemonic",
    value: function generateMnemonic() {
      return _EncryptionWrapper["default"].generateMnemonic();
    } // Generates a set of keys, given a mnemonic

  }, {
    key: "generateKeysFromMnemonic",
    value: function generateKeysFromMnemonic(mnemonic) {
      return regeneratorRuntime.async(function generateKeysFromMnemonic$(_context35) {
        while (1) {
          switch (_context35.prev = _context35.next) {
            case 0:
              return _context35.abrupt("return", _EncryptionWrapper["default"].generateKeysFromMnemonic(mnemonic));

            case 1:
            case "end":
              return _context35.stop();
          }
        }
      });
    } // Stores in the local storage

  }, {
    key: "storeLocalSotrage",
    value: function storeLocalSotrage(privateKey, publicKey, address) {
      return regeneratorRuntime.async(function storeLocalSotrage$(_context36) {
        while (1) {
          switch (_context36.prev = _context36.next) {
            case 0:
              return _context36.abrupt("return", _EncryptionWrapper["default"].storeLocalSotrage(privateKey, publicKey, address));

            case 1:
            case "end":
              return _context36.stop();
          }
        }
      });
    } // Decrypts a group of symmetric keys using a private key

  }, {
    key: "decryptSymmetricKeys",
    value: function decryptSymmetricKeys(encSymmetricKeys, privateKey) {
      return _EncryptionWrapper["default"].decryptSymmetricKeys(encSymmetricKeys, privateKey);
    } // Encrypts a single symmetric key using a public key 

  }, {
    key: "encryptSymmetricKey",
    value: function encryptSymmetricKey(symmetricKey, userPublicKey) {
      return _EncryptionWrapper["default"].encryptSymmetricKey(symmetricKey, userPublicKey);
    } // Encrypts symmetric keys using a public key

  }, {
    key: "encryptSymmetricKeys",
    value: function encryptSymmetricKeys(symmetricKeys, userPublicKey) {
      return _EncryptionWrapper["default"].encryptSymmetricKeys(symmetricKeys, userPublicKey);
    } // Decrypts a file uising a symmetric key

  }, {
    key: "decryptFileWithSymmetricKey",
    value: function decryptFileWithSymmetricKey(selectedFile, encryptedSymmetricKeyBuffer, fileContent) {
      return regeneratorRuntime.async(function decryptFileWithSymmetricKey$(_context37) {
        while (1) {
          switch (_context37.prev = _context37.next) {
            case 0:
              _context37.next = 2;
              return regeneratorRuntime.awrap(_EncryptionWrapper["default"].decryptFileWithSymmetricKey(selectedFile, encryptedSymmetricKeyBuffer, fileContent));

            case 2:
              return _context37.abrupt("return", _context37.sent);

            case 3:
            case "end":
              return _context37.stop();
          }
        }
      });
    } // Retursn all files in IPFS

  }, {
    key: "getFileFromIPFS",
    value: function getFileFromIPFS(ipfsCID) {
      return regeneratorRuntime.async(function getFileFromIPFS$(_context38) {
        while (1) {
          switch (_context38.prev = _context38.next) {
            case 0:
              _context38.next = 2;
              return regeneratorRuntime.awrap(_IPFSWrapper["default"].getFileFromIPFS(ipfsCID));

            case 2:
              return _context38.abrupt("return", _context38.sent);

            case 3:
            case "end":
              return _context38.stop();
          }
        }
      });
    } // Adds a file to IPFS

  }, {
    key: "addFileToIPFS",
    value: function addFileToIPFS(file) {
      return regeneratorRuntime.async(function addFileToIPFS$(_context39) {
        while (1) {
          switch (_context39.prev = _context39.next) {
            case 0:
              _context39.next = 2;
              return regeneratorRuntime.awrap(_IPFSWrapper["default"].addFileToIPFS(file));

            case 2:
              return _context39.abrupt("return", _context39.sent);

            case 3:
            case "end":
              return _context39.stop();
          }
        }
      });
    } // Helper function to format timestamp to "dd/mm/yyyy hh:mm:ss"

  }, {
    key: "selectedUser",
    get: function get() {
      return this._selectedUser;
    } // sets the selectedUser
    ,
    set: function set(selectedUser) {
      this._selectedUser = selectedUser;
    } // returns the selectedAccount

  }, {
    key: "selectedAccount",
    get: function get() {
      return this._selectedAccount;
    } // sets the selectedAccount
    ,
    set: function set(selectedAccount) {
      this._selectedAccount = selectedAccount;
    }
  }], [{
    key: "formatTimestamp",
    value: function formatTimestamp(timestamp) {
      var date = new Date(timestamp * 1000);
      var day = date.getDate().toString().padStart(2, '0');
      var month = (date.getMonth() + 1).toString().padStart(2, '0');
      var year = date.getFullYear();
      var hours = date.getHours().toString().padStart(2, '0');
      var minutes = date.getMinutes().toString().padStart(2, '0');
      var seconds = date.getSeconds().toString().padStart(2, '0');
      return "".concat(day, "/").concat(month, "/").concat(year, " ").concat(hours, ":").concat(minutes, ":").concat(seconds);
    }
  }]);

  return FileManagerFacade;
}();

var _default = FileManagerFacade;
exports["default"] = _default;