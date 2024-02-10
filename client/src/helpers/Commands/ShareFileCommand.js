import Command from "./Command";
import {Buffer} from 'buffer';
import EncryptionManager from '../Managers/EncryptionManager';


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
        var encSymmetricKey = await this.fileManager.storeFileContract.methods.getEncSymmetricKeyFileUser(this.fileManager.selectedUser, this.selectedFile).call({from: this.fileManager.selectedUser.account});
        var encSymmetricKeyBuffer = Buffer.from(encSymmetricKey, 'base64');
        var decryptedSymmetricKey = EncryptionManager.decryptSymmetricKey(encSymmetricKeyBuffer, this.fileManager.selectedUser.privateKey);
        
        // Encrypts the files' symmetric key using the public key of the user to share the file with
        var encryptedSymmetricKeyShared = EncryptionManager.encryptSymmetricKey(decryptedSymmetricKey, this.userToShareFileWith.publicKey);
        // Stores the share information in the blockchain
        const receipt = await this.fileManager.storeFileContract.methods.storeUserHasFile(
            this.userToShareFileWith, 
            this.selectedFile, 
            encryptedSymmetricKeyShared.toString('base64'),
            permissionsArray
        ).send({ from: this.fileManager.selectedUser.account });
        console.log("File Shared. Receipt: ", receipt); 
    }

}
export default ShareFileCommand;
