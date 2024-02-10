import BlockchainManager from './Managers/BlockchainManager';
import EncryptionManager from './Managers/EncryptionManager';
import UploadFileCommand from './Commands/UploadFileCommand';
import DownloadFileCommand from './Commands/DownloadFileCommand';
import ShareFileCommand from './Commands/ShareFileCommand';

class FileManagerFacade {

  constructor(storeFileContract, storeUserContract, selectedUser) {
      this.storeFileContract = storeFileContract;
      this.storeUserContract = storeUserContract;
      this.selectedUser = selectedUser;
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
  async shareFile(selectedFile, permissions, userToShareFileWith) {
    const shareCommand = new ShareFileCommand(this, selectedFile, permissions, userToShareFileWith);
    shareCommand.execute();
  }

  async getFilesUploadedBlockchain(storeFileContract, selectedUser) {
    const files = await BlockchainManager.getFilesUploadedBlockchain(storeFileContract, selectedUser);
    return files;
  }

  async getUserToShareFile(usernameToShare) {
    const userToShareFileWith = await BlockchainManager.getUserToShareFile(usernameToShare, this.storeUserContract, this.selectedUser);
    return userToShareFileWith;
  }

  async getPermissionsUserOverFile(userToSeePermission, selectedFile){
    const userPermissions = await BlockchainManager.getPermissionsUserOverFile(this.storeFileContract, userToSeePermission, selectedFile, this.selectedUser);
    return userPermissions;
  }

  generateKeyPair() {
    EncryptionManager.generateKeyPair();
  }

  // TODO: get CID from the blockchain, delete file from IPFS, delete CID from the blockchain
  deleteFile() {}
  // TODO
  verifyFile() {}

}

export default FileManagerFacade;