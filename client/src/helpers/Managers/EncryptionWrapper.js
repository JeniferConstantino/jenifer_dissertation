import ecies from 'eth-ecies';
import { generateMnemonic, mnemonicToSeedSync } from 'bip39';
import * as ethUtil from 'ethereumjs-util';
import HDKey from 'hdkey';
const crypto = require('crypto-browserify');

class EncryptionWrapper {

    // Generate a random symmetric key (for each file)
    static generateSymmetricKey() {
        return crypto.randomBytes(32); // it uses AES-256 algorithm 
    }

    // Generates a mnemonic to be asscoiated with a user
    static generateMnemonic() {
        return generateMnemonic()
    }

    // Generates a set of keys given a mnemonic
    static generateKeysFromMnemonic(mnemonic) {
        const path = "m/44'/60'/0'/0/0"; // derivation path used by metamask
        const seed = mnemonicToSeedSync(mnemonic);
        const hdkey = HDKey.fromMasterSeed(seed);
        
        const derivedNode = hdkey.derive(path);
        const privateKey = derivedNode.privateKey;
        const publicKey = ethUtil.privateToPublic(privateKey);
        const address = ethUtil.privateToAddress(privateKey);

        console.log("Key Pair generated");
        return {privateKey, publicKey, address};
    }

    static storeLocalSotrage(privateKey, publicKey, address) {
        localStorage.setItem('privateKey', privateKey.toString('hex'));
        localStorage.setItem('publicKey', publicKey.toString('hex'));
        localStorage.setItem('address', address.toString('hex'));
        console.log("Key Pair stored in the local storage");
    }

    // Encrypts a given symmetric key using a given public key
    static encryptSymmetricKey(symmetricKey, publicKey) {
        const storedPublicKey = Buffer.from(publicKey, 'hex');
        const encryptedSymmetricKey = ecies.encrypt(storedPublicKey, Buffer.from(symmetricKey));
        return encryptedSymmetricKey;
    }

    // Decrypts a given symmetric key using a given private key
    static decryptSymmetricKey(encryptedSymmetricKeyBuffer, privateKey) {
        const decryptedSymmetricKey = ecies.decrypt(privateKey, encryptedSymmetricKeyBuffer);
        return decryptedSymmetricKey;
    }

    // Encrypts a given file using a given symmetric key 
    static async encryptFileWithSymmetricKey(fileBuffer, symmetricKey) {
        const iv = crypto.randomBytes(16); // Initialization Vector for AES

        const cipher = crypto.createCipheriv('aes-256-cbc', symmetricKey, iv);
        const encryptedFile = Buffer.concat([cipher.update(fileBuffer), cipher.final()]);

        return {encryptedFile, iv};
    }

    // Decrypts a given file using a given symmetric key
    static async decryptFileWithSymmetricKey (accessControlContract, fileEncrypted, selectedUser, fileContent) {
        try {
            // Decrypts the symmetric key
            const result = await accessControlContract.methods.getEncSymmetricKeyFileUser(selectedUser.account, fileEncrypted.ipfsCID).call({from: selectedUser.account});
            if (!result.success) {
                console.log("Something went wrong while trying to get the encrypted symmetric key of the users' file.");
                return;
            }
            const fileUserEncryptedSymmetricKey = result.resultString;
            const encryptedSymmetricKeyBuffer = Buffer.from(fileUserEncryptedSymmetricKey, 'base64');
            const ivBuffer = Buffer.from(fileEncrypted.iv, 'base64');
            const decryptedSymmetricKey = EncryptionWrapper.decryptSymmetricKey(encryptedSymmetricKeyBuffer, localStorage.getItem('privateKey'));

            // Decrypt the file content using the decrypted symmetric key
            const decipher = crypto.createDecipheriv('aes-256-cbc', decryptedSymmetricKey, ivBuffer);
            const decryptedFileBuffer = Buffer.concat([decipher.update(fileContent), decipher.final()]);

            return decryptedFileBuffer;
        } catch (error) {
            console.error("Error decrypting file: ", error);
            throw new Error("Error decrypting file.");
        }        
    }

    // Hashes the mnemonic using symmetric encryption
    static async hashMnemonicSymmetricEncryption (mnemonic) {
        return crypto.createHash('sha256').update(mnemonic).digest('hex');
    }

    // Generates a hash using SHA-256
    static async generateHash256 (fileAsBuffer) {
        try {
            const hash = crypto.createHash('sha256');
            hash.update(fileAsBuffer);
            const hashHex = hash.digest('hex');
            return hashHex;
        } catch (error) {
            console.error("Error generating hash: ", error);
            throw new Error("Error generating hash.");
        }
    }
}

export default EncryptionWrapper;