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
        
            // Gets the file encrypted symmetric key
            const result = await this.fileManager.getEncSymmetricKeyFileUser(this.fileManager.selectedUser.account, this.selectedFile.ipfsCID);
            if (!result.success) {
                console.log("Something went wrong while trying to get the encrypted symmetric key of the users' file.");
                return;
            }
            const fileUserEncryptedSymmetricKey = result.resultString;
            const encryptedSymmetricKeyBuffer = Buffer.from(fileUserEncryptedSymmetricKey, 'base64');

            // Decrypts the file
            const decryptedFileBuffer = await this.fileManager.decryptFileWithSymmetricKey(this.selectedFile, encryptedSymmetricKeyBuffer, fileContent);
            const blob = new Blob([decryptedFileBuffer]);
            console.log("File Decrypted.");

            // Makes the treatment of the download in the backend and stores on the audit log
            await this.fileManager.downloadFileAudit(this.selectedFile.ipfsCID, this.fileManager.selectedUser.account);
            
            return blob;
        } catch (error) {
        console.error("Error decrypting or downloading file: ", error);
        }
    }
}

export default DownloadFileCommand;
