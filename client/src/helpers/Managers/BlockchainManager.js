import EncryptionManager from "./EncryptionManager";
import FileApp from "../FileApp";

class BlockchainManager {

    // Gets the public key of the given user
    static getPublicKey = async (userRegisterContract, accountUser, selectedUser) => {
        var result = await userRegisterContract.methods.getPublicKey(accountUser).call({from: selectedUser.account});
        if (result.success) {
            return result.resultString;
        }
        console.log("Something went wrong while trying to get the public key of the user.");
        return "";
    }

    // Gets the user to share the file with
    static getUserAccount = async (nameUserToShare, userRegisterContract, selectedUser) => {
        var result = await userRegisterContract.methods.getUserAccount(nameUserToShare).call({from: selectedUser.account});
        if (result.success) {
            return result.resultAddress;
        }
        return null;
    }

    // Get the encrypted symmetric key of a file associated with a given user
    static getEncSymmetricKeyFileUser = async (accessControlContract, userAccount, fileIpfcid) => {
        var result = await accessControlContract.methods.getEncSymmetricKeyFileUser(userAccount, fileIpfcid).call({from: userAccount});
        if(!result.success){
            return null;
        }
        return result.resultString;
    }

    // Get files from the Blockchain given a user
    static getFilesUploadedBlockchain = async (accessControlContract, selectedUser) => {
        var result = await accessControlContract.methods.getUserFiles(selectedUser.account).call({from: selectedUser.account});
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
        var result = await accessControlContract.methods.getPermissionsOverFile(accountUserToGetPermssion, selectedFile.ipfsCID).call({from: selectedUser.account});
        if (result.success) {
            return result.resultStrings;
        }
        console.log("No permissions were found between the user and the file.");
        return [];
    }

    // Updates the users' permissions over a file
    static updateUserFilePermissions = async (accessControlContract, userAccount, fileIpfsCid, permissionsArray, selectedUserAccount) => {
        return new Promise(async (resolve, reject) => {
            try {
                // TODO: SEE IF THERE ARE ANY CONDITIONS THAT NEED TO BE FIRST MET
                await accessControlContract.methods.updateUserFilePermissions(userAccount, fileIpfsCid, permissionsArray).send({from: selectedUserAccount});
                // TODO: GET THE PERMISSIOS OVER THE FILE TO SEE IF IT WAS WELL EXECUTED
            } catch (error) {
                console.error("Transaction error: ", error.message);
            }
        });
    }

    // Upload file: stores a file in the blockchain
    static storeFileBlockchain = (fileUploaded, symmetricKey, selectedUser, accessControlContract, fileRegisterContract) => {
        return new Promise(async (resolve, reject) => {
            const encryptedSymmetricKey = EncryptionManager.encryptSymmetricKey(symmetricKey, selectedUser.publicKey); // Encrypt the symmetric key

            // Verifies if the file is elegible to be stored
            try {
                var success = false;

                // Verifies if the user already has a file with the same name
                var isUserAsscoiatedFile = await BlockchainManager.verifyUserAssociatedWithFile(accessControlContract, fileUploaded, selectedUser.account, selectedUser);
                if (isUserAsscoiatedFile) {
                    console.log("User: ", selectedUser.userName , " already associated with the file: ", fileUploaded.fileName);
                    resolve({success});  
                } 

                // TODO: MAYBE SEPARATE THIS INTO FUNCTIONS Adds the file in the blockchain 
                await fileRegisterContract.methods.addFile(fileUploaded).send({ from: selectedUser.account });

                // TODO: MAYBE SEPARATE THIS INTO FUNCTIONS Sees if the file was correctly added in the blockchain 
                var result = await fileRegisterContract.methods.getFileByIpfsCID(fileUploaded.ipfsCID).call({from: selectedUser.account});
                if (!result.success) {
                    console.log("Upload file error: Something went wrong while trying to store the file in the blockchain.");
                    resolve({success});  
                }

                // TODO: MAYBE SEPARATE THIS INTO FUNCTIONS Associates the user with the file (because it's upload, the user is the owner and has all permissions) 
                await accessControlContract.methods.uploadFile(selectedUser.account, fileUploaded.ipfsCID, encryptedSymmetricKey.toString('base64')).send({ from: selectedUser.account });

                // TODO: MAYBE SEPARATE THIS INTO FUNCTIONS Sees if the file was correctly associated with the user given the permissions set
                result = await accessControlContract.methods.getPermissionsOverFile(selectedUser.account, fileUploaded.ipfsCID).call({ from: selectedUser.account });
                if (!result.success) {
                    console.log("Even though the file was stored in the blockchain, something went wrong while trying to associate the user with the file: ", result);
                    resolve({success});  
                }
                
                success = true;
                resolve({success});  
            } catch (error) {
                console.error("Transaction error: ", error.message);
            }
        });
    }

    static fileShare = async (accessControlContract, userAccount, fileIpfCid, encryptedSymmetricKeyShared, permissionsArray, selectedUserAccount) => {
        await accessControlContract.methods.shareFile(
            userAccount, 
            fileIpfCid, 
            encryptedSymmetricKeyShared,
            permissionsArray
        ).send({ from: selectedUserAccount }) ;
    }
}

export default BlockchainManager;