import DropUpload from "../helpers/Commands/DropUpload";
import { FileManagerFacade } from '../helpers/FileManagerFacade'; 
import { FileApp } from '../helpers/FileApp'; 

// Mocking localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    clear: jest.fn()
};
  
global.localStorage = localStorageMock;

// Mock dependencies => to isolates  the test
jest.mock('../helpers/FileManagerFacade', () => ({
    FileManagerFacade: jest.fn().mockImplementation(() => ({
        uploadFileUser: jest.fn(),
        encryptSymmetricKey: jest.fn(),
        selectedUser: { account: 'mocked_account' }
    }))
}));

jest.mock('../helpers/FileApp', () => ({
    FileApp: jest.fn().mockImplementation(() => ({
        ipfsCID: 'mocked_ipfsCID_1',
        fileName: "file1.pdf",
        version: 0,
        prevIpfsCID: "0",
        owner: "mocked_account",
        _fileType: 'file',
        iv: "file1_iv",
        state: "active",
        fileHash: "fileHash1"
    }))
}));

// Necessary to implement the test storeFile
FileApp.FileType = {
    Image: 'image',
    File: 'file'
};

FileApp.getFileType = jest.fn().mockImplementation((fileName) => {
    if(fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || fileName.endsWith('.png') || fileName.endsWith('.gif')){
        return FileApp.FileType.Image;
    } else if (fileName.endsWith('.docx') || fileName.endsWith('.odt') || fileName.endsWith('.pdf')) {
        return FileApp.FileType.File;
    } else {
        return 'invalid';
    }
});

console.error = jest.fn();

describe('DropUpload', () => {

    let fileManager;
    let fileUplName;
    let fileAsBuffer;
    let handleFileUploaded;
    let uploadedActiveFiles;
    let uploadedFiles;
    let dropUpload;

    beforeEach(() => {
        fileManager = new FileManagerFacade();
        fileUplName = "file1.pdf";
        fileAsBuffer = Buffer.from("some content");
        handleFileUploaded = jest.fn();
        uploadedActiveFiles = [];
        uploadedFiles = [];
        dropUpload = new DropUpload(fileManager, fileUplName, fileAsBuffer, handleFileUploaded, uploadedActiveFiles, uploadedFiles);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('storeFile', () => {
        it('should store the file', async () => {
            // Arrange
            const symmetricKey = 'mockedSymmetricKey';
            const iv = Buffer.from('mockedIV');
            const fileHash = 'mockedFileHash';
            const fileCID = 'mockedFileCID';
            dropUpload.fileManager.uploadFileUser = jest.fn().mockResolvedValueOnce();
            const mockEncSymmetricKey = "mockEncryptedSymmetricKe";
            fileManager.encryptSymmetricKey.mockResolvedValue(Buffer.from(mockEncSymmetricKey, 'base64'));

            // Act
            const storedFile = await dropUpload.storeFile(symmetricKey, iv, fileHash, fileCID);

            // Assert
            expect(storedFile).toBeDefined();
            expect(storedFile.fileName).toBe('file1.pdf'); 
            expect(storedFile.version).toBe(0);
        });
    });
});