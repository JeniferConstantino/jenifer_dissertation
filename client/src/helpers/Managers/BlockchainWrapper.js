import FileApp from "../FileApp";

class BlockchainWrapper {
    // Gets the public key of the given user
    static getPublicKey = async (userRegisterContract, accountUser, selectedUserAccount) => {
        return await userRegisterContract.methods.getPublicKey(accountUser).call({from: selectedUserAccount});
    }

    // Gets the user based on the user name
    static getUserAccount = async (nameUserToShare, userRegisterContract, selectedUserAccount) => {
        return await userRegisterContract.methods.getUserAccount(nameUserToShare).call({from: selectedUserAccount});
    }

    // Get the user name based on a user account 
    static getUserUserName = async (userRegisterContract, userAccount, selectedUserAccount) => {
        return await userRegisterContract.methods.getUserUserName(userAccount).call({from: selectedUserAccount});
    }

    // Verifies if an address exists
    static existingAddress = async (userRegisterContract, userAccount, selectedUserAccount) => {
        return await userRegisterContract.methods.existingAddress(userAccount).call({from: selectedUserAccount});
    }

    // Verifies if the user name exists
    static existingUserName = async (userRegisterContract, userUserName, selectedUserAccount) => {
        return await userRegisterContract.methods.existingUserName(userUserName).call({from: selectedUserAccount});
    }

    // Stores the user in the blockchain
    static userRegistered = async (userRegisterContract, user, selectedAccount) => {
        return userRegisterContract.methods.userRegistered(user).send({from: selectedAccount});
    }

    // Verifies if a uer is associated with a mnemonic
    static verifyUserAssociatedMnemonic = async (userRegisterContract, mnemonic, userAccount, selectedUserAccount) => {
        return await userRegisterContract.methods.verifyUserAssociatedMnemonic(mnemonic, userAccount).call({from: selectedUserAccount});;
    }

    // Returns the user
    static getUser = async (userRegisterContract, user, selectedUserAccount) => {
        return await userRegisterContract.methods.getUser(user).call({from: selectedUserAccount});
    }

    // Adds the file in the blockchain
    static addFile = (fileRegisterContract, file, selectedAccount) => {
        return fileRegisterContract.methods.addFile(file).send({from: selectedAccount});
    }

    // Returns the file with the corresponding file IPFS CID
    static getFileByIpfsCID = async (fileRegisterContract, fileIpfsCid, state, selectedUserAccount) => {
        return await fileRegisterContract.methods.getFileByIpfsCID(fileIpfsCid, state).call({from: selectedUserAccount});
    }

    // Returns true if the user is already associated with a file with the given name
    static userAssociatedWithFileName = async (accessControlContract, userAccount, fileName, selectedUserAccount) => {
        return await accessControlContract.methods.userAssociatedWithFileName(userAccount, fileName).call({from: selectedUserAccount});
    }

    // Get the encrypted symmetric key of a file associated with a given user
    static getEncSymmetricKeyFileUser = async (accessControlContract, userAccount, fileIpfcid) => {
        return await accessControlContract.methods.getEncSymmetricKeyFileUser(userAccount, fileIpfcid).call({from: userAccount});
    }

    // Get active files from the Blockchain given a user
    static getFilesUploadedBlockchain = async (accessControlContract, userAccount, state, selectedUserAccount) => {
        var result = await accessControlContract.methods.getUserFiles(userAccount, state).call({from: selectedUserAccount});
        let files = [];
        if (result.success) {
            result.files.forEach(file => {
                var fileApp = new FileApp(file.fileName, file.version, file.prevIpfsCID, file.owner, file.ipfsCID, file.iv, file.state, file.fileHash);
                fileApp.fileType = file.fileType;
                files.push(fileApp);
            });
        }
        return files;
    }

    // Get previously edited files of a certain file, from the oldest to the most recent one
    static getPrevEditedFiles = async (fileRegisterContract, fileIpfsCid, selectedUserAccount) => {
        var result = await fileRegisterContract.methods.getEditedFileByIpfsCid(fileIpfsCid).call({from: selectedUserAccount});
        return result;
    }

    // Get logs (concerning to the users' files - be it because the user uploaded or shared) from the Blockchain 
    static getLogsUserFilesBlockchain = async (auditLogControlContract, filesIpfsCid, selectedUserAccount)  => {
        return await auditLogControlContract.methods.getLogs(filesIpfsCid).call({from: selectedUserAccount});
    }

    // Returns true or false, according to if a user is already associated with a file or not
    static verifyUserAssociatedWithFile = async (accessControlContract, fileIpfsCid, userAccount, selectedUserAccount) => {
        return await accessControlContract.methods.userAssociatedWithFile(userAccount, fileIpfsCid).call({from: selectedUserAccount});
    }

    // Returns the latest version of a file
    static getLatestVersionOfFile = async (fileRegister, fileName, selectedUserAccount) => {
        return await fileRegister.methods.getLatestVersionOfFile(fileName).call({from: selectedUserAccount});
    }

    // Returns the file owner of a given file
    static getFileOwner = async (fileRegister, fileName, selectedUserAccount) => {
        return await fileRegister.methods.getFileOwner(fileName).call({from: selectedUserAccount});
    }

    // Returns if a file is valid or not
    static verifyValidFile = async (accessControlContract, userAccount, fileHash, selectedUserAccount) => {
        return await accessControlContract.methods.verifyValidFile(userAccount, fileHash).call({from: selectedUserAccount});
    }

    // Gets the permissions a user has over a file
    static getPermissionsUserOverFile = async (accessControlContract, accountUserToGetPermssion, fileIpfsCid, selectedUserAccount) => {
        return await accessControlContract.methods.getPermissionsOverFile(accountUserToGetPermssion, fileIpfsCid).call({from: selectedUserAccount}); 
    }

    // Updates the users' permissions over a file
    static updateUserFilePermissions = async (accessControlContract, userAccount, fileIpfsCid, permissionsArray, selectedUserAccount) => {
        return await accessControlContract.methods.updateUserFilePermissions(userAccount, fileIpfsCid, permissionsArray).send({from: selectedUserAccount});
    }

    // Removes the association between a user and a file
    static removeUserFileAssociation = async (accessControlContract, userAccount, fileIpfsCid, selectedUserAccount) => {
        return await accessControlContract.methods.removeUserFileAssociation(userAccount, fileIpfsCid).send({from: selectedUserAccount});
    } 

    // Delete the association of the file with the users and deletes the file
    static deactivateFile = async (accessControlContract, userAccount, fileIpfsCid, selectedUserAccount) => {
        return await accessControlContract.methods.deactivateFile(userAccount, fileIpfsCid).send({from: selectedUserAccount});
    }

    // Returns the permissions of a user over a file
    static getPermissionsOverFile = async (accessControlContract, userAccount, fileIpfsCid, selectedAccount) => {
        return await accessControlContract.methods.getPermissionsOverFile(userAccount, fileIpfsCid).call({ from: selectedAccount });
    }

    // Associates a user with a file
    static uploadFileUser = async (accessControlContract, userAccount, file, encSymmetricKey, selectedUserAccount) => {
        return await accessControlContract.methods.uploadFile(userAccount, file, encSymmetricKey).send({ from: selectedUserAccount });
    }

    // Edits the file (sets the selected file state to edited and adds the new file to the system)
    static editFileUpl = async (accessControlContract, selectedFile, fileEdited, encSymmetricKey, selectedUserAccount) => {
        return await accessControlContract.methods.editFile(selectedFile, fileEdited, encSymmetricKey).send({ from: selectedUserAccount });
    }

    // Share File: associates a file with a user given certain permissions
    static fileShare = async (accessControlContract, userAccount, fileIpfCid, encryptedSymmetricKeyShared, permissionsArray, selectedUserAccount) => {
        await accessControlContract.methods.shareFile(
            userAccount, 
            fileIpfCid, 
            encryptedSymmetricKeyShared,
            permissionsArray
        ).send({ from: selectedUserAccount }) ;
    }

    // Downloads the file
    static downloadFileAudit = async (accessControlContract, fileIpfsCid, userAccount, selectedUserAccount) => {
        return await accessControlContract.methods.downloadFileAudit(fileIpfsCid, userAccount).send({ from: selectedUserAccount });
    }
    
}

export default BlockchainWrapper;