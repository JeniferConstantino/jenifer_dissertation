import Command from "./Command";
import FileApp from './../FileApp';

// Concrete command for uploading a file
class UploadFileCommand extends Command {

    constructor(fileManager, fileUpl, fileAsBuffer, handleFileUploaded, uploadedFiles) {
        super();
        this.fileManager = fileManager;
        this.fileUpl = fileUpl;
        this.fileAsBuffer = fileAsBuffer;
        this.handleFileUploaded = handleFileUploaded;
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

        // Prepares the file to be stored
        let fileUploaded = new FileApp(this.fileUpl.name.toLowerCase().toString(), this.fileManager.selectedUser.account, fileCID, iv.toString('base64'));
        fileUploaded.fileType = fileUploaded.defineFileType(this.fileUpl.name);
        let encryptedSymmetricKey = this.fileManager.encryptSymmetricKey(symmetricKey, this.fileManager.selectedUser.publicKey).toString('base64');
        
        // Verifies if the user already has a file with the same name
        var isUserAsscoiatedFile = await this.fileManager.verifyUserAssociatedWithFile(this.fileManager.selectedUser.account, fileUploaded.ipfsCID);
        if (isUserAsscoiatedFile) {
            console.log("User: ", this.fileManager.selectedUser.userName , " already associated with the file: ", fileUploaded.fileName);
            return;
        }

        // Adds the file to the blockchain
        await this.fileManager.addFile(fileUploaded);
        // Verifies file correctly added
        var result = await this.fileManager.getFileByIpfsCID(fileUploaded.ipfsCID);
        if (!result.success) {
            console.log("Upload file error: Something went wrong while trying to store the file in the blockchain.");
            return; 
        }

        // Associates the current user with the uploaded file 
        await this.fileManager.associatedUserFile(this.fileManager.selectedUser.account, fileUploaded.ipfsCID, encryptedSymmetricKey);
        // Verifier file uploaded correctly
        result = await this.fileManager.getPermissionsOverFile(this.fileManager.selectedUser.account, fileUploaded.ipfsCID);
        if (!result.success) {
            console.log("Even though the file was stored in the blockchain, something went wrong while trying to associate the user with the file: ", result);
            return; 
        }

        var tempUpdatedUploadedFiles = [...this.uploadedFiles, fileUploaded]; // Updates the state with the result
        console.log('File added to the blockchain');
        this.handleFileUploaded(tempUpdatedUploadedFiles);
    }
}

export default UploadFileCommand;