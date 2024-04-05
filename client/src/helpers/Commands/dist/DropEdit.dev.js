"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _FileApp = require("../FileApp");

var _DropFileCommand2 = _interopRequireDefault(require("./DropFileCommand"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

// Concrete command for uploading a file
var DropEdit =
/*#__PURE__*/
function (_DropFileCommand) {
  _inherits(DropEdit, _DropFileCommand);

  function DropEdit(fileManager, fileUplName, selectedFile, fileAsBuffer, handleFileUploaded, uploadedActiveFiles, uploadedFiles) {
    var _this;

    _classCallCheck(this, DropEdit);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(DropEdit).call(this));
    _this.fileManager = fileManager;
    _this.fileUplName = fileUplName;
    _this.selectedFile = selectedFile;
    _this.fileAsBuffer = fileAsBuffer;
    _this.handleFileUploaded = handleFileUploaded;
    _this.uploadedActiveFiles = uploadedActiveFiles;
    _this.uploadedFiles = uploadedFiles;
    return _this;
  } // Gets the encrypted symmetric key for each user that has download permissions over a file


  _createClass(DropEdit, [{
    key: "encryptedSymmetricKeys",
    value: function encryptedSymmetricKeys(selectedFile, symmetricKey) {
      var result, usersDonldPermFile, encryKeysUsers, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, userAddress, res, userPublicKey, encryptedSymmetricKey;

      return regeneratorRuntime.async(function encryptedSymmetricKeys$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return regeneratorRuntime.awrap(this.fileManager.getUsersAssociatedWithFile(selectedFile.ipfsCID));

            case 2:
              result = _context.sent;

              if (!result.success) {
                console.log("Error: ", result.message);
              }

              usersDonldPermFile = result.resultAddresses; // Create a map where the key are the users and the value are the encrypted symmetric keys

              encryKeysUsers = new Map(); // Iterate over each user, encrypt the symmetric key with the corresponding public key and store it on the map

              _iteratorNormalCompletion = true;
              _didIteratorError = false;
              _iteratorError = undefined;
              _context.prev = 9;
              _iterator = usersDonldPermFile[Symbol.iterator]();

            case 11:
              if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                _context.next = 27;
                break;
              }

              userAddress = _step.value;
              _context.next = 15;
              return regeneratorRuntime.awrap(this.fileManager.getPubKeyUser(userAddress));

            case 15:
              res = _context.sent;

              if (res.success) {
                _context.next = 19;
                break;
              }

              console.log("something went wrong while trying to get the users public key.");
              return _context.abrupt("return", '');

            case 19:
              userPublicKey = res.resultString; // Encrypt the symmetric key with teach users' public  key

              _context.next = 22;
              return regeneratorRuntime.awrap(this.fileManager.encryptSymmetricKey(symmetricKey, userPublicKey));

            case 22:
              encryptedSymmetricKey = _context.sent;
              // Store in the map the encrypted symmetric key as a value and with user as the key 
              encryKeysUsers.set(userAddress, encryptedSymmetricKey.toString('base64'));

            case 24:
              _iteratorNormalCompletion = true;
              _context.next = 11;
              break;

            case 27:
              _context.next = 33;
              break;

            case 29:
              _context.prev = 29;
              _context.t0 = _context["catch"](9);
              _didIteratorError = true;
              _iteratorError = _context.t0;

            case 33:
              _context.prev = 33;
              _context.prev = 34;

              if (!_iteratorNormalCompletion && _iterator["return"] != null) {
                _iterator["return"]();
              }

            case 36:
              _context.prev = 36;

              if (!_didIteratorError) {
                _context.next = 39;
                break;
              }

              throw _iteratorError;

            case 39:
              return _context.finish(36);

            case 40:
              return _context.finish(33);

            case 41:
              return _context.abrupt("return", encryKeysUsers);

            case 42:
            case "end":
              return _context.stop();
          }
        }
      }, null, this, [[9, 29, 33, 41], [34,, 36, 40]]);
    }
  }, {
    key: "storeFile",
    value: function storeFile(symmetricKey, iv, fileHash, fileCID) {
      var fileEdited, encryKeysUsers, usersWithDownlodPermSelectFile, pubKeyUsersWithDownloadPermSelectFile;
      return regeneratorRuntime.async(function storeFile$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              // Prepares the file to be stored
              fileEdited = new _FileApp.FileApp(this.fileUplName, this.selectedFile.version + 1, this.selectedFile.ipfsCID, this.selectedFile.owner, fileCID, iv.toString('base64'), "active", fileHash);
              fileEdited.fileType = _FileApp.FileApp.getFileType(this.fileUplName); // get the encrypted symmetric key for each user that has download permissions over the file to be edited

              _context2.next = 4;
              return regeneratorRuntime.awrap(this.encryptedSymmetricKeys(this.selectedFile, symmetricKey));

            case 4:
              encryKeysUsers = _context2.sent;
              // Solidity doesn't support to receive maps as arguments
              usersWithDownlodPermSelectFile = Array.from(encryKeysUsers.keys());
              pubKeyUsersWithDownloadPermSelectFile = Array.from(encryKeysUsers.values()); // Calls the method on the contract responsible for uploading the edited file and changing the state of the previous one

              _context2.next = 9;
              return regeneratorRuntime.awrap(this.fileManager.editFileUpl(this.selectedFile, fileEdited, usersWithDownlodPermSelectFile, pubKeyUsersWithDownloadPermSelectFile));

            case 9:
              return _context2.abrupt("return", fileEdited);

            case 10:
            case "end":
              return _context2.stop();
          }
        }
      }, null, this);
    }
  }]);

  return DropEdit;
}(_DropFileCommand2["default"]);

var _default = DropEdit;
exports["default"] = _default;