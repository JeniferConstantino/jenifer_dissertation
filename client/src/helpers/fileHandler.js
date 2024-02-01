import {ipfs} from '../../ipfs';
import {Buffer} from 'buffer';
import EncryptionHandler from './EncryptionHandler';
import { IPFS_BASE_URL } from '../../ipfs';
import axios from 'axios';
const crypto = require('crypto-browserify');

class FileHandler {

    //Enum declaration
    static FileType = {
        Image: 'image',
        File: 'file'
    }

    // Encrypts a given file using a given symmetric key 
    static async encryptFileWithSymmetricKey(fileBuffer, symmetricKey) {
        const iv = crypto.randomBytes(16); // Initialization Vector for AES

        const cipher = crypto.createCipheriv('aes-256-cbc', symmetricKey, iv);
        const encryptedFile = Buffer.concat([cipher.update(fileBuffer), cipher.final()]);

        return {encryptedFile, iv};
    }

    // Decrypts a given file using a given symmetric key
    static async decryptFileWithSymmetricKey (fileEncrypted, selectedUser, fileContent) {
        try {
            const encryptedSymmetricKeyBuffer = Buffer.from(fileEncrypted.encSymmetricKey, 'base64');
            const ivBuffer = Buffer.from(fileEncrypted.iv, 'base64');
            const decryptedSymmetricKey = EncryptionHandler.decryptSymmetricKey(encryptedSymmetricKeyBuffer, selectedUser.current.privateKey);

            // Decrypt the file content using the decrypted symmetric key
            const decipher = crypto.createDecipheriv('aes-256-cbc', decryptedSymmetricKey, ivBuffer);
            const decryptedFileBuffer = Buffer.concat([decipher.update(fileContent), decipher.final()]);

            return decryptedFileBuffer;
        } catch (error) {
            console.error("Error decrypting file: ", error);
            throw new Error("Error decrypting file.");
        }        
    }

    // Adds the file to IPFS
    static async addFileToIPFS (fileAsBuffer) {
        const symmetricKey = EncryptionHandler.generateSymmetricKey(); // Encrypts uploaded file using symmetric encryption

        const {encryptedFile, iv} = await FileHandler.encryptFileWithSymmetricKey(fileAsBuffer, symmetricKey);

        const addedFile = await ipfs.add({ content: encryptedFile});
        const fileCID = addedFile.cid.toString();
        return {fileCID, symmetricKey, iv};
    }

    // Gets a file from IPFS
    static async getFileFromIPFS (cid) {
        const response = await axios.get(`${IPFS_BASE_URL}${cid}`, { // Fetch the encrypted file content from IPFS using its CID
            responseType: 'arraybuffer',
        });
        return Buffer.from(response.data);
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