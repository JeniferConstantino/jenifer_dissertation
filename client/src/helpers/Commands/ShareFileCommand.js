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
        var publicKeyUserToShareFileWith = await this.fileManager.getPubKeyUser(this.accountUserToShareFileWith);
        var encryptedSymmetricKeyShared = await this.fileManager.encryptSymmetricKey(decryptedSymmetricKey, publicKeyUserToShareFileWith);
        
        // If the user is already associated with the file
        const userIsAssociatedWithFile = await this.fileManager.accessControlContract.methods.userAssociatedWithFile(this.accountUserToShareFileWith, this.selectedFile).call({from: this.fileManager.selectedUser.account});
        
        if (userIsAssociatedWithFile) {
            await this.fileManager.accessControlContract.methods.updateUserFilePermissions(this.accountUserToShareFileWith, this.selectedFile, permissionsArray).send({from: this.fileManager.selectedUser.account});
            console.log("Permissions updated.");
            return;
        }
        
        // Performs the file share
        await this.fileManager.accessControlContract.methods.shareFile(
            this.accountUserToShareFileWith, 
            this.selectedFile, 
            encryptedSymmetricKeyShared.toString('base64'),
            permissionsArray
        ).send({ from: this.fileManager.selectedUser.account });
        console.log("File Shared."); 
    }

}
export default ShareFileCommand;
