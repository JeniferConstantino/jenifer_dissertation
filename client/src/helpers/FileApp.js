class FileApp {

  //Enum declaration
  static FileType = {
    Image: 'image',
    File: 'file'
  }

  // Enum permissions
  static FilePermissions = {
      Download: 'download',
      Edit: 'edit',
      Delete: 'delete',
      Share: 'share',
      Verify: 'verify',
      Info: 'info'
  }

  constructor(fileName, version, prevIpfsCID, owner, ipfsCID, iv, state, fileHash) {
    this.ipfsCID = ipfsCID;               // CID from IPFS (hash) Unique
    this.fileName = fileName;             // File Name
    this.version = version;               // File Version
    this.prevIpfsCID = prevIpfsCID;       // the IPFS CID of the file from which it was edited. If 1st uload => 0
    this.owner = owner;                   // The owner - who uploaded the file
    this._fileType = "";                  // image or file
    this.iv = iv;                         // Initialization Vector for AES (used in file encryption and decryption with symmetric key)
    this.state = state;                   // Indicates if the file is in the state active or deactive
    this.fileHash = fileHash;             // Hash of the file in SHA-256
  }

  // returns the fileType
  get fileType() {
    return this._fileType;
  }

  // sets the fileType
  set fileType(fileType) {
    this._fileType = fileType;
  }

  // returns the version
  get fileVersion() {
    return this.version;
  }

  // returns the owner
  get fileOwner() {
    return this.owner;
  }

  // returns the ipfsCid
  get fileIpfsCid() {
    return this.ipfsCID;
  }

  // Determines the file type
  static getFileType(fileName) {
    if(fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || fileName.endsWith('.png') || fileName.endsWith('.gif')){
      return FileApp.FileType.Image;
    } else if (fileName.endsWith('.docx') || fileName.endsWith('.odt') || fileName.endsWith('.pdf')) {
      return FileApp.FileType.File;
    } else {
      return 'invalid';
    }
  }

}

export default FileApp;
