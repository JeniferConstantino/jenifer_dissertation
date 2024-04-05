"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _ethEcies = _interopRequireDefault(require("eth-ecies"));

var _bip = require("bip39");

var ethUtil = _interopRequireWildcard(require("ethereumjs-util"));

var _hdkey = _interopRequireDefault(require("hdkey"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var crypto = require('crypto-browserify');

var EncryptionWrapper =
/*#__PURE__*/
function () {
  function EncryptionWrapper() {
    _classCallCheck(this, EncryptionWrapper);
  }

  _createClass(EncryptionWrapper, null, [{
    key: "generateSymmetricKey",
    // Generate a random symmetric key (for each file)
    value: function generateSymmetricKey() {
      return crypto.randomBytes(32); // it uses AES-256 algorithm 
    } // Generates a mnemonic to be asscoiated with a user

  }, {
    key: "generateMnemonic",
    value: function generateMnemonic() {
      return (0, _bip.generateMnemonic)();
    } // Generates a set of keys given a mnemonic

  }, {
    key: "generateKeysFromMnemonic",
    value: function generateKeysFromMnemonic(mnemonic) {
      var path = "m/44'/60'/0'/0/0"; // derivation path used by metamask

      var seed = (0, _bip.mnemonicToSeedSync)(mnemonic);

      var hdkey = _hdkey["default"].fromMasterSeed(seed);

      var derivedNode = hdkey.derive(path);
      var privateKey = derivedNode.privateKey;
      var publicKey = ethUtil.privateToPublic(privateKey);
      var address = ethUtil.privateToAddress(privateKey);
      console.log("Key Pair generated");
      return {
        privateKey: privateKey,
        publicKey: publicKey,
        address: address
      };
    }
  }, {
    key: "storeLocalSotrage",
    value: function storeLocalSotrage(privateKey, publicKey, address) {
      localStorage.setItem('privateKey', privateKey.toString('hex'));
      localStorage.setItem('publicKey', publicKey.toString('hex'));
      localStorage.setItem('address', address.toString('hex'));
      console.log("Key Pair stored in the local storage");
    } // Encrypts a single symmetric key using a given public key

  }, {
    key: "encryptSymmetricKey",
    value: function encryptSymmetricKey(symmetricKeys, publicKey) {
      var storedPublicKey = Buffer.from(publicKey, 'hex');

      var encryptedSymmetricKey = _ethEcies["default"].encrypt(storedPublicKey, Buffer.from(symmetricKeys));

      return encryptedSymmetricKey.toString('base64');
    } // Encrypts symmetric keys using a given public key

  }, {
    key: "encryptSymmetricKeys",
    value: function encryptSymmetricKeys(symmetricKeys, publicKey) {
      var encSymmetricKeys = [];
      var storedPublicKey = Buffer.from(publicKey, 'hex');

      for (var i = 0; i < symmetricKeys.length; i++) {
        var encryptedSymmetricKey = _ethEcies["default"].encrypt(storedPublicKey, Buffer.from(symmetricKeys[i]));

        encSymmetricKeys.push(encryptedSymmetricKey.toString('base64'));
      }

      return encSymmetricKeys;
    } // Decrypts a given symmetric key using a given private key

  }, {
    key: "decryptSymmetricKey",
    value: function decryptSymmetricKey(encryptedSymmetricKeyBuffer, privateKey) {
      var decryptedSymmetricKey = _ethEcies["default"].decrypt(privateKey, encryptedSymmetricKeyBuffer);

      return decryptedSymmetricKey;
    } // Decrypts a given group of symmetric keys using a given private key

  }, {
    key: "decryptSymmetricKeys",
    value: function decryptSymmetricKeys(encSymmetricKeys, privateKey) {
      var decSymmetricKeys = [];

      for (var i = 0; i < encSymmetricKeys.length; i++) {
        var encSymmetricKeyBuffer = Buffer.from(encSymmetricKeys[i], 'base64');

        var decSymKey = _ethEcies["default"].decrypt(privateKey, encSymmetricKeyBuffer);

        decSymmetricKeys.push(decSymKey);
      }

      return decSymmetricKeys;
    } // Encrypts a given file using a given symmetric key 

  }, {
    key: "encryptFileWithSymmetricKey",
    value: function encryptFileWithSymmetricKey(fileBuffer, symmetricKey) {
      var iv, cipher, encryptedFile;
      return regeneratorRuntime.async(function encryptFileWithSymmetricKey$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              iv = crypto.randomBytes(16); // Initialization Vector for AES

              cipher = crypto.createCipheriv('aes-256-cbc', symmetricKey, iv);
              encryptedFile = Buffer.concat([cipher.update(fileBuffer), cipher["final"]()]);
              return _context.abrupt("return", {
                encryptedFile: encryptedFile,
                iv: iv
              });

            case 4:
            case "end":
              return _context.stop();
          }
        }
      });
    } // Decrypts a given file using a given symmetric key

  }, {
    key: "decryptFileWithSymmetricKey",
    value: function decryptFileWithSymmetricKey(fileEncrypted, encryptedSymmetricKeyBuffer, fileContent) {
      var ivBuffer, decryptedSymmetricKey, decipher, decryptedFileBuffer;
      return regeneratorRuntime.async(function decryptFileWithSymmetricKey$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.prev = 0;
              // Decrypts the symmetric key
              ivBuffer = Buffer.from(fileEncrypted.iv, 'base64');
              decryptedSymmetricKey = EncryptionWrapper.decryptSymmetricKey(encryptedSymmetricKeyBuffer, localStorage.getItem('privateKey')); // Decrypt the file content using the decrypted symmetric key

              decipher = crypto.createDecipheriv('aes-256-cbc', decryptedSymmetricKey, ivBuffer);
              decryptedFileBuffer = Buffer.concat([decipher.update(fileContent), decipher["final"]()]);
              return _context2.abrupt("return", decryptedFileBuffer);

            case 8:
              _context2.prev = 8;
              _context2.t0 = _context2["catch"](0);
              console.error("Error decrypting file: ", _context2.t0);
              throw new Error("Error decrypting file.");

            case 12:
            case "end":
              return _context2.stop();
          }
        }
      }, null, null, [[0, 8]]);
    } // Hashes the mnemonic using symmetric encryption

  }, {
    key: "hashMnemonicSymmetricEncryption",
    value: function hashMnemonicSymmetricEncryption(mnemonic) {
      return regeneratorRuntime.async(function hashMnemonicSymmetricEncryption$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              return _context3.abrupt("return", crypto.createHash('sha256').update(mnemonic).digest('hex'));

            case 1:
            case "end":
              return _context3.stop();
          }
        }
      });
    } // Generates a hash using SHA-256

  }, {
    key: "generateHash256",
    value: function generateHash256(fileAsBuffer) {
      var hash, hashHex;
      return regeneratorRuntime.async(function generateHash256$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _context4.prev = 0;
              hash = crypto.createHash('sha256');
              hash.update(fileAsBuffer);
              hashHex = hash.digest('hex');
              return _context4.abrupt("return", hashHex);

            case 7:
              _context4.prev = 7;
              _context4.t0 = _context4["catch"](0);
              console.error("Error generating hash: ", _context4.t0);
              throw new Error("Error generating hash.");

            case 11:
            case "end":
              return _context4.stop();
          }
        }
      }, null, null, [[0, 7]]);
    }
  }]);

  return EncryptionWrapper;
}();

var _default = EncryptionWrapper;
exports["default"] = _default;