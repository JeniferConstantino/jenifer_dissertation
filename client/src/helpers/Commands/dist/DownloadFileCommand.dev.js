"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _Command2 = _interopRequireDefault(require("./Command"));

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

var DownloadFileCommand =
/*#__PURE__*/
function (_Command) {
  _inherits(DownloadFileCommand, _Command);

  function DownloadFileCommand(fileManager, selectedFile) {
    var _this;

    _classCallCheck(this, DownloadFileCommand);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(DownloadFileCommand).call(this));
    _this.fileManager = fileManager;
    _this.selectedFile = selectedFile;
    return _this;
  }

  _createClass(DownloadFileCommand, [{
    key: "execute",
    value: function execute() {
      var fileContent, result, fileUserEncryptedSymmetricKey, encryptedSymmetricKeyBuffer, decryptedFileBuffer, blob;
      return regeneratorRuntime.async(function execute$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.prev = 0;
              _context.next = 3;
              return regeneratorRuntime.awrap(this.fileManager.getFileFromIPFS(this.selectedFile.ipfsCID));

            case 3:
              fileContent = _context.sent;
              console.log("Accessed file in IPFS."); // Gets the file encrypted symmetric key

              _context.next = 7;
              return regeneratorRuntime.awrap(this.fileManager.getEncSymmetricKeyFileUser(this.fileManager.selectedUser.account, this.selectedFile.ipfsCID));

            case 7:
              result = _context.sent;

              if (result.success) {
                _context.next = 11;
                break;
              }

              console.log("Something went wrong while trying to get the encrypted symmetric key of the users file.");
              return _context.abrupt("return");

            case 11:
              fileUserEncryptedSymmetricKey = result.resultString;
              encryptedSymmetricKeyBuffer = Buffer.from(fileUserEncryptedSymmetricKey, 'base64'); // Decrypts the file

              _context.next = 15;
              return regeneratorRuntime.awrap(this.fileManager.decryptFileWithSymmetricKey(this.selectedFile, encryptedSymmetricKeyBuffer, fileContent));

            case 15:
              decryptedFileBuffer = _context.sent;
              blob = new Blob([decryptedFileBuffer]);
              console.log("File Decrypted."); // Makes the treatment of the download in the backend and stores on the audit log

              _context.next = 20;
              return regeneratorRuntime.awrap(this.fileManager.downloadFileAudit(this.selectedFile.ipfsCID, this.fileManager.selectedUser.account));

            case 20:
              return _context.abrupt("return", blob);

            case 23:
              _context.prev = 23;
              _context.t0 = _context["catch"](0);
              console.error("Error decrypting or downloading file: ", _context.t0);

            case 26:
            case "end":
              return _context.stop();
          }
        }
      }, null, this, [[0, 23]]);
    }
  }]);

  return DownloadFileCommand;
}(_Command2["default"]);

var _default = DownloadFileCommand;
exports["default"] = _default;