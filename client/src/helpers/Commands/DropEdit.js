import {FileApp} from '../FileApp.js';
import DropFileCommand from "./DropFileCommand.js";

// Concrete command for uploading a file
class DropEdit extends DropFileCommand {

    constructor(fileUplName, selectedFile,  getUsersAssociatedWithFile, getPubKeyUser, encryptSymmetricKey, editFileUpl, fileAsBuffer, generateSymmetricKey, encryptFileWithSymmetricKey, addFileToIPFS, generateHash256, getFileByIpfsCID, getPermissionsOverFile, selectedUserAccount) {
        super(fileAsBuffer, generateSymmetricKey, encryptFileWithSymmetricKey, addFileToIPFS, generateHash256, getFileByIpfsCID, getPermissionsOverFile, selectedUserAccount);
        this.fileUplName = fileUplName;
        this.selectedFile = selectedFile;
        this.getUsersAssociatedWithFile = getUsersAssociatedWithFile;
        this.getPubKeyUser = getPubKeyUser;
        this.encryptSymmetricKey = encryptSymmetricKey;
        this.editFileUpl = editFileUpl;
    }

    // Gets the encrypted symmetric key for each user that has download permissions over a file
    async encryptedSymmetricKeys(selectedFile, symmetricKey) {
        // Gets the users that have download permissions of the file to be edited
        const result = await this.getUsersAssociatedWithFile(selectedFile.ipfsCID);
        if (!result.success) {
            // eslint-disable-next-line security-node/detect-crlf
            console.log("Error: ", result.message);
        }
        const usersDonldPermFile = result.resultAddresses;

        // Create a map where the key are the users and the value are the encrypted symmetric keys
        const encryKeysUsers = new Map();

        // Iterate over each user, encrypt the symmetric key with the corresponding public key and store it on the map
        for (const userAddress of usersDonldPermFile) {
            // Gets the user public key
            const res = await this.getPubKeyUser(userAddress);
            if (!res.success) {
                console.log("something went wrong while trying to get the users public key.");
                return '';
            }
            const userPublicKey = res.resultString;

            // Encrypt the symmetric key with teach users' public  key
            let encryptedSymmetricKey = await this.encryptSymmetricKey(symmetricKey, userPublicKey);

            // Store in the map the encrypted symmetric key as a value and with user as the key 
            encryKeysUsers.set(userAddress, encryptedSymmetricKey.toString('base64'));
        }

        return encryKeysUsers;
    }

    async storeFile(symmetricKey, iv, fileHash, fileCID){
        // Prepares the file to be stored
        let fileEdited = new FileApp(this.fileUplName, this.selectedFile.version+1,  this.selectedFile.ipfsCID, this.selectedFile.owner, fileCID, iv.toString('base64'), "active", fileHash);
        fileEdited.fileType = FileApp.getFileType(this.fileUplName);

        // get the encrypted symmetric key for each user that has download permissions over the file to be edited
        let encryKeysUsers = await this.encryptedSymmetricKeys(this.selectedFile, symmetricKey);
        // Solidity doesn't support to receive maps as arguments
        const usersWithDownlodPermSelectFile = Array.from(encryKeysUsers.keys());
        const pubKeyUsersWithDownloadPermSelectFile = Array.from(encryKeysUsers.values());
        
        // Calls the method on the contract responsible for uploading the edited file and changing the state of the previous one
        await this.editFileUpl(this.selectedFile, fileEdited, usersWithDownlodPermSelectFile, pubKeyUsersWithDownloadPermSelectFile); 
    
        return fileEdited;
    }
}

export default DropEdit;