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
var DropUpload =
/*#__PURE__*/
function (_DropFileCommand) {
  _inherits(DropUpload, _DropFileCommand);

  function DropUpload(fileManager, fileUplName, fileAsBuffer, handleFileUploaded, uploadedActiveFiles, uploadedFiles) {
    var _this;

    _classCallCheck(this, DropUpload);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(DropUpload).call(this));
    _this.fileManager = fileManager;
    _this.fileUplName = fileUplName;
    _this.fileAsBuffer = fileAsBuffer;
    _this.handleFileUploaded = handleFileUploaded;
    _this.uploadedActiveFiles = uploadedActiveFiles;
    _this.uploadedFiles = uploadedFiles;
    return _this;
  }

  _createClass(DropUpload, [{
    key: "storeFile",
    value: function storeFile(symmetricKey, iv, fileHash, fileCID) {
      var fileOwner, fileVersion, fileUploaded, encryptedSymmetricKey;
      return regeneratorRuntime.async(function storeFile$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              // Prepares the file to be stored
              fileOwner = this.fileManager.selectedUser.account;
              fileVersion = 0; // 1st upload

              fileUploaded = new _FileApp.FileApp(this.fileUplName, fileVersion, "", fileOwner, fileCID, iv.toString('base64'), "", fileHash);
              fileUploaded.fileType = _FileApp.FileApp.getFileType(this.fileUplName);
              encryptedSymmetricKey = this.fileManager.encryptSymmetricKey(symmetricKey, localStorage.getItem('publicKey')); // Associates the current user with the uploaded file 

              _context.next = 7;
              return regeneratorRuntime.awrap(this.fileManager.uploadFileUser(this.fileManager.selectedUser.account, fileUploaded, encryptedSymmetricKey));

            case 7:
              return _context.abrupt("return", fileUploaded);

            case 8:
            case "end":
              return _context.stop();
          }
        }
      }, null, this);
    }
  }]);

  return DropUpload;
}(_DropFileCommand2["default"]);

var _default = DropUpload;
exports["default"] = _default;