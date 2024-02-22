import Command from "./Command";
import {Buffer} from 'buffer';


class ShareFileCommand extends Command {
    constructor(fileManager, selectedFile, permissions, userToShareFileWith){
        super();
        this.fileManager = fileManager;
        this.selectedFile = selectedFile;
        this.permissions = permissions;
        this.userToShareFileWith = userToShareFileWith;
    }

    async execute(){
        // Gets only the selected permissions
        const permissionsArray = Object.entries(this.permissions).filter(([key, value]) => value===true).map(([key, value]) => key);
        
        // Decrypts the files' symmetric key using the current logged user private key
        var result = await this.fileManager.accessControlContract.methods.getEncSymmetricKeyFileUser(this.fileManager.selectedUser, this.selectedFile).call({from: this.fileManager.selectedUser.account});
        if(!result.success){
            console.log("something went wrong while trying to get the encrypted symmetric key of the user");
            return;
        }
        var encSymmetricKey = result.encSymmetricKey;
        var encSymmetricKeyBuffer = Buffer.from(encSymmetricKey, 'base64');
        var decryptedSymmetricKey = this.fileManager.decryptSymmetricKey(encSymmetricKeyBuffer, this.fileManager.selectedUser.privateKey);
        
        // Encrypts the files' symmetric key using the public key of the user to share the file with
        var encryptedSymmetricKeyShared = this.fileManager.encryptSymmetricKey(decryptedSymmetricKey, this.userToShareFileWith.publicKey);
        
        // If the user is already associated with the file
        const userIsAssociatedWithFile = await this.fileManager.accessControlContract.methods.userAssociatedWithFile(this.userToShareFileWith, this.selectedFile).call({from: this.fileManager.selectedUser.account});
        if (userIsAssociatedWithFile) {
            await this.fileManager.accessControlContract.methods.updateUserFilePermissions(this.userToShareFileWith, this.selectedFile, permissionsArray).send({from: this.fileManager.selectedUser.account});
            console.log("Permissions updated.");
            return;
        }

        // Performs the file share
        await this.fileManager.accessControlContract.methods.shareFile(
            this.userToShareFileWith, 
            this.selectedFile, 
            encryptedSymmetricKeyShared.toString('base64'),
            permissionsArray
        ).send({ from: this.fileManager.selectedUser.account });
        console.log("File Shared."); 
    }

}
export default ShareFileCommand;
