import Command from "./Command";

// Concrete command for uploading a file
class DropFileCommand extends Command {

    constructor(fileManager, fileUpl, selectedFile, fileAsBuffer, handleFileUploaded, uploadedActiveFiles, uploadedFiles) {
        super();
        this.fileManager = fileManager;
        this.fileUpl = fileUpl;
        this.selectedFile = selectedFile;
        this.fileAsBuffer = fileAsBuffer;
        this.handleFileUploaded = handleFileUploaded;
        this.uploadedActiveFiles = uploadedActiveFiles;
        this.uploadedFiles = uploadedFiles;
    }

    // Abstract method - hook method
    async storeFile() {
        throw new Error('Method uploadFileAndHandleResult must be implemented by subclasses');
    }

    async execute(){
        // Generate symmetric key
        const symmetricKey = this.fileManager.generateSymmetricKey(); 
        // Encrypts the dropped file 
        const {encryptedFile, iv} = await this.fileManager.encryptFileWithSymmetricKey(this.fileAsBuffer, symmetricKey);
        
        // Add the dropped file to IPFS
        const fileCID = await this.fileManager.addFileToIPFS(encryptedFile);
        console.log('File encrypted and added to IPFS', fileCID);

        // Generates the hash of the dropped file
        const fileHash = await this.fileManager.generateHash256(this.fileAsBuffer);

        // Stores the file in the blockchain
        const storedFile = await this.storeFile(symmetricKey, iv, fileHash, fileCID);
        
        // Verifies file correctly added
        var resultGetFile = await this.fileManager.getFileByIpfsCID(storedFile.ipfsCID, "active");
        if (!resultGetFile.success) {
            console.log("Upload file error: Something went wrong while trying to store the file in the blockchain. result: ", resultGetFile);
            return; 
        }
        // Verifies if the file is uploaded correctly
        var result = await this.fileManager.getPermissionsOverFile(this.fileManager.selectedUser.account, storedFile.ipfsCID);
        if (!result.success) {
            console.log("Even though the file was stored in the blockchain, something went wrong while trying to associate the user with the file: ", result);
            return; 
        }
        console.log('Action performed');
    }
}

export default DropFileCommand;