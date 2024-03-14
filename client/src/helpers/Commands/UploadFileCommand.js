import Command from "./Command";
import FileApp from './../FileApp';

// Concrete command for uploading a file
class UploadFileCommand extends Command {

    constructor(fileManager, fileVersion, fileUpl, fileAsBuffer, handleFileUploaded, uploadedActiveFiles, uploadedFiles) {
        super();
        this.fileManager = fileManager;
        this.fileUpl = fileUpl;
        this.fileVersion = fileVersion;
        this.fileAsBuffer = fileAsBuffer;
        this.handleFileUploaded = handleFileUploaded;
        this.uploadedActiveFiles = uploadedActiveFiles;
        this.uploadedFiles = uploadedFiles;
    }

    async execute(){
        // Encrypt symmetric key
        const symmetricKey = this.fileManager.generateSymmetricKey(); 
        // Encrypts uploaded file 
        const {encryptedFile, iv} = await this.fileManager.encryptFileWithSymmetricKey(this.fileAsBuffer, symmetricKey);
        
        // Add the file to IPFS
        const fileCID = await this.fileManager.addFileToIPFS(encryptedFile);
        console.log('File encrypted and added to IPFS', fileCID);

        // Generates the hash of the file
        const fileHash = await this.fileManager.generateHash256(this.fileAsBuffer);

        var fileOwner = this.fileManager.selectedUser.account;
        // If true => re-upload
        if(this.fileVersion !== 0){
            // get the latest version of a file based on its name, no matter if the file is in the active or deactive state
            const fileLatestVersion = await this.fileManager.getLatestVersionOfFile(this.fileUpl.name.toLowerCase().toString());
            const latestVersion = parseInt(fileLatestVersion, 10); // Convert to integer            
            this.fileVersion = latestVersion + 1; // updates the version of the current file by incrementing 1

            // gets the file owner of the original file
            fileOwner = await this.fileManager.getFileOwner(this.fileUpl.name.toLowerCase().toString());
        }

        // Prepares the file to be stored
        let fileUploaded = new FileApp(this.fileUpl.name.toLowerCase().toString(), this.fileVersion,  fileOwner, fileCID, iv.toString('base64'), "", fileHash);
        fileUploaded.fileType = fileUploaded.defineFileType(this.fileUpl.name);
        let encryptedSymmetricKey = this.fileManager.encryptSymmetricKey(symmetricKey, this.fileManager.selectedUser.publicKey).toString('base64');

        // Associates the current user with the uploaded file 
        await this.fileManager.uploadFileUser(this.fileManager.selectedUser.account, fileUploaded, encryptedSymmetricKey);
        
        // Verifies file correctly added
        var result = await this.fileManager.getFileByIpfsCID(fileUploaded.ipfsCID, "active");
        console.log("result in upload: ", result);
        if (!result.success) {
            console.log("Upload file error: Something went wrong while trying to store the file in the blockchain. result: ", result);
            return; 
        }
        // Verifies if the file is uploaded correctly
        result = await this.fileManager.getPermissionsOverFile(this.fileManager.selectedUser.account, fileUploaded.ipfsCID);
        if (!result.success) {
            console.log("Even though the file was stored in the blockchain, something went wrong while trying to associate the user with the file: ", result);
            return; 
        }

        var tempUloadedActiveFiles = [...this.uploadedActiveFiles, fileUploaded]
        var tempUpdatedUploadedFiles = [...this.uploadedFiles, fileUploaded]; // Updates the state with the result
        console.log('File added to the blockchain');

        this.handleFileUploaded(tempUloadedActiveFiles, tempUpdatedUploadedFiles);
    }
}

export default UploadFileCommand;