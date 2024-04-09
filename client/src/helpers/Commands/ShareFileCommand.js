import Command from "./Command.js";

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
        // eslint-disable-next-line security/detect-object-injection
        const permissionsArray = Object.keys(this.permissions).filter(key => this.permissions[key]);

        // If the user is already associated with the file
        const userIsAssociatedWithFile = await this.fileManager.verifyUserAssociatedWithFile(this.accountUserToShareFileWith, this.selectedFile.ipfsCID);
        if (userIsAssociatedWithFile) {
            console.log("It was called 'ShareFileCommand' but the user is already associated with the selected file.");
            return;
        }

        // Get the encrypted symmetric key that a user has over a file (including all the previous editings of the file)
        var result = await this.fileManager.getAllEncSymmetricKeyFileUser(this.fileManager.selectedUser.account, this.selectedFile.ipfsCID);
        if(!result.success){
            console.log("something went wrong while trying to get the encrypted symmetric keys of the given file and user");
            return;
        }
        var encSymmetricKeys = result.resultStrings;

        // Decrypts the given symmetric keys, using the Users' public key
        var decSymmetricKeys = await this.fileManager.decryptSymmetricKeys(encSymmetricKeys, localStorage.getItem('privateKey'));

        // Get the public key of the user to share file with
        result = await this.fileManager.getPubKeyUser(this.accountUserToShareFileWith);
        if (!result.success) {
            console.log("Something went wrong while trying to get the public key of the user.");
            return;
        }        
        var publicKeyUserToShareFileWith = result.resultString;

        // Encrypts the symmetric keys with the users' public key
        var encryptedSymmetricKeysShared = await this.fileManager.encryptSymmetricKeys(decSymmetricKeys, publicKeyUserToShareFileWith);

        // Performs the file share
        await this.fileManager.fileShare(this.accountUserToShareFileWith, this.selectedFile.ipfsCID, encryptedSymmetricKeysShared, permissionsArray);
        
        // Verifies if the file was successfully shared with the user
        var resultUserAssociatedFile = await this.fileManager.verifyUserAssociatedWithFile(this.accountUserToShareFileWith, this.selectedFile.ipfsCID);
        if (!resultUserAssociatedFile) {
            console.log("Something went wrong while trying to associate the user with the file.");
        } else {
            console.log("File Shared."); 
        }
    }

}
export default ShareFileCommand;
