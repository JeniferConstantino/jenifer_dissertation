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

    // Calculates the version of the current file
    async getFileVersion(fileUplName) {
        // get the latest version of a file based on its name, no matter if the file is in the active or deactive state
        const fileLatestVersion = await this.fileManager.getLatestVersionOfFile(fileUplName.toLowerCase().toString());
        const latestVersion = parseInt(fileLatestVersion, 10); // Convert to integer            
        var fileVersion = latestVersion + 1; // gets the file version of the current file
        return fileVersion;
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

        var fileUpld = new FileApp(resultGetFile.file[1], resultGetFile.file[2], resultGetFile.file[3] , resultGetFile.file[4], resultGetFile.file[0], resultGetFile.file[6], resultGetFile.file[7], resultGetFile.file[8]);
        fileUpld.fileType = fileUpld.defineFileType(resultGetFile.file[1]);
        
        var tempUloadedActiveFiles = [...this.uploadedActiveFiles, fileUpld]
        var tempUpdatedUploadedFiles = [...this.uploadedFiles, fileUpld]; // Updates the state with the result
        console.log('File added to the blockchain');

        this.handleFileUploaded(tempUloadedActiveFiles, tempUpdatedUploadedFiles);
    }
}

export default UploadFileCommand;