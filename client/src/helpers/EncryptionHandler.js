const crypto = require('crypto-browserify');
const forge = require('node-forge');

class EncryptionHandler {

    // Generate an RSA key pair (assymmetric encryption)
    static generateKeyPair() {
        const rsaKeyPair = forge.pki.rsa.generateKeyPair({bits: 2048});
        const privateKey = forge.pki.privateKeyToPem(rsaKeyPair.privateKey);
        const publicKey = forge.pki.publicKeyToPem(rsaKeyPair.publicKey);
        return {privateKey, publicKey};
    }
    
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


}

export default EncryptionHandler;