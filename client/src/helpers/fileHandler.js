import {ipfs} from '../../ipfs';
import {Buffer} from 'buffer';
import EncryptionHandler from './EncryptionHandler';
const crypto = require('crypto-browserify');

class FileHandler {

    //Enum declaration
    static FileType = {
        Image: 'image',
        File: 'file'
    }

    static encryptSymmetricKey(symmetricKey, publicKey) {
        return crypto.publicEncrypt(
            publicKey,
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

        // Encrypts uploaded file using symmetric encryption
        const symmetricKey = EncryptionHandler.generateSymmetricKey();
        const encryptFile = await FileHandler.encryptFileWithSymmetricKey(fileAsBuffer, symmetricKey);

        const addedFile = await ipfs.add({ content: encryptFile});
        const fileCID = addedFile.cid.toString();

        return {fileCID, symmetricKey};
    }


    // Decritpts files
    static decryptFile (fileEncrypted, selectedUser) {

        // Decrypt files' symmetric key using the users' private key
        const decryptSymmetricKey = crypto.privateDecrypt(
            {
                key: selectedUser.current.privateKey,
                padding: crypto.constants.RSA_PKCS1_PADDING,
            },
            fileEncrypted.encSymmetricKey
        );

        // Decrypts file using the symmetric key
        const decipher = crypto.createDecipheriv('aes-256-cbc', decryptSymmetricKey, fileEncrypted.iv);
        const decipherFile = Buffer.concat([decipher.update(), decipher.final()]);
    }


    // Checks if the user already uploaded the file by verifying if there is already a key with the CID value
    static checkFileAlreadyUploaded = (fileCID, uploadedFiles) => {
        for (var file of uploadedFiles) {
            if (file.ipfsCID === fileCID) {
                throw new Error('File already uploaded!');
            }
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