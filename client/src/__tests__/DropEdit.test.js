import DropEdit from "../helpers/Commands/DropEdit";
import { FileApp } from '../helpers/FileApp'; 

// Mock dependencies => to isolates  the test
jest.mock('../helpers/FileManagerFacade', () => ({
    FileManagerFacade: jest.fn().mockImplementation()
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

    let fileUplName;
    let selectedFile;
    let fileAsBuffer;
    let dropEdit;

    let getUsersAssociatedWithFileMock;
    let getPubKeyUserMock;
    let encryptSymmetricKeyMock;
    let editFileUplMock;
    let generateSymmetricKeyMock;
    let encryptFileWithSymmetricKeyMock;
    let addFileToIPFSMock;
    let generateHash256Mock;
    let getFileByIpfsCIDMock;
    let getPermissionsOverFileMock;
    let selectedUserAccountMock;

    beforeEach(() => {    
        fileUplName = "file1.pdf";
        selectedFile = new FileApp("mocked_ipfsCID_2", "file2", 0, "0", "mocked_account", "file", "file2_iv", "active", "fileHash1");
        fileAsBuffer = Buffer.from("some content");
        getUsersAssociatedWithFileMock = jest.fn();
        getPubKeyUserMock = jest.fn();
        encryptSymmetricKeyMock = jest.fn();
        editFileUplMock = jest.fn();
        generateSymmetricKeyMock = jest.fn();
        encryptFileWithSymmetricKeyMock = jest.fn();
        addFileToIPFSMock = jest.fn();
        generateHash256Mock = jest.fn();
        getFileByIpfsCIDMock = jest.fn();
        getPermissionsOverFileMock = jest.fn();
        selectedUserAccountMock = 'mocked_account';
        dropEdit = new DropEdit(fileUplName, selectedFile, getUsersAssociatedWithFileMock, getPubKeyUserMock, encryptSymmetricKeyMock, editFileUplMock, fileAsBuffer, generateSymmetricKeyMock, encryptFileWithSymmetricKeyMock, addFileToIPFSMock, generateHash256Mock, getFileByIpfsCIDMock, getPermissionsOverFileMock, selectedUserAccountMock);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('encryptedSymmetricKeys', () => { 
        describe('when it executes everything properly', () => {
            it('should return the encrypted symmetric keys of users with download permissions', async () => {
                // Assert
                const mockrResultAddresses = ["mocked_account", "mocked_account_2"]; // account of users with download permissions
                getUsersAssociatedWithFileMock.mockResolvedValue({
                    success: true,
                    resultAddresses: mockrResultAddresses
                });
    
                const mockPubKeyUsers = "mocked_public_key";
                getPubKeyUserMock.mockResolvedValue({
                    success: true,
                    resultString: mockPubKeyUsers
                });
    
                const mockEncSymmetricKey = "mockEncryptedSymmetricKe";
                encryptSymmetricKeyMock.mockResolvedValue(Buffer.from(mockEncSymmetricKey, 'base64'));
    
                // Act 
                const encryptedSymmetricKeys = await dropEdit.encryptedSymmetricKeys(selectedFile, fileAsBuffer)
    
                // Arrange
                expect(getUsersAssociatedWithFileMock).toHaveBeenCalledWith("mocked_ipfsCID_1");
                expect(getPubKeyUserMock).toHaveBeenCalledWith("mocked_account");
                expect(getPubKeyUserMock).toHaveBeenCalledWith("mocked_account_2");
                expect(encryptSymmetricKeyMock).toHaveBeenCalledWith(fileAsBuffer, mockPubKeyUsers);
                expect(encryptedSymmetricKeys.size).toBe(2);
                expect(encryptedSymmetricKeys.get("mocked_account")).toBe(mockEncSymmetricKey);
                expect(encryptedSymmetricKeys.get("mocked_account_2")).toBe(mockEncSymmetricKey);
            });
        });
        describe('when it fails in geting users with download permissions over a file', () => {
            it('should handle errors gracefully', async () => {
                // Arrange
                getUsersAssociatedWithFileMock.mockResolvedValue({
                    success: false,
                    resultAddresses: []
                });
    
                const mockPubKeyUsers = "mocked_public_key";
                getPubKeyUserMock.mockResolvedValue({
                    success: true,
                    resultString: mockPubKeyUsers
                });
    
                const mockEncSymmetricKey = "mockEncryptedSymmetricKe";
                encryptSymmetricKeyMock.mockResolvedValue(Buffer.from(mockEncSymmetricKey, 'base64'));
    
                // Act
                const encryptedSymmetricKeys = await dropEdit.encryptedSymmetricKeys(selectedFile, fileAsBuffer);
    
                // Assert
                expect(getUsersAssociatedWithFileMock).toHaveBeenCalledWith("mocked_ipfsCID_1");
                expect(encryptedSymmetricKeys).toEqual(new Map());
            });
        });
        describe('when it fails to get the public key', () => {
            it('should console log the error', async () => {
                // Assert
                const mockrResultAddresses = ["mocked_account", "mocked_account_2"]; // account of users with download permissions
                getUsersAssociatedWithFileMock.mockResolvedValue({
                    success: true,
                    resultAddresses: mockrResultAddresses
                });
    
                getPubKeyUserMock.mockResolvedValue({
                    success: false,
                    resultString: ''
                });
    
                // Act 
                await dropEdit.encryptedSymmetricKeys(selectedFile, fileAsBuffer);
    
                // Arrange
                expect(console.log).toHaveBeenCalledWith('something went wrong while trying to get the users public key.');
            })
        });
    });

    describe('storeFile', () => {
        it('should store the edit file', async () => {
            // Arrange
            const symmetricKey = 'mockedSymmetricKey';
            const iv = Buffer.from('mockedIV');
            const fileHash = 'mockedFileHash';
            const fileCID = 'mockedFileCID';
            const editFileUplMock = jest.spyOn(dropEdit, 'editFileUpl').mockResolvedValueOnce(); // Mock the editFileUpl method
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
