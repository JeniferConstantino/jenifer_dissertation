class FileApp {
    constructor(fileName, symmetricKey, owner, ipfsCID, fileType, iv) {
      this.fileName = fileName; // Unique
      this.encSymmetricKey = symmetricKey;
      this.owner = owner;
      this.ipfsCID = ipfsCID;
      this.fileType = fileType;
      this.iv = iv; 
    }
}

export default FileApp;
