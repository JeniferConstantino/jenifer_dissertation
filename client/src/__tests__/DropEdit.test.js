import DropEdit from "../helpers/Commands/DropEdit";
import { FileManagerFacade } from '../helpers/FileManagerFacade'; 
import { FileApp } from '../helpers/FileApp'; 

// Mock dependencies => to isolates  the test
jest.mock('../helpers/FileManagerFacade', () => ({
    FileManagerFacade: jest.fn().mockImplementation(() => ({
        getUsersWithDownloadPermissionsFile: jest.fn(),
        getPubKeyUser: jest.fn(),
        encryptSymmetricKey: jest.fn(),
        editFileUpl: jest.fn(),
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
console.log = jest.fn();

describe('DropEdit', () => {

    let fileManager;
    let fileUplName;
    let selectedFile;
    let fileAsBuffer;
    let handleFileUploaded;
    let uploadedActiveFiles;
    let uploadedFiles;
    let dropEdit;

    beforeEach(() => {
        fileManager = new FileManagerFacade();        
        fileUplName = "file1.pdf";
        selectedFile = new FileApp("mocked_ipfsCID_2", "file2", 0, "0", "mocked_account", "file", "file2_iv", "active", "fileHash1");
        fileAsBuffer = Buffer.from("some content");
        handleFileUploaded = jest.fn();
        uploadedActiveFiles = [];
        uploadedFiles = [];
        dropEdit = new DropEdit(fileManager, fileUplName, selectedFile, fileAsBuffer, handleFileUploaded, uploadedActiveFiles, uploadedFiles);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('encryptedSymmetricKeys', () => { 
        it('should return the encrypted symmetric keys of users with download permissions', async () => {
            // Assert
            const mockrResultAddresses = ["mocked_account", "mocked_account_2"]; // account of users with download permissions
            fileManager.getUsersWithDownloadPermissionsFile.mockResolvedValue({
                success: true,
                resultAddresses: mockrResultAddresses
            });

            const mockPubKeyUsers = "mocked_public_key";
            fileManager.getPubKeyUser.mockResolvedValue({
                success: true,
                resultString: mockPubKeyUsers
            });

            const mockEncSymmetricKey = "mockEncryptedSymmetricKe";
            fileManager.encryptSymmetricKey.mockResolvedValue(Buffer.from(mockEncSymmetricKey, 'base64'));

            // Act 
            const encryptedSymmetricKeys = await dropEdit.encryptedSymmetricKeys(selectedFile, fileAsBuffer);
            console.log("encryptedSymmetricKeys: ", encryptedSymmetricKeys);

            // Arrange
            expect(fileManager.getUsersWithDownloadPermissionsFile).toHaveBeenCalledWith(selectedFile);
            expect(fileManager.getPubKeyUser).toHaveBeenCalledWith("mocked_account");
            expect(fileManager.getPubKeyUser).toHaveBeenCalledWith("mocked_account_2");
            expect(fileManager.encryptSymmetricKey).toHaveBeenCalledWith(fileAsBuffer, mockPubKeyUsers);
            expect(encryptedSymmetricKeys.size).toBe(2);
            expect(encryptedSymmetricKeys.get("mocked_account")).toBe(mockEncSymmetricKey);
            expect(encryptedSymmetricKeys.get("mocked_account_2")).toBe(mockEncSymmetricKey);
        });
        it('should handle errors gracefully', async () => {
            // Arrange
            fileManager.getUsersWithDownloadPermissionsFile.mockResolvedValue({
                success: false,
                resultAddresses: []
            });

            const mockPubKeyUsers = "mocked_public_key";
            fileManager.getPubKeyUser.mockResolvedValue({
                success: true,
                resultString: mockPubKeyUsers
            });

            const mockEncSymmetricKey = "mockEncryptedSymmetricKe";
            fileManager.encryptSymmetricKey.mockResolvedValue(Buffer.from(mockEncSymmetricKey, 'base64'));

            // Act
            const encryptedSymmetricKeys = await dropEdit.encryptedSymmetricKeys(selectedFile, fileAsBuffer);

            // Assert
            expect(fileManager.getUsersWithDownloadPermissionsFile).toHaveBeenCalledWith(selectedFile);
            expect(encryptedSymmetricKeys).toEqual(new Map());
        });
        it('should console log an error when it fails to get the public key', async () => {
            // Assert
            const mockrResultAddresses = ["mocked_account", "mocked_account_2"]; // account of users with download permissions
            fileManager.getUsersWithDownloadPermissionsFile.mockResolvedValue({
                success: true,
                resultAddresses: mockrResultAddresses
            });

            fileManager.getPubKeyUser.mockResolvedValue({
                success: false,
                resultString: ''
            });

            // Act 
            await dropEdit.encryptedSymmetricKeys(selectedFile, fileAsBuffer);

            // Arrange
            expect(console.log).toHaveBeenCalledWith('something went wrong while trying to get the users public key.');
        })
    });

    describe('storeFile', () => {
        it('should store the edit file', async () => {
            // Arrange
            const symmetricKey = 'mockedSymmetricKey';
            const iv = Buffer.from('mockedIV');
            const fileHash = 'mockedFileHash';
            const fileCID = 'mockedFileCID';
            const editFileUplMock = jest.spyOn(dropEdit.fileManager, 'editFileUpl').mockResolvedValueOnce(); // Mock the editFileUpl method
            const encryptedSymmetricKeysMock = jest.spyOn(dropEdit, 'encryptedSymmetricKeys').mockResolvedValueOnce(new Map()); // Mock encryptedSymmetricKeys method
            const fileType = FileApp.FileType.File;
            
            // Act
            await dropEdit.storeFile(symmetricKey, iv, fileHash, fileCID);

            // Assert
            expect(encryptedSymmetricKeysMock).toHaveBeenCalledWith(selectedFile, symmetricKey);
            expect(editFileUplMock).toHaveBeenCalledWith(selectedFile, expect.objectContaining({fileType}), expect.any(Array), expect.any(Array));
        });
    });
});
