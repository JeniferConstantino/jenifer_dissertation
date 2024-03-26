import Command from "./Command";
import FileApp from './../FileApp';

// Concrete command for uploading a file
class UploadFileCommand extends Command {

    constructor(fileManager, fileUpl, fileAsBuffer, handleFileUploaded, uploadedActiveFiles, uploadedFiles) {
        super();
        this.fileManager = fileManager;
        this.fileUpl = fileUpl;
        this.fileAsBuffer = fileAsBuffer;
        this.handleFileUploaded = handleFileUploaded;
        this.uploadedActiveFiles = uploadedActiveFiles;
        this.uploadedFiles = uploadedFiles;
    }

    async execute(){
        // Generate symmetric key
        const symmetricKey = this.fileManager.generateSymmetricKey(); 
        // Encrypts uploaded file 
        const {encryptedFile, iv} = await this.fileManager.encryptFileWithSymmetricKey(this.fileAsBuffer, symmetricKey);
        
        // Add the file to IPFS
        const fileCID = await this.fileManager.addFileToIPFS(encryptedFile);
        console.log('File encrypted and added to IPFS', fileCID);

        // Generates the hash of the file
        const fileHash = await this.fileManager.generateHash256(this.fileAsBuffer);

        var fileOwner = this.fileManager.selectedUser.account;
        var fileVersion = 0; // 1st upload

        // Prepares the file to be stored
        let fileUploaded = new FileApp(this.fileUpl.name.toLowerCase().toString(), fileVersion, "" , fileOwner, fileCID, iv.toString('base64'), "", fileHash);
        fileUploaded.fileType = fileUploaded.defineFileType(this.fileUpl.name);
        let encryptedSymmetricKey = this.fileManager.encryptSymmetricKey(symmetricKey, localStorage.getItem('publicKey')).toString('base64');

        // Associates the current user with the uploaded file 
        await this.fileManager.uploadFileUser(this.fileManager.selectedUser.account, fileUploaded, encryptedSymmetricKey);
        
        // Verifies file correctly added
        var resultGetFile = await this.fileManager.getFileByIpfsCID(fileUploaded.ipfsCID, "active");
        console.log("result in upload: ", resultGetFile);
        if (!resultGetFile.success) {
            console.log("Upload file error: Something went wrong while trying to store the file in the blockchain. result: ", resultGetFile);
            return; 
        }
        // Verifies if the file is uploaded correctly
        var result = await this.fileManager.getPermissionsOverFile(this.fileManager.selectedUser.account, fileUploaded.ipfsCID);
        if (!result.success) {
            console.log("Even though the file was stored in the blockchain, something went wrong while trying to associate the user with the file: ", result);
            return; 
        }        
        console.log('File added to the blockchain');

        this.handleFileUploaded("upload");
    }
}

export default UploadFileCommand;