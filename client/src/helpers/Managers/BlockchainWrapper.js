import FileApp from "../FileApp";

class BlockchainWrapper {

    // Gets the public key of the given user
    static getPublicKey = async (userRegisterContract, accountUser, selectedUserAccount) => {
        return await userRegisterContract.methods.getPublicKey(accountUser).call({from: selectedUserAccount});
    }

    // Gets the user to share the file with
    static getUserAccount = async (nameUserToShare, userRegisterContract, selectedUserAccount) => {
        return await userRegisterContract.methods.getUserAccount(nameUserToShare).call({from: selectedUserAccount});
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

    // Get the encrypted symmetric key of a file associated with a given user
    static getEncSymmetricKeyFileUser = async (accessControlContract, userAccount, fileIpfcid) => {
        return await accessControlContract.methods.getEncSymmetricKeyFileUser(userAccount, fileIpfcid).call({from: userAccount});
    }

    // Get files from the Blockchain given a user
    static getFilesUploadedBlockchain = async (accessControlContract, userAccount, selectedUserAccount) => {
        var result = await accessControlContract.methods.getUserFiles(userAccount).call({from: selectedUserAccount});
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

    // Returns true or false, according to if a user is already associated with a file or not
    static verifyUserAssociatedWithFile = async (accessControlContract, fileIpfsCid, userAccount, selectedUserAccount) => {
        return await accessControlContract.methods.userAssociatedWithFile(userAccount, fileIpfsCid).call({from: selectedUserAccount});
    }

    // Gets the permissions a user has over a file
    static getPermissionsUserOverFile = async (accessControlContract, accountUserToGetPermssion, fileIpfsCid, selectedUserAccount) => {
        return await accessControlContract.methods.getPermissionsOverFile(accountUserToGetPermssion, fileIpfsCid).call({from: selectedUserAccount}); 
    }

    // Updates the users' permissions over a file
    static updateUserFilePermissions = async (accessControlContract, userAccount, fileIpfsCid, permissionsArray, selectedUserAccount) => {
        try {
            // TODO: SEE IF THERE ARE ANY CONDITIONS THAT NEED TO BE FIRST MET
            await accessControlContract.methods.updateUserFilePermissions(userAccount, fileIpfsCid, permissionsArray).send({from: selectedUserAccount});
            // TODO: GET THE PERMISSIOS OVER THE FILE TO SEE IF IT WAS WELL EXECUTED
        } catch (error) {
            console.error("Transaction error: ", error.message);
        }
    }

    // Adds the file in the blockchain
    static addFile = (fileRegisterContract, file, selectedAccount) => {
        return fileRegisterContract.methods.addFile(file).send({from: selectedAccount});
    }

    // Returns the file with the corresponding file IPFS CID
    static getFileByIpfsCID = async (fileRegisterContract, fileIpfsCid, selectedUserAccount) => {
        return await fileRegisterContract.methods.getFileByIpfsCID(fileIpfsCid).call({from: selectedUserAccount});
    }

    // Returns the permissions of a user over a file
    static getPermissionsOverFile = async (accessControlContract, userAccount, fileIpfsCid, selectedAccount) => {
        return await accessControlContract.methods.getPermissionsOverFile(userAccount, fileIpfsCid).call({ from: selectedAccount });
    }

    // Associates a user with a file
    static associatedUserFile = async (accessControlContract, userAccount, fileIpfsCid, encSymmetricKey, selectedUserAccount) => {
        return await accessControlContract.methods.uploadFile(userAccount, fileIpfsCid, encSymmetricKey).send({ from: selectedUserAccount });
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
}

export default BlockchainWrapper;