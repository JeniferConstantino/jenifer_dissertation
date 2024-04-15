import { FileApp } from '../FileApp.js';
import DropFileCommand from "./DropFileCommand.js";

// Concrete command for uploading a file
class DropUpload extends DropFileCommand {

    constructor(fileUplName, fileAsBuffer, generateSymmetricKey, encryptFileWithSymmetricKey,  addFileToIPFS, generateHash256, getFileByIpfsCID, getPermissionsOverFile, uploadFileUser, encryptSymmetricKey, selectedUserAccount) {
        super(fileAsBuffer, generateSymmetricKey, encryptFileWithSymmetricKey, addFileToIPFS, generateHash256, getFileByIpfsCID, getPermissionsOverFile, selectedUserAccount);
        this.fileUplName = fileUplName;
        this.fileAsBuffer = fileAsBuffer;
        this.uploadFileUser = uploadFileUser;
        this.encryptSymmetricKey = encryptSymmetricKey;
        this.selectedUserAccount = selectedUserAccount;
    }

    async storeFile(symmetricKey, iv, fileHash, fileCID){
        // Prepares the file to be stored
        var fileOwner = this.selectedUserAccount;
        var fileVersion = 0; // 1st upload
        
        let fileUploaded = new FileApp(this.fileUplName, fileVersion, "" , fileOwner, fileCID, iv.toString('base64'), "", fileHash);
        fileUploaded.fileType = FileApp.getFileType(this.fileUplName);
        let encryptedSymmetricKey = this.encryptSymmetricKey(symmetricKey, localStorage.getItem('publicKey'));

        // Associates the current user with the uploaded file 
        await this.uploadFileUser(this.selectedUserAccount, fileUploaded, encryptedSymmetricKey);
        
        return fileUploaded;
    }
}

export default DropUpload;