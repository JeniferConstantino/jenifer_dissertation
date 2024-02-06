import {ipfs} from '../../ipfs';
import {Buffer} from 'buffer';
import EncryptionHandler from './EncryptionHandler';
import { IPFS_BASE_URL } from '../../ipfs';
import FileApp from './FileApp';
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
    static async decryptFileWithSymmetricKey (storeFileContract, fileEncrypted, selectedUser, fileContent) {
        try {
            // Decrypts the symmetric key
            const fileUserEncryptedSymmetricKey = await storeFileContract.current.methods.getEncSymmetricKeyFileUser(selectedUser.current, fileEncrypted).call({from: selectedUser.current.account});
            const encryptedSymmetricKeyBuffer = Buffer.from(fileUserEncryptedSymmetricKey, 'base64');
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

    // Get files from the Blockchain
    static getFilesUploadedBlockchain = async (storeFileContract, selectedUser) => {
            
        var result = await storeFileContract.current.methods.getUserFiles(selectedUser.current.account).call({from: selectedUser.current.account});
    
        // Check if the first element is an array (file details) or not
        let files = [];
        if(result.length != null){
            result.forEach(file => {
                var fileApp = new FileApp(file.fileName, file.owner, file.ipfsCID, file.fileType, file.iv);
                files.push(fileApp);
            });
        }
    
        return files;
    }

    // Stores a file in the blockchain
    static storeFileBlockchain = (fileUpl, symmetricKey, selectedUser, fileCID, iv, storeFileContract) => {
        return new Promise(async (resolve, reject) => {
            // Prepares the file to be stored
            const fileName = fileUpl.name.toLowerCase();
            var fileType = FileHandler.determineFileType(fileName);
            const encryptedSymmetricKey = EncryptionHandler.encryptSymmetricKey(symmetricKey, selectedUser.publicKey); // Encrypt the symmetric key

            let fileUploaded = new FileApp(fileName.toString(), selectedUser.account, fileCID, fileType, iv.toString('base64'));
    
            // Verifies if the file is elegible to be stored
            try {
                var errorUploadingFile = await storeFileContract.current.methods.fileExists(fileUploaded, selectedUser).call({from: selectedUser.account});
                
                if (errorUploadingFile.length === 0) { // The file can be uploaded, no error message was sent
                    const receipt = await storeFileContract.current.methods.uploadFile(fileUploaded, encryptedSymmetricKey.toString('base64'), selectedUser).send({ from: selectedUser.account });

                    const uploadFileEvent = receipt.events["UploadFileResult"];
                    if (uploadFileEvent) {
                        const { success, message } = uploadFileEvent.returnValues;
                        if (success) {
                            resolve({ receipt, fileUploaded })
                        } else {
                            console.log("message: ", message);
                        }
                    } 
                } else {
                    console.log("errorUploadingFile: ", errorUploadingFile);
                }

            } catch (error) {
                console.error("Transaction error: ", error.message);
                console.log("Make sure you haven't uploaded the file before, and that the file name is unique.");
            }
        });
    }

    // Gets the user to share the file with
    static getUserToShareFile = async (nameUserToShare, storeUserContract, selectedUser) => {
        // Verifies if there is a user with the given name
        var user = await storeUserContract.current.methods.getUserByName(nameUserToShare).call({from: selectedUser.current.account});
        if (user.name.length === 0) {
            return null;
        } 
        return user;
    }

    // Shares the file with a given user
    static performFileShare = async (storeFileContract, selectedFile, selectedUser, userToShareFileWith) => {
        // Decrypts the files' symmetric key using the current logged user private key
        var encSymmetricKey = await storeFileContract.current.methods.getEncSymmetricKeyFileUser(selectedUser.current, selectedFile).call({from: selectedUser.current.account});
        var encSymmetricKeyBuffer = Buffer.from(encSymmetricKey, 'base64');
        var decryptedSymmetricKey = EncryptionHandler.decryptSymmetricKey(encSymmetricKeyBuffer, selectedUser.current.privateKey);
        
        // Encrypts the files' symmetric key using the public key of the user to share the file with
        var encryptedSymmetricKeyShared = EncryptionHandler.encryptSymmetricKey(decryptedSymmetricKey, userToShareFileWith.publicKey);
        // Stores the share information in the blockchain
        const receipt = await storeFileContract.current.methods.storeUserHasFile(userToShareFileWith, selectedFile, encryptedSymmetricKeyShared.toString('base64')).send({ from: selectedUser.current.account });
        console.log("File Shared.");
    }
}

export default FileHandler;