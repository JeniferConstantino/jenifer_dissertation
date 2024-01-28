import {ipfs} from '../ipfs';
import {Buffer} from 'buffer';
const crypto = require('crypto-browserify');
const forge = require('node-forge');

class FileHandler {

    //Enum declaration
    static FileType = {
        Image: 'image',
        File: 'file'
    }

    // Generate a random symmetric key (for each file)
    static generateSymmetricKey() {
        return crypto.randomBytes(32); // it uses AES-256 algorithm 
    }

    // Generate an RSA key pair (assymmetric encryption)
    static generateKeyPair() {
        const rsaKeyPair = forge.pki.rsa.generateKeyPair({bits: 2048});
        const privateKey = forge.pki.privateKeyToPem(rsaKeyPair.privateKey);
        const publicKey = forge.pki.publicKeyToPem(rsaKeyPair.publicKey);
        console.log("privateKey: ", privateKey, " publicKey: ", publicKey);
        return {privateKey, publicKey};
    }

    static encryptSymmetricKey(symmetricKey) {
        // Retrieve RSA public key from localStorage
        const rsaKeyPair = JSON.parse(localStorage.getItem('rsaKeyPair'));
        const rsaPublicKey = rsaKeyPair.publicKey;
        console.log("publicKey to be used in encryption of the symmetric key: ", rsaPublicKey);

        return crypto.publicEncrypt(
            rsaPublicKey,
            Buffer.from(symmetricKey),
        ); 
    }

    // Encrypt the file with the symmetric key 
    static async encryptFileWithSymmetricKey(fileBuffer, symmetricKey) {
        // Initialization Vector for AES
        const iv = crypto.randomBytes(16);

        const cipher = crypto.createCipheriv('aes-256-cbc', symmetricKey, iv);
        const encryptedFile = Buffer.concat([cipher.update(fileBuffer), cipher.final()]);
        
        return encryptedFile;
    }

    // Adds the file to IPFS
    static async addFileToIPFS (fileAsBuffer) {
        const addedFile = await ipfs.add({ content: fileAsBuffer});
        const fileCID = addedFile.cid.toString();
        console.log('File added to IPFS', fileCID);
        return fileCID;
    }

    // Checks if the user already uploaded the file by verifying if there is already a key with the CID value
    static checkFileAlreadyUploaded = (fileCID, ipfsCIDAndType) => {
        let fileImgAlreadyUploaded = ipfsCIDAndType.has(fileCID);
        if(fileImgAlreadyUploaded){
            throw new Error('File already uploaded!');
        }
    }

    // Determines if the file uploaded by the user is an image or a document, and if it has a vlaid extention
    static determineFileType = (fileName) => {
        if(fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || fileName.endsWith('.png') || fileName.endsWith('.gif')){
            return FileHandler.FileType.Image;
        } else if (fileName.endsWith('.docx') || fileName.endsWith('.odt') || fileName.endsWith('.pdf')) {
            return FileHandler.FileType.File;
        } else {
            throw new Error('File not supported. Supported types: .jpg, .jpeg, .png, .gif, .docx, .odt, .pdf');
        }
    }
}

export default FileHandler;