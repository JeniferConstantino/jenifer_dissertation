import BlockchainManager from './Managers/BlockchainManager';
import EncryptionManager from './Managers/EncryptionManager';
import IPFSManager from './Managers/IPFSManager';
import UploadFileCommand from './Commands/UploadFileCommand';
import DownloadFileCommand from './Commands/DownloadFileCommand';
import ShareFileCommand from './Commands/ShareFileCommand';

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
  
  // Shares the file with a given user
  async shareFile(selectedFile, permissions, accountUserToShareFileWith) {
    const shareCommand = new ShareFileCommand(this, selectedFile, permissions, accountUserToShareFileWith);
    shareCommand.execute();
  }

  // Get all files that were uploaded too the blockchain
  async getFilesUploadedBlockchain(accessControlContract, selectedUser) {
    const files = await BlockchainManager.getFilesUploadedBlockchain(accessControlContract, selectedUser);
    return files;
  }

  // Gets the user, according to a certain username
  async getUserAccount(usernameToShare) {
    const userToShareFileWith = await BlockchainManager.getUserAccount(usernameToShare, this.userRegisterContract, this.selectedUser);
    return userToShareFileWith;
  }

  // Gets the permissions a given user has over a file
  async getPermissionsUserOverFile(accountUserToGetPermssion, selectedFile){
    const userPermissions = await BlockchainManager.getPermissionsUserOverFile(this.accessControlContract, accountUserToGetPermssion, selectedFile, this.selectedUser);
    return userPermissions;
  }

  // Gets the public key of a given user
  async getPubKeyUser(accountUser){
    const userPublicKey = await BlockchainManager.getPublicKey(this.userRegisterContract, accountUser, this.selectedUser);
    return userPublicKey;
  }

  // Stores a file in the blockchain
  storeFileBlockchain(fileUploaded, symmetricKey, selectedUser, accessControlContract, fileRegisterContract) {
    return BlockchainManager.storeFileBlockchain(fileUploaded, symmetricKey, selectedUser, accessControlContract, fileRegisterContract);
  }

  // Gets a key pair: public key and private key
  generateKeyPair() {
    return EncryptionManager.generateKeyPair();
  }

  // Decrypts a symmetric key using a private key
  decryptSymmetricKey(encSymmetricKeyBuffer, privateKey) {
    return EncryptionManager.decryptSymmetricKey(encSymmetricKeyBuffer, privateKey);
  }

  // Encrypts a symmetric key using a public key
  encryptSymmetricKey(decryptedSymmetricKey, publicKey) {
    return EncryptionManager.encryptSymmetricKey(decryptedSymmetricKey, publicKey);
  }

  // Decrypts a file uising a symmetric key
  async decryptFileWithSymmetricKey(accessControlContract, selectedFile, selectedUser, fileContent) {
    return await EncryptionManager.decryptFileWithSymmetricKey(accessControlContract, selectedFile, selectedUser, fileContent);
  }

  // Retursn all files in IPFS
  async getFileFromIPFS(ipfsCID){
    return await IPFSManager.getFileFromIPFS(ipfsCID);
  }

  // Adds a file to IPFS
  async addFileToIPFS(fileAsBuffer) {
    return await IPFSManager.addFileToIPFS(fileAsBuffer);
  }

  // TODO: get CID from the blockchain, delete file from IPFS, delete CID from the blockchain
  deleteFile() {}
  // TODO
  verifyFile() {}

}

export default FileManagerFacade;