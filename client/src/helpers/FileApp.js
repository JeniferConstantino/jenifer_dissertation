class FileApp {

  //Enum declaration
  static FileType = {
    Image: 'image',
    File: 'file'
  }

  // Enum permissions
  static FilePermissions = {
      Download: 'download',
      Delete: 'delete',
      Share: 'share',
      Verify: 'verify'
  }

  constructor(fileName, owner, ipfsCID, iv) {
    this.fileName = fileName;             // Unique
    this.owner = owner;                   // The owner - who uploaded the file
    this.ipfsCID = ipfsCID;               // CID from IPFS (hash)
    this.iv = iv;                         // Initialization Vector for AES (used in file encryption and decryption with symmetric key)
    this._fileType = "";                  // image or file
  }

  // returns the fileType
  get fileType() {
    return this._fileType;
  }

  // sets the fileType
  set fileType(fileType) {
    this._fileType = fileType;
  }

  // Determines the file type
  defineFileType(fileName) {
    if(fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || fileName.endsWith('.png') || fileName.endsWith('.gif')){
      return FileApp.FileType.Image;
    } else if (fileName.endsWith('.docx') || fileName.endsWith('.odt') || fileName.endsWith('.pdf')) {
      return FileApp.FileType.File;
    } else {
      throw new Error('File not supported. Supported types: .jpg, .jpeg, .png, .gif, .docx, .odt, .pdf');
    }
  }

}

export default FileApp;
