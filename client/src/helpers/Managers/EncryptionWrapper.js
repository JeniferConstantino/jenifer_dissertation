const crypto = require('crypto-browserify');
const forge = require('node-forge');

class EncryptionWrapper {

    // Generate a random symmetric key (for each file)
    static generateSymmetricKey() {
        return crypto.randomBytes(32); // it uses AES-256 algorithm 
    }

    // Encrypts a given symmetric key using a given public key
    static encryptSymmetricKey(symmetricKey, publicKey) {
        return crypto.publicEncrypt(
            {
                key: publicKey,
                padding: crypto.constants.RSA_PKCS1_PADDING,
            },
            Buffer.from(symmetricKey),
        ); 
    }

    // Decrypts a given symmetric key using a given private key
    static decryptSymmetricKey(encryptedSymmetricKeyBuffer, privateKey) {
        return crypto.privateDecrypt(
            {
                key: privateKey,
                padding: crypto.constants.RSA_PKCS1_PADDING,
            },
            encryptedSymmetricKeyBuffer
        );
    }

    // Generate an RSA key pair (assymmetric encryption)
    static generateKeyPair() {
        const rsaKeyPair = forge.pki.rsa.generateKeyPair({bits: 2048});
        const privateKey = forge.pki.privateKeyToPem(rsaKeyPair.privateKey);
        const publicKey = forge.pki.publicKeyToPem(rsaKeyPair.publicKey);
        return {privateKey, publicKey};
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
            const decryptedSymmetricKey = EncryptionWrapper.decryptSymmetricKey(encryptedSymmetricKeyBuffer, selectedUser.privateKey);

            // Decrypt the file content using the decrypted symmetric key
            const decipher = crypto.createDecipheriv('aes-256-cbc', decryptedSymmetricKey, ivBuffer);
            const decryptedFileBuffer = Buffer.concat([decipher.update(fileContent), decipher.final()]);

            return decryptedFileBuffer;
        } catch (error) {
            console.error("Error decrypting file: ", error);
            throw new Error("Error decrypting file.");
        }        
    }
}

export default EncryptionWrapper;