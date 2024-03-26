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

    // Gets the encrypted symmetric key for each user that has download permissions over a file
    async encryptedSymmetricKeys(selectedFile, symmetricKey) {
        // Gets the users that have download permissions of the file to be edited
        const result = await this.fileManager.getUsersWithDownloadPermissionsFile(selectedFile);
        if (!result.success) {
            console.log("Error: ", result.message);
        }
        const usersDonldPermFile = result.resultAddresses;

        // Create a map where the key are the users and the value are the encrypted symmetric keys
        const encryKeysUsers = new Map();

        // Iterate over each user, encrypt the symmetric key with the corresponding public key and store it on the map
        for (const userAddress of usersDonldPermFile) {
            // Gets the user public key
            const res = await this.fileManager.getPubKeyUser(userAddress);
            if (!res.success) {
                console.log("something went wrong while trying to get the users' public key.");
            }
            const userPublicKey = res.resultString

            // Encrypt the symmetric key with teach users' public  key
            let encryptedSymmetricKey = await this.fileManager.encryptSymmetricKey(symmetricKey, userPublicKey).toString('base64');

            // Store in the map the encrypted symmetric key as a value and with user as the key 
            encryKeysUsers.set(userAddress, encryptedSymmetricKey);
        }

        return encryKeysUsers;
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

        // get the encrypted symmetric key for each user that has download permissions over the file to be edited
        let encryKeysUsers = await this.encryptedSymmetricKeys(this.selectedFile, symmetricKey);
        // Solidity doesn't support to receive maps as arguments
        const usersWithDownlodPermSelectFile = Array.from(encryKeysUsers.keys());
        const pubKeyUsersWithDownloadPermSelectFile = Array.from(encryKeysUsers.values());
        
        // Calls the method on the contract responsible for uploading the edited file and changing the state of the previous one
        await this.fileManager.editFileUpl(this.selectedFile, fileEdited, usersWithDownlodPermSelectFile, pubKeyUsersWithDownloadPermSelectFile); 

        // Verifies file correctly added
        var resultGetFile = await this.fileManager.getFileByIpfsCID(fileEdited.ipfsCID, "active");
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