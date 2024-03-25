import Command from "./Command";
import FileApp from './../FileApp';

// Concrete command for uploading a file
class EditFileCommand extends Command {

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

    async execute(){
        // Encrypt symmetric key
        const symmetricKey = this.fileManager.generateSymmetricKey(); 
        // Encrypts the dropped file 
        const {encryptedFile, iv} = await this.fileManager.encryptFileWithSymmetricKey(this.fileAsBuffer, symmetricKey);
        
        // Add the dropped file to IPFS
        const fileCID = await this.fileManager.addFileToIPFS(encryptedFile);
        console.log('File encrypted and added to IPFS', fileCID);

        // Generates the hash of the dropped file
        const fileHash = await this.fileManager.generateHash256(this.fileAsBuffer);

        // Prepares the file to be stored
        let fileEdited = new FileApp(this.fileUpl.name.toLowerCase().toString(), this.selectedFile.version+1,  this.selectedFile.ipfsCID, this.selectedFile.owner, fileCID, iv.toString('base64'), "active", fileHash);
        fileEdited.fileType = fileEdited.defineFileType(this.fileUpl.name);
        let encryptedSymmetricKey = this.fileManager.encryptSymmetricKey(symmetricKey, localStorage.getItem('publicKey')).toString('base64');

        // Calls the method on the contract responsible for uploading the edited file and changing the state of the previous one
        await this.fileManager.editFileUpl(this.selectedFile, fileEdited, encryptedSymmetricKey); 

        // Verifies file correctly added
        var resultGetFile = await this.fileManager.getFileByIpfsCID(fileEdited.ipfsCID, "active");
        console.log("result in edit: ", resultGetFile);
        if (!resultGetFile.success) {
            console.log("Upload file error: Something went wrong while trying to store the file in the blockchain. result: ", resultGetFile);
            return; 
        }
        // Verifies if the file is uploaded correctly
        var result = await this.fileManager.getPermissionsOverFile(this.fileManager.selectedUser.account, fileEdited.ipfsCID);
        if (!result.success) {
            console.log("Even though the file was stored in the blockchain, something went wrong while trying to associate the user with the file: ", result);
            return; 
        }
        console.log('File edited');

        this.handleFileUploaded("edit");
    }
}

export default EditFileCommand;