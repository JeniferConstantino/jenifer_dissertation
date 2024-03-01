import Command from "./Command";

class DownloadFileCommand extends Command {
    constructor(fileManager, selectedFile){
        super();
        this.fileManager = fileManager;
        this.selectedFile = selectedFile;
    }

    async execute(){
        try {
            // Gets the file from IPFS
            const fileContent = await this.fileManager.getFileFromIPFS(this.selectedFile.ipfsCID);
            console.log("Accessed file in IPFS.");
        
            // Decrypts the file
            const decryptedFileBuffer = await this.fileManager.decryptFileWithSymmetricKey(this.fileManager.accessControlContract, this.selectedFile, this.fileManager.selectedUser, fileContent);
            const blob = new Blob([decryptedFileBuffer]);
            console.log("File Decrypted.");

            // Makes the treatment of the download in the backend and stores on the audit log
            await this.fileManager.downloadFileAudit(this.selectedFile.ipfsCID, this.fileManager.selectedUser.account);
            
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
