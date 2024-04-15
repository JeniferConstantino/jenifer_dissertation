import Command from "./Command.js";

class DownloadFileCommand extends Command {
    constructor(selectedUserAccount, selectedFile, getFileFromIPFS, getEncSymmetricKeyFileUser, decryptFileWithSymmetricKey, downloadFileAudit){
        super();
        this.selectedUserAccount = selectedUserAccount;
        this.selectedFile = selectedFile;
        this.getFileFromIPFS = getFileFromIPFS;
        this.getEncSymmetricKeyFileUser = getEncSymmetricKeyFileUser;
        this.decryptFileWithSymmetricKey = decryptFileWithSymmetricKey;
        this.downloadFileAudit = downloadFileAudit;
    }

    async execute(){
        try {
            // Gets the file from IPFS
            const fileContent = await this.getFileFromIPFS(this.selectedFile.ipfsCID);
            console.log("Accessed file in IPFS.");
        
            // Gets the file encrypted symmetric key
            const result = await this.getEncSymmetricKeyFileUser(this.selectedUserAccount, this.selectedFile.ipfsCID);
            if (!result.success) {
                console.log("Something went wrong while trying to get the encrypted symmetric key of the users file.");
                return;
            }
            const fileUserEncryptedSymmetricKey = result.resultString;
            const encryptedSymmetricKeyBuffer = Buffer.from(fileUserEncryptedSymmetricKey, 'base64');

            // Decrypts the file
            const decryptedFileBuffer = await this.decryptFileWithSymmetricKey(this.selectedFile, encryptedSymmetricKeyBuffer, fileContent);
            const blob = new Blob([decryptedFileBuffer]);
            console.log("File Decrypted.");

            // Makes the treatment of the download in the backend and stores on the audit log
            await this.downloadFileAudit(this.selectedFile.ipfsCID, this.selectedUserAccount);
            
            return blob;
        } catch (error) {
            console.error("Error decrypting or downloading file: ", error);
        }
    }
}

export default DownloadFileCommand;
