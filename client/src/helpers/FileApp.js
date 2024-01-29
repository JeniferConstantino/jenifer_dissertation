class FileApp {
    constructor(fileName, symmetricKey, owner, ipfsCID, fileType) {
      this.fileName = fileName; // Unique
      this.encSymmetricKey = symmetricKey;
      this.owner = owner;
      this.ipfsCID = ipfsCID;
      this.fileType = fileType;
    }
}

export default FileApp;
