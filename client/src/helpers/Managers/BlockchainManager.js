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
                var isUserAsscoiatedFile = await BlockchainManager.verifyUserAssociatedWithFile(accessControlContract, fileUploaded, selectedUser.account, selectedUser);
                
                if (isUserAsscoiatedFile) {
                    console.log("User: ", selectedUser.userName , " already associated with the file: ", fileUploaded.fileName);
                    return;
                } 

                const receipt = await accessControlContract.methods.uploadFile(selectedUser.account, fileUploaded, encryptedSymmetricKey.toString('base64')).send({ from: selectedUser.account });                
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
    static verifyUserAssociatedWithFile = async (accessControlContract, fileUploaded, accountUserToVerify, selectedUser) => {
        var isUserAsscoiatedFile = await accessControlContract.methods.userAssociatedWithFile(accountUserToVerify, fileUploaded).call({from: selectedUser.account});
        return isUserAsscoiatedFile;
    }

    // Gets the permissions a user has over a file
    static getPermissionsUserOverFile = async (accessControlContract, accountUserToGetPermssion, selectedFile, selectedUser) => {
        var result = await accessControlContract.methods.getPermissionsOverFile(accountUserToGetPermssion, selectedFile).call({from: selectedUser.account});
        if (result.success) {
            return result.permissions;
        }
        console.log("No permissions were found between the user and the file.");
        return [];
    }

    // gets the public key of the given user
    static getPublicKey = async (userRegisterContract, accountUser, selectedUser) => {
        var result = await userRegisterContract.methods.getPublicKey(accountUser).call({from: selectedUser.account});
        if (result.success) {
            return result.publicKey;
        }
        console.log("Something went wrong while trying to get the public key of the user.");
        return "";
    }

    // Gets the user to share the file with
    static getUserAccount = async (nameUserToShare, userRegisterContract, selectedUser) => {
        // Verifies if there is a user with the given name
        var result = await userRegisterContract.methods.getUserAccount(nameUserToShare).call({from: selectedUser.account});
        if (result.success) {
            return result.account;
        }
        return null;
    }
}

export default BlockchainManager;