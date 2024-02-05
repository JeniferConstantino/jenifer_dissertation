class FileApp {
    constructor(fileName, owner, ipfsCID, fileType, iv) {
      this.fileName = fileName;             // Unique
      this.owner = owner;                   // The owner - who uploaded the file
      this.ipfsCID = ipfsCID;               // CID from IPFS (hash)
      this.fileType = fileType;             // image or file
      this.iv = iv;                         // Initialization Vector for AES (used in file encryption and decryption with symmetric key)
    }
}

export default FileApp;
