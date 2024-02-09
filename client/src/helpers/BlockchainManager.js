import EncryptionManager from "./EncryptionManager";
import FileApp from "./FileApp";

class BlockchainManager {

    // Stores a file in the blockchain
    static storeFileBlockchain = (fileUploaded, symmetricKey, selectedUser, storeFileContract) => {
        return new Promise(async (resolve, reject) => {
            const encryptedSymmetricKey = EncryptionManager.encryptSymmetricKey(symmetricKey, selectedUser.publicKey); // Encrypt the symmetric key

            // Verifies if the file is elegible to be stored
            try {
                // Verifies if the user already has a file with the same name
                var errorUploadingFile = await BlockchainManager.verifyUserAssociatedWithFile(storeFileContract, fileUploaded, selectedUser, selectedUser);
                
                if (errorUploadingFile.length === 0) { // The file can be uploaded, no error message was sent
                    const receipt = await storeFileContract.methods.uploadFile(fileUploaded, encryptedSymmetricKey.toString('base64'), selectedUser).send({ from: selectedUser.account });

                    const uploadFileEvent = receipt.events["UploadFileResult"];
                    if (uploadFileEvent) {
                        const { success, message } = uploadFileEvent.returnValues;
                        if (success) {
                            resolve({ receipt, fileUploaded })
                        } else {
                            console.log("message: ", message);
                        }
                    } 
                } else {
                    console.log("errorUploadingFile: ", errorUploadingFile, " Make sure the there is no already uploaded file with the same name.");
                }

            } catch (error) {
                console.error("Transaction error: ", error.message);
                console.log("Make sure you haven't uploaded the file before, and that the file name is unique.");
            }
        });
    }

    // Get files from the Blockchain
    static getFilesUploadedBlockchain = async (storeFileContract, selectedUser) => {
        var result = await storeFileContract.methods.getUserFiles(selectedUser.account).call({from: selectedUser.account});
        let files = [];
        if(result.length != null){
            result.forEach(file => {
                var fileApp = new FileApp(file.fileName, file.owner, file.ipfsCID, file.iv);
                fileApp.fileType = file.fileType;
                files.push(fileApp);
            });
        }
        return files;
    }

    // Verifies if a user is already associated with a file 
    static verifyUserAssociatedWithFile = async (storeFileContract, fileUploaded, userToVerify, selectedUser) => {
        var fileAssociatedUser = await storeFileContract.methods.fileExists(fileUploaded, userToVerify).call({from: selectedUser.account});
        return fileAssociatedUser;
    }

    // Gets the permissions a user has over a file
    static getPermissionsUserOverFile = async (storeFileContract, userToSeePermission, selectedFile, selectedUser) => {
        var permissionsOverFile = await storeFileContract.methods.getPermissionsOverFile(userToSeePermission, selectedFile).call({from: selectedUser.account});
        return permissionsOverFile;
    }

    // Gets the user to share the file with
    static getUserToShareFile = async (nameUserToShare, storeUserContract, selectedUser) => {
        // Verifies if there is a user with the given name
        var user = await storeUserContract.methods.getUserByName(nameUserToShare).call({from: selectedUser.account});
        if (user.name.length === 0) {
            return null;
        } 
        return user;
    }
}

export default BlockchainManager;