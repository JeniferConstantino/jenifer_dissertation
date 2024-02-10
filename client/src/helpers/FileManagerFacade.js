import IPFSManager from './IPFSManager';
import BlockchainManager from './BlockchainManager';
import EncryptionManager from './EncryptionManager';
import FileApp from './FileApp';
import {Buffer} from 'buffer';

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
    // Encrypts and adds file to IPFS
    const {fileCID, symmetricKey, iv} = await IPFSManager.addFileToIPFS(fileAsBuffer);
    console.log('File encrypted and added to IPFS', fileCID);

    // Prepares the file to be stored
    let fileUploaded = new FileApp(fileUpl.name.toLowerCase().toString(), this.selectedUser.account, fileCID, iv.toString('base64'));
    fileUploaded.fileType = fileUploaded.defineFileType(fileUpl.name);
  
    // Adds the file to the blockchain
    BlockchainManager.storeFileBlockchain(fileUploaded, symmetricKey, this.selectedUser, this.storeFileContract).then(({receipt, fileUploaded}) => {
      var tempUpdatedUploadedFiles = [...uploadedFiles, fileUploaded]; // Updates the state with the result
      console.log('File added to the blockchain');

      handleFileUploaded(tempUpdatedUploadedFiles);
    }).catch(err => {
        console.log(err);
    })
  }
  
  // Gets the file from IPFS, decryts and downloads
  async downloadFile(selectedFile) {
    try {
      // Gets the file from IPFS
      const fileContent = await IPFSManager.getFileFromIPFS(selectedFile.ipfsCID);
      console.log("Accessed file in IPFS.");

      // Decrypts the file
      const decryptedFileBuffer = await EncryptionManager.decryptFileWithSymmetricKey(this.storeFileContract, selectedFile, this.selectedUser, fileContent);
      const blob = new Blob([decryptedFileBuffer]);
      console.log("File Decrypted.");
      
      // Creates a downloaded link 
      const downloadLink = document.createElement("a");
      downloadLink.href = URL.createObjectURL(blob);
      downloadLink.download = selectedFile.fileName;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (error) {
      console.error("Error decrypting or downloading file: ", error);
    } 
  }
  
  // TODO: get CID from the blockchain, delete file from IPFS, delete CID from the blockchain
  deleteFile() {
    
  }

  // Shares the file with a given user
  async shareFile(selectedFile, permissions, userToShareFileWith) {
    // Gets only the selected permissions
    const permissionsArray = Object.entries(permissions).filter(([key, value]) => value===true).map(([key, value]) => key);
    
    // Decrypts the files' symmetric key using the current logged user private key
    var encSymmetricKey = await this.storeFileContract.methods.getEncSymmetricKeyFileUser(this.selectedUser, selectedFile).call({from: this.selectedUser.account});
    var encSymmetricKeyBuffer = Buffer.from(encSymmetricKey, 'base64');
    var decryptedSymmetricKey = EncryptionManager.decryptSymmetricKey(encSymmetricKeyBuffer, this.selectedUser.privateKey);
    
    // Encrypts the files' symmetric key using the public key of the user to share the file with
    var encryptedSymmetricKeyShared = EncryptionManager.encryptSymmetricKey(decryptedSymmetricKey, userToShareFileWith.publicKey);
    // Stores the share information in the blockchain
    const receipt = await this.storeFileContract.methods.storeUserHasFile(
        userToShareFileWith, 
        selectedFile, 
        encryptedSymmetricKeyShared.toString('base64'),
        permissionsArray
    ).send({ from: this.selectedUser.account });
    console.log("File Shared. Receipt: ", receipt); 
  }

  // TODO
  verifyFile() {
      
  }

}

export default FileManagerFacade;