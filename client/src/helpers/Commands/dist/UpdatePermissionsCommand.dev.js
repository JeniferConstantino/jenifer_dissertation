"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _Command2 = _interopRequireDefault(require("./Command"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var UpdatePermissionsCommand =
/*#__PURE__*/
function (_Command) {
  _inherits(UpdatePermissionsCommand, _Command);

  function UpdatePermissionsCommand(fileManager, selectedFile, permissions, accountUserToShareFileWith) {
    var _this;

    _classCallCheck(this, UpdatePermissionsCommand);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(UpdatePermissionsCommand).call(this));
    _this.fileManager = fileManager;
    _this.selectedFile = selectedFile;
    _this.permissions = permissions;
    _this.accountUserToShareFileWith = accountUserToShareFileWith;
    return _this;
  }

  _createClass(UpdatePermissionsCommand, [{
    key: "arraysHaveSameContent",
    value: function arraysHaveSameContent(arr1, arr2) {
      var copyArr1 = arr1.slice();
      var copyArr2 = arr2.slice(); // Sort the arrays to ensure elements are in the same order

      copyArr1.sort();
      copyArr2.sort(); // Check if each element in arr1 exists in arr2

      for (var i = 0; i < copyArr1.length; i++) {
        if (copyArr1[i] !== copyArr2[i]) {
          return false;
        }
      } // If all elements match, return true


      return true;
    }
  }, {
    key: "execute",
    value: function execute() {
      var permissionsArray, userIsAssociatedWithFile, result, userAssociatedFile;
      return regeneratorRuntime.async(function execute$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.prev = 0;
              // Gets only the selected permissions
              permissionsArray = Object.entries(this.permissions).filter(function (_ref) {
                var _ref2 = _slicedToArray(_ref, 2),
                    key = _ref2[0],
                    value = _ref2[1];

                return value === true;
              }).map(function (_ref3) {
                var _ref4 = _slicedToArray(_ref3, 2),
                    key = _ref4[0],
                    value = _ref4[1];

                return key;
              }); // If the user is already associated with the file

              _context.next = 4;
              return regeneratorRuntime.awrap(this.fileManager.verifyUserAssociatedWithFile(this.accountUserToShareFileWith, this.selectedFile.ipfsCID));

            case 4:
              userIsAssociatedWithFile = _context.sent;

              if (userIsAssociatedWithFile) {
                _context.next = 8;
                break;
              }

              console.log("It was called 'UpdatePermissionsCommand' but the user: ", this.accountUserToShareFileWith, " is not associated with the file: ", this.selectedFile.fileName);
              return _context.abrupt("return");

            case 8:
              if (!(permissionsArray.length !== 0)) {
                _context.next = 22;
                break;
              }

              _context.next = 11;
              return regeneratorRuntime.awrap(this.fileManager.updateUserFilePermissions(this.accountUserToShareFileWith, this.selectedFile.ipfsCID, permissionsArray));

            case 11:
              _context.next = 13;
              return regeneratorRuntime.awrap(this.fileManager.getPermissionsOverFile(this.accountUserToShareFileWith, this.selectedFile.ipfsCID));

            case 13:
              result = _context.sent;

              if (this.arraysHaveSameContent(result.resultStrings, permissionsArray)) {
                _context.next = 19;
                break;
              }

              console.log("Something went wrong while trying to associate the user with the file.");
              return _context.abrupt("return");

            case 19:
              console.log("File Shared.");

            case 20:
              _context.next = 28;
              break;

            case 22:
              _context.next = 24;
              return regeneratorRuntime.awrap(this.fileManager.removeUserFileAssociation(this.accountUserToShareFileWith, this.selectedFile.ipfsCID));

            case 24:
              _context.next = 26;
              return regeneratorRuntime.awrap(this.fileManager.verifyUserAssociatedWithFile(this.accountUserToShareFileWith, this.selectedFile.ipfsCID));

            case 26:
              userAssociatedFile = _context.sent;

              if (userAssociatedFile) {
                console.log("Something went wrong while trying to remove the relationship between the user and the file.");
              } else {
                console.log("Relationship removed");
              }

            case 28:
              _context.next = 33;
              break;

            case 30:
              _context.prev = 30;
              _context.t0 = _context["catch"](0);
              console.log("ERROR: ", _context.t0);

            case 33:
            case "end":
              return _context.stop();
          }
        }
      }, null, this, [[0, 30]]);
    }
  }]);

  return UpdatePermissionsCommand;
}(_Command2["default"]);

var _default = UpdatePermissionsCommand;
exports["default"] = _default;