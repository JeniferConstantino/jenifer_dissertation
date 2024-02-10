import IPFSManager from './IPFSManager';
import BlockchainManager from './BlockchainManager';
import EncryptionManager from './EncryptionManager';
import UploadFileCommand from './Commands/UploadFileCommand';
import DownloadFileCommand from './Commands/DownloadFileCommand';
import ShareFileCommand from './Commands/ShareFileCommand';

class FileManagerFacade {

  constructor(storeFileContract, storeUserContract, selectedUser) {
      this.ipfsManager = new IPFSManager();
      this.blockchainManager = new BlockchainManager();
      this.encryptionManager = new EncryptionManager();
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

  // TODO: get CID from the blockchain, delete file from IPFS, delete CID from the blockchain
  deleteFile() {}
  // TODO
  verifyFile() {}

}

export default FileManagerFacade;