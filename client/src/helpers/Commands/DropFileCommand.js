import Command from "./Command.js";

// Concrete command for uploading a file
class DropFileCommand extends Command {

    constructor(fileAsBuffer, generateSymmetricKey, encryptFileWithSymmetricKey, addFileToIPFS, generateHash256, getFileByIpfsCID, getPermissionsOverFile, selectedUserAccount) {
        super();
        this.fileAsBuffer = fileAsBuffer;
        this.generateSymmetricKey = generateSymmetricKey;
        this.encryptFileWithSymmetricKey = encryptFileWithSymmetricKey;
        this.addFileToIPFS = addFileToIPFS;
        this.generateHash256 = generateHash256;
        this.getFileByIpfsCID = getFileByIpfsCID;
        this.getPermissionsOverFile = getPermissionsOverFile;
        this.selectedUserAccount = selectedUserAccount;
    }

    // Abstract method - hook method
    async storeFile() {
        throw new Error('Method uploadFileAndHandleResult must be implemented by subclasses');
    }

    async execute(){
        try {
            // Generate symmetric key
            const symmetricKey = this.generateSymmetricKey(); 
            // Encrypts the dropped file 
            const {encryptedFile, iv} = await this.encryptFileWithSymmetricKey(this.fileAsBuffer, symmetricKey);

            // Add the dropped file to IPFS
            const fileCID = await this.addFileToIPFS(encryptedFile);
            console.log('File encrypted and added to IPFS');

            // Generates the hash of the dropped file
            const fileHash = await this.generateHash256(this.fileAsBuffer);

            // Stores the file in the blockchain
            const storedFile = await this.storeFile(symmetricKey, iv, fileHash, fileCID);

            // Verifies file correctly added
            var resultGetFile = await this.getFileByIpfsCID(storedFile.ipfsCID, "active");
            if (!resultGetFile.success) {
                console.log("Upload file error: Something went wrong while trying to store the file in the blockchain. Ensure you haven't reached session timeout.");
                return; 
            }
            // Verifies if the file is uploaded correctly
            var result = await this.getPermissionsOverFile(this.selectedUserAccount, storedFile.ipfsCID);
            if (!result.success) {
                console.log("Even though the file was stored in the blockchain, something went wrong while trying to associate the user with the file. Ensure you haven't reached session timeout.");
                return; 
            }
            console.log('Action performed');
        } catch (error) {
            // eslint-disable-next-line security-node/detect-crlf
            console.log('Error storing the file:', error.message);
            return;
        }
    }
}

export default DropFileCommand;