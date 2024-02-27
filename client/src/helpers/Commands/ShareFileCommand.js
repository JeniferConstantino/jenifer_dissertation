import Command from "./Command";
import {Buffer} from 'buffer';

class ShareFileCommand extends Command {
    constructor(fileManager, selectedFile, permissions, accountUserToShareFileWith){
        super();
        this.fileManager = fileManager;
        this.selectedFile = selectedFile;
        this.permissions = permissions;
        this.accountUserToShareFileWith = accountUserToShareFileWith;
    }

    async execute(){
        // Gets only the selected permissions
        const permissionsArray = Object.entries(this.permissions).filter(([key, value]) => value===true).map(([key, value]) => key);
        
        // If the user is already associated with the file
        const userIsAssociatedWithFile = await this.fileManager.verifyUserAssociatedWithFile(this.accountUserToShareFileWith, this.selectedFile.ipfsCID);
        if (userIsAssociatedWithFile) {
            console.log("It was called 'ShareFileCommand' but the user: ", this.accountUserToShareFileWith, " is already associated with the file: ", this.selectedFile.fileName);
            return;
        }

        // Get the encrypted symmetric key that a user has over a file
        var encSymmetricKey = await this.fileManager.getEncSymmetricKeyFileUser(this.fileManager.selectedUser.account, this.selectedFile.ipfsCID);
        if (encSymmetricKey == null) {
            console.log("something went wrong while trying to get the encrypted symmetric key of the user");
            return;
        }
        // Decrypts symmetric key using the users' private key
        var encSymmetricKeyBuffer = Buffer.from(encSymmetricKey, 'base64');
        var decryptedSymmetricKey = this.fileManager.decryptSymmetricKey(encSymmetricKeyBuffer, this.fileManager.selectedUser.privateKey);
        
        // Get the public key of the user to share file with
        var publicKeyUserToShareFileWith = await this.fileManager.getPubKeyUser(this.accountUserToShareFileWith);
        // Encrypts the symmetric key with the users' public key
        var encryptedSymmetricKeyShared = await this.fileManager.encryptSymmetricKey(decryptedSymmetricKey, publicKeyUserToShareFileWith);

        // Performs the file share
        await this.fileManager.fileShare(this.accountUserToShareFileWith, this.selectedFile.ipfsCID, encryptedSymmetricKeyShared.toString('base64'), permissionsArray);
        
        // Verifies if the file was successfully shared with the user
        var resultUserAssociatedFile = await this.fileManager.verifyUserAssociatedWithFile(this.accountUserToShareFileWith, this.selectedFile.ipfsCID);
        console.log("resultUserAssociatedFile: ", resultUserAssociatedFile);
        if (!resultUserAssociatedFile) {
            console.log("Something went wrong while trying to associate the user with the file.");
        } else {
            console.log("File Shared."); 
        }
    }

}
export default ShareFileCommand;
