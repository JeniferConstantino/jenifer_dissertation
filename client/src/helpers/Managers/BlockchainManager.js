import EncryptionManager from "./EncryptionManager";
import FileApp from "../FileApp";

class BlockchainManager {

    // Stores a file in the blockchain
    static storeFileBlockchain = (fileUploaded, symmetricKey, selectedUser, accessControlContract) => {
        return new Promise(async (resolve, reject) => {
            const encryptedSymmetricKey = EncryptionManager.encryptSymmetricKey(symmetricKey, selectedUser.publicKey); // Encrypt the symmetric key

            // Verifies if the file is elegible to be stored
            try {
                // Verifies if the user already has a file with the same name
                var isUserAsscoiatedFile = await BlockchainManager.verifyUserAssociatedWithFile(accessControlContract, fileUploaded, selectedUser, selectedUser);
                
                if (isUserAsscoiatedFile) {
                    console.log("User: ", selectedUser.userName , " already associated with the file: ", fileUploaded.fileName);
                    return;
                } 

                const receipt = await accessControlContract.methods.uploadFile(selectedUser, fileUploaded, encryptedSymmetricKey.toString('base64')).send({ from: selectedUser.account });                
                const status = receipt.status
                resolve({status});      
            } catch (error) {
                console.error("Transaction error: ", error.message);
            }
        });
    }

    // Get files from the Blockchain
    static getFilesUploadedBlockchain = async (accessManagerContract, selectedUser) => {
        var result = await accessManagerContract.methods.getUserFiles(selectedUser.account).call({from: selectedUser.account});
        let files = [];
        if (result.success) {
            result.files.forEach(file => {
                var fileApp = new FileApp(file.fileName, file.owner, file.ipfsCID, file.iv);
                fileApp.fileType = file.fileType;
                files.push(fileApp);
            });
        } 
        return files;
    }

    // Verifies if a user is already associated with a file 
    static verifyUserAssociatedWithFile = async (accessControlContract, fileUploaded, userToVerify, selectedUser) => {
        var isUserAsscoiatedFile = await accessControlContract.methods.userAssociatedWithFile(userToVerify, fileUploaded).call({from: selectedUser.account});
        return isUserAsscoiatedFile;
    }

    // Gets the permissions a user has over a file
    static getPermissionsUserOverFile = async (accessControlContract, userToSeePermission, selectedFile, selectedUser) => {
        var permissionsOverFile = await accessControlContract.methods.getPermissionsOverFile(userToSeePermission, selectedFile).call({from: selectedUser.account});
        return permissionsOverFile;
    }

    // Gets the user to share the file with
    static getUserToShareFile = async (nameUserToShare, userRegisterContract, selectedUser) => {
        // Verifies if there is a user with the given name
        var result = await userRegisterContract.methods.getUserByUserName(nameUserToShare).call({from: selectedUser.account});
        if (result.success) {
            return result.user;
        }
        return null;
    }
}

export default BlockchainManager;