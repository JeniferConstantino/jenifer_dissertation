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
        var encSymmetricKey = await this.fileManager.accessControlContract.methods.getEncSymmetricKeyFileUser(this.fileManager.selectedUser, this.selectedFile).call({from: this.fileManager.selectedUser.account});
        var encSymmetricKeyBuffer = Buffer.from(encSymmetricKey, 'base64');
        var decryptedSymmetricKey = this.fileManager.decryptSymmetricKey(encSymmetricKeyBuffer, this.fileManager.selectedUser.privateKey);
        
        // Encrypts the files' symmetric key using the public key of the user to share the file with
        var encryptedSymmetricKeyShared = this.fileManager.encryptSymmetricKey(decryptedSymmetricKey, this.userToShareFileWith.publicKey);
        
        // Performs the file share
        const receipt = await this.fileManager.accessControlContract.methods.shareFile(
            this.userToShareFileWith, 
            this.selectedFile, 
            encryptedSymmetricKeyShared.toString('base64'),
            permissionsArray
        ).send({ from: this.fileManager.selectedUser.account });
        console.log("File Shared. Receipt: ", receipt); 
    }

}
export default ShareFileCommand;
