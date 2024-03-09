import BlockchainWrapper from './Managers/BlockchainWrapper';
import EncryptionWrapper from './Managers/EncryptionWrapper';
import IPFSWrapper from './Managers/IPFSWrapper';
import UploadFileCommand from './Commands/UploadFileCommand';
import DownloadFileCommand from './Commands/DownloadFileCommand';
import ShareFileCommand from './Commands/ShareFileCommand';
import UpdatePermissionsCommand from './Commands/UpdatePermissionsCommand';
import DeleteFileCommand from './Commands/DeleteFileCommand';

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
  async uploadFile(fileUpl, fileAsBuffer, handleFileUploaded, uploadedActiveFiles, uploadedFiles) {
    const uploadCommand = new UploadFileCommand(this, fileUpl, fileAsBuffer, handleFileUploaded, uploadedActiveFiles, uploadedFiles);
    await uploadCommand.execute();
  }
  
  // Gets the file from IPFS, decryts and downloads
  async downloadFile(selectedFile) {
    const downloadCommand = new DownloadFileCommand(this, selectedFile);
    await downloadCommand.execute(); 
  }

  // Deletes the file from IPFS and the association between the user and the file
  async deleteFile(selectedFile, handleFileDeleted, uploadedFiles) {
    const deleteCommand = new DeleteFileCommand(this, selectedFile, handleFileDeleted, uploadedFiles);
    await deleteCommand.execute(); 
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

  // Shares the file with a given user that was not already associated with a file
  async shareFileCommand(selectedFile, permissions, accountUserShareFileWith) {
    const shareCommand = new ShareFileCommand(this, selectedFile, permissions, accountUserShareFileWith);
    await shareCommand.execute();
  }

  // Updates permissions of a given user over a file
  async updateUserFilePermissionsCommand(selectedFile, permissions, accountUserShareFileWith) {
    const updatePermissionsCommand = new UpdatePermissionsCommand(this, selectedFile, permissions, accountUserShareFileWith);
    await updatePermissionsCommand.execute();
  }

  // Get all active files that were uploaded too the blockchain
  async getFilesUploadedBlockchain(selectedUser, state) {
    return await BlockchainWrapper.getFilesUploadedBlockchain(this.accessControlContract, selectedUser.account, state, this.selectedUser.account);
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

  // Get the user, according to the account
  async getUserUserName(userAccount) {
    return await BlockchainWrapper.getUserUserName(this.userRegisterContract, userAccount, this.selectedUser.account);
  }

  // Gets the encrypted symmetric key of a given file and associated with a given user
  async getEncSymmetricKeyFileUser(userAccount, fileIpfscid){
    return await BlockchainWrapper.getEncSymmetricKeyFileUser(this.accessControlContract, userAccount, fileIpfscid);
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
  async getFileByIpfsCID(fileIpfsCid) {
      return await BlockchainWrapper.getFileByIpfsCID(this.fileRegisterContract, fileIpfsCid, this.selectedUser.account);
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

  // Updates the users' permissions over a file
  updateUserFilePermissions(userAccount, fileIpfsCid, permissionsArray) {
    return BlockchainWrapper.updateUserFilePermissions(this.accessControlContract, userAccount, fileIpfsCid, permissionsArray, this.selectedUser.account);
  }

  // Deletes the files' association with the users, and deletes the file
  async deactivateFileUserAssociation(userAccount, fileIpfsCid) {
    return await BlockchainWrapper.deactivateFileUserAssociation(this.accessControlContract, userAccount, fileIpfsCid, this.selectedUser.account);
  }

  // Deletes permanently the file
  deleteFilePermanently(fileIpfsCid) {
    return BlockchainWrapper.deleteFilePermanently(this.fileRegisterContract, fileIpfsCid, this.selectedUser.account);
  }

  // Associates a user with a file, given certain permissions
  fileShare(userAccount, fileIpfCid, encryptedSymmetricKeyShared, permissionsArray) {
    return BlockchainWrapper.fileShare(this.accessControlContract, userAccount, fileIpfCid, encryptedSymmetricKeyShared, permissionsArray, this.selectedUser.account);
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

  // Generates a symmetric key
  generateSymmetricKey() {
    return EncryptionWrapper.generateSymmetricKey();
  }

  // Encrypts a file using a symmetric key
  async encryptFileWithSymmetricKey(file, symmetricKey) {
    const {encryptedFile, iv} = await EncryptionWrapper.encryptFileWithSymmetricKey(file, symmetricKey);
    return {encryptedFile, iv};
  }

  // Gets a key pair: public key and private key
  generateKeyPair() {
    return EncryptionWrapper.generateKeyPair();
  }

  // Decrypts a symmetric key using a private key
  decryptSymmetricKey(encSymmetricKeyBuffer, privateKey) {
    return EncryptionWrapper.decryptSymmetricKey(encSymmetricKeyBuffer, privateKey);
  }

  // Encrypts a symmetric key using a public key
  encryptSymmetricKey(symmetricKey, userPublicKey) {
    return EncryptionWrapper.encryptSymmetricKey(symmetricKey, userPublicKey);
  }

  // Decrypts a file uising a symmetric key
  async decryptFileWithSymmetricKey(accessControlContract, selectedFile, selectedUser, fileContent) {
    return await EncryptionWrapper.decryptFileWithSymmetricKey(accessControlContract, selectedFile, selectedUser, fileContent);
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

  // TODO
  verifyFile() {}

}

export default FileManagerFacade;