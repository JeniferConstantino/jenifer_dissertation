import { FileApp } from '../FileApp';
import DropFileCommand from "./DropFileCommand";

// Concrete command for uploading a file
class DropUpload extends DropFileCommand {

    constructor(fileManager, fileUplName, fileAsBuffer, handleFileUploaded, uploadedActiveFiles, uploadedFiles) {
        super();
        this.fileManager = fileManager;
        this.fileUplName = fileUplName;
        this.fileAsBuffer = fileAsBuffer;
        this.handleFileUploaded = handleFileUploaded;
        this.uploadedActiveFiles = uploadedActiveFiles;
        this.uploadedFiles = uploadedFiles;
    }

    async storeFile(symmetricKey, iv, fileHash, fileCID){
        // Prepares the file to be stored
        var fileOwner = this.fileManager.selectedUser.account;
        var fileVersion = 0; // 1st upload
        
        let fileUploaded = new FileApp(this.fileUplName, fileVersion, "" , fileOwner, fileCID, iv.toString('base64'), "", fileHash);
        fileUploaded.fileType = FileApp.getFileType(this.fileUplName);
        let encryptedSymmetricKey = this.fileManager.encryptSymmetricKey(symmetricKey, localStorage.getItem('publicKey')).toString('base64');

        // Associates the current user with the uploaded file 
        await this.fileManager.uploadFileUser(this.fileManager.selectedUser.account, fileUploaded, encryptedSymmetricKey);
        
        return fileUploaded;
    }
}

export default DropUpload;