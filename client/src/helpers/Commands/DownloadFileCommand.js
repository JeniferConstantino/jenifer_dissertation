import Command from "./Command";
import IPFSManager from '../Managers/IPFSManager';
import EncryptionManager from '../Managers/EncryptionManager';

class DownloadFileCommand extends Command {
    constructor(fileManager, selectedFile){
        super();
        this.fileManager = fileManager;
        this.selectedFile = selectedFile;
    }

    async execute(){
        try {
            // Gets the file from IPFS
            const fileContent = await IPFSManager.getFileFromIPFS(this.selectedFile.ipfsCID);
            console.log("Accessed file in IPFS.");
        
            // Decrypts the file
            const decryptedFileBuffer = await EncryptionManager.decryptFileWithSymmetricKey(this.fileManager.storeFileContract, this.selectedFile, this.fileManager.selectedUser, fileContent);
            const blob = new Blob([decryptedFileBuffer]);
            console.log("File Decrypted.");
            
            // Creates a downloaded link 
            const downloadLink = document.createElement("a");
            downloadLink.href = URL.createObjectURL(blob);
            downloadLink.download = this.selectedFile.fileName;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        } catch (error) {
        console.error("Error decrypting or downloading file: ", error);
        }
    }
}

export default DownloadFileCommand;
