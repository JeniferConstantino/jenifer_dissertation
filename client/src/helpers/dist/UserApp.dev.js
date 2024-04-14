"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var UserApp =
/*#__PURE__*/
function () {
  function UserApp(account, userName, mnemonic, publicKey) {
    _classCallCheck(this, UserApp);

    this.account = account; // Address Account in MetaMask - Unique

    this.userName = userName; // Name of the user - unique

    this.mnemonic = mnemonic; // Mnemonic of the user => seed phrase

    this.publicKey = publicKey; // Stores the users' public key
  } // Sees if the user already exist in the app by seeing if the account is already stored in the blockchain


  _createClass(UserApp, null, [{
    key: "getUserWithAccount",
    value: function getUserWithAccount(fileManagerFacadeInstance) {
      var resultUser;
      return regeneratorRuntime.async(function getUserWithAccount$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.prev = 0;
              _context.next = 3;
              return regeneratorRuntime.awrap(fileManagerFacadeInstance.getUser(fileManagerFacadeInstance._selectedAccount.current));

            case 3:
              resultUser = _context.sent;
              return _context.abrupt("return", resultUser);

            case 7:
              _context.prev = 7;
              _context.t0 = _context["catch"](0);
              console.error("Error storing user on the blockchain:", _context.t0);
              throw _context.t0;

            case 11:
            case "end":
              return _context.stop();
          }
        }
      }, null, null, [[0, 7]]);
    } // Sees if the mnemonic corresponds to the user

  }, {
    key: "verifyMnemonic",
    value: function verifyMnemonic(mnemonic, fileManagerFacadeInstance) {
      var userAsscoiatedWithMnemonic;
      return regeneratorRuntime.async(function verifyMnemonic$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return regeneratorRuntime.awrap(fileManagerFacadeInstance.verifyUserAssociatedMnemonic(mnemonic, fileManagerFacadeInstance._selectedAccount.current));

            case 2:
              userAsscoiatedWithMnemonic = _context2.sent;

              if (!userAsscoiatedWithMnemonic) {
                _context2.next = 5;
                break;
              }

              return _context2.abrupt("return", true);

            case 5:
              return _context2.abrupt("return", false);

            case 6:
            case "end":
              return _context2.stop();
          }
        }
      });
    } // Stores the user in the blockchain

  }, {
    key: "storeUserBlockchain",
    value: function storeUserBlockchain(fileManagerFacadeInstance, userName, mnemonic) {
      var _ref, privateKey, publicKey, address, hashedMnemonic, userLogged, resultUserVerification;

      return regeneratorRuntime.async(function storeUserBlockchain$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.prev = 0;
              _context3.next = 3;
              return regeneratorRuntime.awrap(fileManagerFacadeInstance.generateKeysFromMnemonic(mnemonic));

            case 3:
              _ref = _context3.sent;
              privateKey = _ref.privateKey;
              publicKey = _ref.publicKey;
              address = _ref.address;
              _context3.next = 9;
              return regeneratorRuntime.awrap(fileManagerFacadeInstance.storeLocalSotrage(privateKey, publicKey, address));

            case 9:
              _context3.next = 11;
              return regeneratorRuntime.awrap(fileManagerFacadeInstance.hashMnemonicSymmetricEncryption(mnemonic));

            case 11:
              hashedMnemonic = _context3.sent;
              // Because the usernames are going to be case insensitive, this is writing Maria = maria = MARIA and so it goes
              userName = userName.toLowerCase(); // Cretaes the user to be stored

              userLogged = new UserApp(fileManagerFacadeInstance.selectedAccount.current, userName, hashedMnemonic, publicKey.toString('hex')); // Registers the user in the blockchain

              _context3.next = 16;
              return regeneratorRuntime.awrap(fileManagerFacadeInstance.registerUser(userLogged));

            case 16:
              _context3.next = 18;
              return regeneratorRuntime.awrap(fileManagerFacadeInstance.getUser(userLogged.account));

            case 18:
              resultUserVerification = _context3.sent;

              if (!resultUserVerification.success) {
                _context3.next = 22;
                break;
              }

              console.log("Registration - user added in the blockchain.");
              return _context3.abrupt("return", userLogged);

            case 22:
              // eslint-disable-next-line security-node/detect-crlf
              console.log("Something went wrong while trying to register the user: ", resultUserVerification.message);
              return _context3.abrupt("return", null);

            case 26:
              _context3.prev = 26;
              _context3.t0 = _context3["catch"](0);
              console.error("Transaction error: ", _context3.t0.message);
              throw _context3.t0;

            case 30:
            case "end":
              return _context3.stop();
          }
        }
      }, null, null, [[0, 26]]);
    }
  }]);

  return UserApp;
}();

var _default = UserApp;
exports["default"] = _default;