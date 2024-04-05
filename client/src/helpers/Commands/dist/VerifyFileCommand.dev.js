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

// Concrete command for uploading a file
var VerifyFileCommand =
/*#__PURE__*/
function (_Command) {
  _inherits(VerifyFileCommand, _Command);

  function VerifyFileCommand(fileManager, fileAsBuffer) {
    var _this;

    _classCallCheck(this, VerifyFileCommand);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(VerifyFileCommand).call(this));
    _this.fileManager = fileManager;
    _this.fileAsBuffer = fileAsBuffer;
    return _this;
  }

  _createClass(VerifyFileCommand, [{
    key: "execute",
    value: function execute() {
      var fileHash, validFile;
      return regeneratorRuntime.async(function execute$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return regeneratorRuntime.awrap(this.fileManager.generateHash256(this.fileAsBuffer));

            case 2:
              fileHash = _context.sent;
              _context.next = 5;
              return regeneratorRuntime.awrap(this.fileManager.verifyValidFile(this.fileManager.selectedUser.account, fileHash));

            case 5:
              validFile = _context.sent;

              if (!validFile) {
                _context.next = 10;
                break;
              }

              _context.next = 9;
              return regeneratorRuntime.awrap(this.fileManager.recordFileVerification(this.fileManager.selectedUser.account, fileHash));

            case 9:
              return _context.abrupt("return", true);

            case 10:
              return _context.abrupt("return", false);

            case 11:
            case "end":
              return _context.stop();
          }
        }
      }, null, this);
    }
  }]);

  return VerifyFileCommand;
}(_Command2["default"]);

var _default = VerifyFileCommand;
exports["default"] = _default;