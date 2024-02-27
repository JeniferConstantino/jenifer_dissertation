import BlockchainWrapper from './Managers/BlockchainWrapper';
import EncryptionWrapper from './Managers/EncryptionWrapper';
import IPFSWrapper from './Managers/IPFSWrapper';
import UploadFileCommand from './Commands/UploadFileCommand';
import DownloadFileCommand from './Commands/DownloadFileCommand';
import ShareFileCommand from './Commands/ShareFileCommand';
import UpdatePermissionsCommand from './Commands/UpdatePermissionsCommand';

class FileManagerFacade {

  constructor(fileRegisterContract, userRegisterContract, accessControlContract) {
      this.fileRegisterContract = fileRegisterContract;
      this.userRegisterContract = userRegisterContract;
      this.accessControlContract = accessControlContract;
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
  async uploadFile(fileUpl, fileAsBuffer, handleFileUploaded, uploadedFiles) {
    const uploadCommand = new UploadFileCommand(this, fileUpl, fileAsBuffer, handleFileUploaded, uploadedFiles);
    uploadCommand.execute();
  }
  
  // Gets the file from IPFS, decryts and downloads
  async downloadFile(selectedFile) {
    const downloadCommand = new DownloadFileCommand(this, selectedFile);
    downloadCommand.execute(); 
  }

  // Associates a user with a file giver certain permissions 
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
    shareCommand.execute();
  }

  // Updates permissions of a given user over a file
  async updateUserFilePermissionsCommand(selectedFile, permissions, accountUserShareFileWith) {
    const updatePermissionsCommand = new UpdatePermissionsCommand(this, selectedFile, permissions, accountUserShareFileWith);
    updatePermissionsCommand.execute();
  }

  // Get all files that were uploaded too the blockchain
  async getFilesUploadedBlockchain(selectedUser) {
    const files = await BlockchainWrapper.getFilesUploadedBlockchain(this.accessControlContract, selectedUser.account, selectedUser.account);
    return files;
  }

  // Gets the user, according to a certain username
  async getUserAccount(usernameToShare) {
    return await BlockchainWrapper.getUserAccount(usernameToShare, this.userRegisterContract, this.selectedUser.account);
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
  addFile(file) {
    return BlockchainWrapper.addFile(this.fileRegisterContract, file, this.selectedUser.account);
  }

  // Associates a user with a file
  associatedUserFile(userAccount, fileIpfsCid, encSymmetricKey) {
    return BlockchainWrapper.associatedUserFile(this.accessControlContract, userAccount, fileIpfsCid, encSymmetricKey, this.selectedUser.account);
  }

  // Updates the users' permissions over a file
  updateUserFilePermissions(userAccount, fileIpfsCid, permissionsArray) {
    return BlockchainWrapper.updateUserFilePermissions(this.accessControlContract, userAccount, fileIpfsCid, permissionsArray, this.selectedUser.account);
  }

  // Associates a user with a file, given certain permissions
  fileShare(userAccount, fileIpfCid, encryptedSymmetricKeyShared, permissionsArray) {
    return BlockchainWrapper.fileShare(this.accessControlContract, userAccount, fileIpfCid, encryptedSymmetricKeyShared, permissionsArray, this.selectedUser.account);
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
  verifyUserAssociatedWithFile(userAccount, fileIpfsCid) {
    return BlockchainWrapper.verifyUserAssociatedWithFile(this.accessControlContract, fileIpfsCid, userAccount, this.selectedUser.account);
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

  // TODO: get CID from the blockchain, delete file from IPFS, delete CID from the blockchain
  deleteFile() {}
  // TODO
  verifyFile() {}

}

export default FileManagerFacade;