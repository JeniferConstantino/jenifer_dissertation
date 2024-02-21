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
        // Encrypts and adds file to IPFS
        const {fileCID, symmetricKey, iv} = await this.fileManager.addFileToIPFS(this.fileAsBuffer);
        console.log('File encrypted and added to IPFS', fileCID);

        // Prepares the file to be stored
        let fileUploaded = new FileApp(this.fileUpl.name.toLowerCase().toString(), this.fileManager.selectedUser.account, fileCID, iv.toString('base64'));
        fileUploaded.fileType = fileUploaded.defineFileType(this.fileUpl.name);

        // Adds the file to the blockchain
        this.fileManager.storeFileBlockchain(fileUploaded, symmetricKey, this.fileManager.selectedUser, this.fileManager.accessControlContract).then(({ status }) => {
            if (status) {
                var tempUpdatedUploadedFiles = [...this.uploadedFiles, fileUploaded]; // Updates the state with the result
                console.log('File added to the blockchain');
                this.handleFileUploaded(tempUpdatedUploadedFiles);
            } else {
                console.log("Something went wrong when trying to upload the file to the blockchain: ", status);       
            }
        }).catch(err => {
            console.log(err);
        })
    }
}

export default UploadFileCommand;