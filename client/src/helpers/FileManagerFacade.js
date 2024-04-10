import BlockchainWrapper from './Managers/BlockchainWrapper.js';
import EncryptionWrapper from './Managers/EncryptionWrapper.js';
import IPFSWrapper from './Managers/IPFSWrapper.js';
import DropUpload from './Commands/DropUpload.js';
import DropEdit from './Commands/DropEdit.js'
import VerifyFileCommand from './Commands/VerifyFileCommand.js';
import DownloadFileCommand from './Commands/DownloadFileCommand.js';
import ShareFileCommand from './Commands/ShareFileCommand.js';
import UpdatePermissionsCommand from './Commands/UpdatePermissionsCommand.js';
import DeleteFileCommand from './Commands/DeleteFileCommand.js';

class FileManagerFacade {

  constructor(fileRegisterContract, userRegisterContract, accessControlContract, auditLogControlContract) {
      this.fileRegisterContract = fileRegisterContract;
      this.userRegisterContract = userRegisterContract;
      this.accessControlContract = accessControlContract;
      this.auditLogControlContract = auditLogControlContract;
      this._selectedAccount = "";
      this._selectedUser = null;
  }

  // returns the selectedUser
  get selectedUser() {
    return this._selectedUser;
  }

  // sets the selectedUser
  set selectedUser(selectedUser) {
    this._selectedUser = selectedUser;
  }

  // returns the selectedAccount
  get selectedAccount() {
    return this._selectedAccount;
  }

  // sets the selectedAccount
  set selectedAccount(selectedAccount) {
    this._selectedAccount = selectedAccount;
  }

  // Uploads File into the system  
  async uploadFile(fileUplName, fileAsBuffer) {
    const uploadCommand = new DropUpload(fileUplName, fileAsBuffer, this.generateSymmetricKey.bind(this), this.encryptFileWithSymmetricKey.bind(this), this.addFileToIPFS.bind(this), this.generateHash256.bind(this), this.getFileByIpfsCID.bind(this), this.getPermissionsOverFile.bind(this), this.uploadFileUser.bind(this), this.encryptSymmetricKey.bind(this), this.selectedUser.account);
    await uploadCommand.execute();
  }
 
  // Edits an existing file 
  async editFile(fileUplName, fileAsBuffer, selectedFile) {
    const editCommand = new DropEdit(fileUplName, selectedFile, this.getUsersAssociatedWithFile.bind(this), this.getPubKeyUser.bind(this), this.encryptSymmetricKey.bind(this), this.editFileUpl.bind(this), fileAsBuffer, this.generateSymmetricKey.bind(this), this.encryptFileWithSymmetricKey.bind(this), this.addFileToIPFS.bind(this), this.generateHash256.bind(this), this.getFileByIpfsCID.bind(this), this.getPermissionsOverFile.bind(this), this.selectedUser.account);
    await editCommand.execute();
  }
  
  // Gets the file from IPFS, decryts and downloads
  async downloadFile(selectedFile) {
    const downloadCommand = new DownloadFileCommand(this.selectedUser.account, selectedFile, this.getFileFromIPFS.bind(this), this.getEncSymmetricKeyFileUser.bind(this), this.decryptFileWithSymmetricKey.bind(this), this.downloadFileAudit.bind(this));
    return await downloadCommand.execute(); 
  }

  // Deletes the file from IPFS and the association between the user and the file
  async deleteFile(selectedFile, handleFileDeleted, uploadedFiles) {
    const deleteCommand = new DeleteFileCommand(selectedFile, handleFileDeleted, uploadedFiles, this.deactivateFile.bind(this));
    await deleteCommand.execute(); 
  }

  // Shares the file with a given user that was not already associated with a file
  async shareFileCommand(selectedFile, permissions, accountUserToShareFileWith) {
    const shareCommand = new ShareFileCommand(selectedFile, permissions, accountUserToShareFileWith, this.verifyUserAssociatedWithFile.bind(this), this.getAllEncSymmetricKeyFileUser.bind(this), this.decryptSymmetricKeys.bind(this), this.getPubKeyUser.bind(this), this.encryptSymmetricKeys.bind(this), this.fileShare.bind(this), this.selectedUser.account);
    await shareCommand.execute();
  }

  // Updates permissions of a given user over a file
  async updateUserFilePermissionsCommand(selectedFile, permissions, accountUserToShareFileWith) {
    const updatePermissionsCommand = new UpdatePermissionsCommand(selectedFile, permissions, accountUserToShareFileWith, this.verifyUserAssociatedWithFile.bind(this), this.updateUserFilePermissions.bind(this), this.getPermissionsOverFile.bind(this), this.removeUserFileAssociation.bind(this));
    await updatePermissionsCommand.execute();
  }

  // Verifies if a file already exists in the app
  async verifyFile(fileAsBuffer) {
    const verifyFileCommand = new VerifyFileCommand(fileAsBuffer, this.generateHash256.bind(this), this.verifyValidFile.bind(this), this.recordFileVerification.bind(this), this.selectedUser.account);
    return await verifyFileCommand.execute();
  }

  // Associates a user with a file given certain permissions 
  async associateUserFilePermissions (selectedFile, permissions, accountUserShareFileWith) {
    // Verifies if the user is already associated with the file
    const userAssociatedWithFile = await BlockchainWrapper.verifyUserAssociatedWithFile(this.accessControlContract, selectedFile.ipfsCID, accountUserShareFileWith, this.selectedUser.account);
    if (userAssociatedWithFile) {
      await this.updateUserFilePermissionsCommand(selectedFile, permissions, accountUserShareFileWith);
      return;
    } 
    await this.shareFileCommand(selectedFile, permissions, accountUserShareFileWith);
  }

  // Verifies if the user is already associated with a file with the same name
  async userAssociatedWithFileName(userAccount, fileName) {
    return await BlockchainWrapper.userAssociatedWithFileName(this.accessControlContract, userAccount, fileName,this.selectedUser.account);
  }

  // Get all active files that were uploaded too the blockchain
  async getFilesUploadedBlockchain(selectedUser, state) {
    return await BlockchainWrapper.getFilesUploadedBlockchain(this.accessControlContract, selectedUser.account, state, this.selectedUser.account);
  }

  // Get the historic of a file - get previous edited files from the oldest to the most recent one
  async getPrevEditedFiles(fileIpfsCid) {
    return await BlockchainWrapper.getPrevEditedFiles(this.fileRegisterContract, fileIpfsCid, this.selectedUser.account);
  }

  // Get all logs that were stored in the blockchain
  async getLogsUserFilesBlockchain(uploadedFiles) {
    var filesIpfsCid = uploadedFiles.map(file => file.ipfsCID);
    return await BlockchainWrapper.getLogsUserFilesBlockchain(this.auditLogControlContract, filesIpfsCid, this.selectedUser.account);
  }

  // Gets the user, according to a certain username
  async getUserAccount(usernameToShare) {
    return await BlockchainWrapper.getUserAccount(usernameToShare, this.userRegisterContract, this.selectedUser.account);
  }

  // Verifies if the user is elegibe to get a file shared with or get the permissions updated
  async validUserShareUpdtPerm(userAccount, fileIpfsCid) {
    return await BlockchainWrapper.validUserShareUpdtPerm(this.fileRegisterContract, userAccount, fileIpfsCid, this.selectedUser.account);
  }

  // Get the user, according to the account
  async getUserUserName(userAccount) {
    return await BlockchainWrapper.getUserUserName(this.userRegisterContract, userAccount, this.selectedUser.account);
  }

  // Get the symmetric key of a single file asociated with a given user
  async getEncSymmetricKeyFileUser(userAccount, fileIpfscid){
    return await BlockchainWrapper.getEncSymmetricKeyFileUser(this.accessControlContract, userAccount, fileIpfscid);
  }

  // Get the all the encrypted symmetric keys of a file (including passed editings) associated with a given user 
  async getAllEncSymmetricKeyFileUser(userAccount, fileIpfscid){
    return await BlockchainWrapper.getAllEncSymmetricKeyFileUser(this.accessControlContract, userAccount, fileIpfscid);
  }

  // Gets the permissions a given user has over a file
  async getPermissionsUserOverFile(accountUserToGetPermssion, selectedFileIpfsCid){
    return await BlockchainWrapper.getPermissionsUserOverFile(this.accessControlContract, accountUserToGetPermssion, selectedFileIpfsCid, this.selectedUser.account); 
  }

  // Gets the public key of a given user
  async getPubKeyUser(accountUser){
    return await BlockchainWrapper.getPublicKey(this.userRegisterContract, accountUser, this.selectedUser.account);
  }

  // Get file IPFS CID
  async getFileByIpfsCID(fileIpfsCid, state) {
      return await BlockchainWrapper.getFileByIpfsCID(this.fileRegisterContract, fileIpfsCid, state, this.selectedUser.account);
  }

  // Get users' permissions over a file
  async getPermissionsOverFile(userAccount, fileIpfsCid) {
    return await BlockchainWrapper.getPermissionsOverFile(this.accessControlContract, userAccount, fileIpfsCid, this.selectedUser.account);
  }

  // Adds the file in the blockchain
  async addFile(file) {
    return await BlockchainWrapper.addFile(this.fileRegisterContract, file, this.selectedUser.account);
  }

  // Associates a user with a file
  async uploadFileUser(userAccount, file, encSymmetricKey) {
    return await BlockchainWrapper.uploadFileUser(this.accessControlContract, userAccount, file, encSymmetricKey, this.selectedUser.account);
  }

  // Edits the uploaded file
  async editFileUpl(selectedFile, fileEdited, usersWithDownlodPermSelectFile, pubKeyUsersWithDownloadPermSelectFile) { 
    return await BlockchainWrapper.editFileUpl(this.accessControlContract, selectedFile, fileEdited, usersWithDownlodPermSelectFile, pubKeyUsersWithDownloadPermSelectFile, this.selectedUser.account);
  }

  // Updates the users' permissions over a file
  updateUserFilePermissions(userAccount, fileIpfsCid, permissionsArray) {
    return BlockchainWrapper.updateUserFilePermissions(this.accessControlContract, userAccount, fileIpfsCid, permissionsArray, this.selectedUser.account);
  }

  // Remove the relationship between a user and a file
  removeUserFileAssociation(userAccount, fileIpfsCid) {
    return BlockchainWrapper.removeUserFileAssociation(this.accessControlContract, userAccount, fileIpfsCid, this.selectedUser.account);
  }

  // Deletes the files' association with the users, and deletes the file
  async deactivateFile(fileIpfsCid) {
    return await BlockchainWrapper.deactivateFile(this.accessControlContract, fileIpfsCid, this.selectedUser.account);
  }

  // Deletes permanently the file
  deleteFilePermanently(fileIpfsCid) {
    return BlockchainWrapper.deleteFilePermanently(this.fileRegisterContract, fileIpfsCid, this.selectedUser.account);
  }

  // Associates a user with a file, given certain permissions
  fileShare(userAccount, fileIpfCid, encryptedSymmetricKeysShared, permissionsArray) {
    return BlockchainWrapper.fileShare(this.accessControlContract, userAccount, fileIpfCid, encryptedSymmetricKeysShared, permissionsArray, this.selectedUser.account);
  }

  // Downloads the users' file
  downloadFileAudit(fileIpfsCid, userAccount) {
    return BlockchainWrapper.downloadFileAudit(this.accessControlContract, fileIpfsCid, userAccount, this.selectedUser.account);
  }

  // Verifies if a user address exist
  existingAddress(userAccount) {
    return BlockchainWrapper.existingAddress(this.userRegisterContract, userAccount, this.selectedAccount.curent);
  }

  // Verifies if a user name exist
  existingUserName(userUserName) {
    return BlockchainWrapper.existingUserName(this.userRegisterContract, userUserName, this.selectedAccount.curent);
  }

  // Adds a user into the blockchain
  userRegistered(user) {
    return BlockchainWrapper.userRegistered(this.userRegisterContract, user, this.selectedAccount.current);
  }

  // Returns if a user is associated with a file
  async verifyUserAssociatedWithFile(userAccount, fileIpfsCid) {
    return await BlockchainWrapper.verifyUserAssociatedWithFile(this.accessControlContract, fileIpfsCid, userAccount, this.selectedUser.account);
  }

  // Returns if a file is valid or not
  async verifyValidFile(userAccount, fileHash) { 
    return await BlockchainWrapper.verifyValidFile(this.accessControlContract, userAccount, fileHash, this.selectedUser.account);
  }

  // Records the file verification
  async recordFileVerification(userAccount, fileHash) {
    return await BlockchainWrapper.recordFileVerification(this.accessControlContract, userAccount, fileHash, this.selectedUser.account);
  }

  // Verifies if a mnemonic belongs to a given user
  async verifyUserAssociatedMnemonic(mnemonic, user) {
    return await BlockchainWrapper.verifyUserAssociatedMnemonic(this.userRegisterContract, mnemonic, user, this.selectedUser.account);
  }

  // Returns the user
  async getUser(user) {
    return await BlockchainWrapper.getUser(this.userRegisterContract, user, this._selectedAccount.current);
  }

  // Gets the users associated with the file 
  async getUsersAssociatedWithFile(fileIpfsCID) {
    return await BlockchainWrapper.getUsersAssociatedWithFile(this.accessControlContract, fileIpfsCID, this.selectedUser.account);
  }

  // Hashes the mnemonic using symmetric encryption
  async hashMnemonicSymmetricEncryption(mnemonic) {
    return await EncryptionWrapper.hashMnemonicSymmetricEncryption(mnemonic);
  }

  // Generates a hash using SHA-256
  async generateHash256(fileAsBuffer) {
    return await EncryptionWrapper.generateHash256(fileAsBuffer);
  }

  // Generates a symmetric key
  generateSymmetricKey() {
    return EncryptionWrapper.generateSymmetricKey();
  }

  // Encrypts a file using a symmetric key
  async encryptFileWithSymmetricKey(file, symmetricKey) {
    const {encryptedFile, iv} = await EncryptionWrapper.encryptFileWithSymmetricKey(file, symmetricKey);
    return {encryptedFile, iv};
  }

  // Generates the mnemonic associated with a user
  generateMnemonic() {
    return EncryptionWrapper.generateMnemonic();
  }

  // Generates a set of keys, given a mnemonic
  async generateKeysFromMnemonic(mnemonic) {
    return EncryptionWrapper.generateKeysFromMnemonic(mnemonic);
  }

  // Stores in the local storage
  async storeLocalSotrage(privateKey, publicKey, address){
    return EncryptionWrapper.storeLocalSotrage(privateKey, publicKey, address);
  }

  // Decrypts a group of symmetric keys using a private key
  decryptSymmetricKeys(encSymmetricKeys, privateKey) {
    return EncryptionWrapper.decryptSymmetricKeys(encSymmetricKeys, privateKey);
  }

  // Encrypts a single symmetric key using a public key 
  encryptSymmetricKey(symmetricKey, userPublicKey) {
    return EncryptionWrapper.encryptSymmetricKey(symmetricKey, userPublicKey);
  }

  // Encrypts symmetric keys using a public key
  encryptSymmetricKeys(symmetricKeys, userPublicKey) {
    return EncryptionWrapper.encryptSymmetricKeys(symmetricKeys, userPublicKey);
  }

  // Decrypts a file uising a symmetric key
  async decryptFileWithSymmetricKey(selectedFile, encryptedSymmetricKeyBuffer, fileContent) {
    return await EncryptionWrapper.decryptFileWithSymmetricKey(selectedFile, encryptedSymmetricKeyBuffer, fileContent);
  }

  // Retursn all files in IPFS
  async getFileFromIPFS(ipfsCID){
    return await IPFSWrapper.getFileFromIPFS(ipfsCID);
  }

  // Adds a file to IPFS
  async addFileToIPFS(file) {
    return await IPFSWrapper.addFileToIPFS(file);
  }

  // Helper function to format timestamp to "dd/mm/yyyy hh:mm:ss"
  static formatTimestamp(timestamp) {
    const date = new Date(timestamp * 1000);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  }

}

export default FileManagerFacade;