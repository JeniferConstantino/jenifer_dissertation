import { FileManagerFacade } from '../helpers/FileManagerFacade'; 
import DropFileCommand from "../helpers/Commands/DropFileCommand";

// Mock dependencies => to isolates  the test
jest.mock('../helpers/FileManagerFacade', () => ({
    FileManagerFacade: jest.fn().mockImplementation(() => ({
        generateSymmetricKey: jest.fn(),
        encryptFileWithSymmetricKey: jest.fn(),
        addFileToIPFS: jest.fn(),
        generateHash256: jest.fn(),
        getFileByIpfsCID: jest.fn(),
        getPermissionsOverFile: jest.fn(),
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

console.error = jest.fn();
console.log = jest.fn();

describe('DropFileCommand', () => {

    let fileManager;
    let fileUplName;
    let fileAsBuffer;
    let handleFileUploaded;
    let uploadedActiveFiles;
    let uploadedFiles;
    let dropFileCommand;

    beforeEach(() => {
        fileManager = new FileManagerFacade();
        fileUplName = "file1.pdf";
        fileAsBuffer = Buffer.from("some content");
        handleFileUploaded = jest.fn();
        uploadedActiveFiles = [];
        uploadedFiles = [];
        dropFileCommand = new DropFileCommand(fileManager, fileUplName, fileAsBuffer, handleFileUploaded, uploadedActiveFiles, uploadedFiles);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('storeFile', () => {
        describe('when called directly', () => {
            it('should throw an error', async () => {
                const dropFileCommand = new DropFileCommand();
    
                // Act & Assert
                await expect(dropFileCommand.storeFile()).rejects.toThrow('Method uploadFileAndHandleResult must be implemented by subclasses');
            });
        });
    });

    describe('execute', () => {
        describe('when are no errors while trying to store the file', () => {
            it('should store the file', async () => {
                // Arrange
                dropFileCommand.storeFile = jest.fn().mockReturnValue({ ipfsCID: 'mocked_ipfsCID' });
                fileManager.generateSymmetricKey = jest.fn().mockReturnValue('mockedSymmetricKey');
                
                fileManager.encryptFileWithSymmetricKey = jest.fn().mockResolvedValue({ encryptedFile: 'mockedEncryptedFile', iv: 'mockedIV' });
                fileManager.addFileToIPFS = jest.fn().mockResolvedValue('mocked_ipfsCID');
                fileManager.generateHash256 = jest.fn().mockResolvedValue('mockedFileHash');
                fileManager.getFileByIpfsCID = jest.fn().mockResolvedValue({ success: true });
                fileManager.getPermissionsOverFile = jest.fn().mockResolvedValue({ success: true });
    
                // Act
                await dropFileCommand.execute();
    
                // Assert
                expect(fileManager.generateSymmetricKey).toHaveBeenCalled();
                expect(fileManager.addFileToIPFS).toHaveBeenCalledWith('mockedEncryptedFile');
                expect(dropFileCommand.storeFile).toHaveBeenCalledWith('mockedSymmetricKey', 'mockedIV', 'mockedFileHash', 'mocked_ipfsCID');
                expect(fileManager.getFileByIpfsCID).toHaveBeenCalledWith('mocked_ipfsCID', 'active');
                expect(fileManager.getPermissionsOverFile).toHaveBeenCalledWith('mocked_account', 'mocked_ipfsCID');
                expect(console.log).toHaveBeenCalledWith('Action performed');
            });
        });
        describe('when it fails in getting the file by it s CID', () => {
            it("should console log the error", async function(){
                // Arrange
                dropFileCommand.storeFile = jest.fn().mockReturnValue({ ipfsCID: 'mocked_ipfsCID' });
                fileManager.generateSymmetricKey = jest.fn().mockReturnValue('mockedSymmetricKey');
                
                fileManager.encryptFileWithSymmetricKey = jest.fn().mockResolvedValue({ encryptedFile: 'mockedEncryptedFile', iv: 'mockedIV' });
                fileManager.addFileToIPFS = jest.fn().mockResolvedValue('mocked_ipfsCID');
                fileManager.generateHash256 = jest.fn().mockResolvedValue('mockedFileHash');
                fileManager.getFileByIpfsCID = jest.fn().mockResolvedValue({ success: false, error: 'Failed to get file by CID' });
                fileManager.getPermissionsOverFile = jest.fn().mockResolvedValue({ success: true });
    
                // Act
                await dropFileCommand.execute();
    
                // Assert
                expect(console.log).toHaveBeenCalledWith('Upload file error: Something went wrong while trying to store the file in the blockchain. result: ', { success: false, error: 'Failed to get file by CID' });
            });
        });
        describe('when it fails in getting the permissions of the file', () => {
            it("shounld console log the error", async function(){
                // Arrange
                dropFileCommand.storeFile = jest.fn().mockReturnValue({ ipfsCID: 'mocked_ipfsCID' });
                fileManager.generateSymmetricKey = jest.fn().mockReturnValue('mockedSymmetricKey');
                
                fileManager.encryptFileWithSymmetricKey = jest.fn().mockResolvedValue({ encryptedFile: 'mockedEncryptedFile', iv: 'mockedIV' });
                fileManager.addFileToIPFS = jest.fn().mockResolvedValue('mocked_ipfsCID');
                fileManager.generateHash256 = jest.fn().mockResolvedValue('mockedFileHash');
                fileManager.getFileByIpfsCID = jest.fn().mockResolvedValue({ success: true });
                fileManager.getPermissionsOverFile = jest.fn().mockResolvedValue({ success: false, error: 'Failed to get permissions over file' });
    
                // Act
                await dropFileCommand.execute();
    
                // Assert
                expect(console.log).toHaveBeenCalledWith('Even though the file was stored in the blockchain, something went wrong while trying to associate the user with the file: ', { success: false, error: 'Failed to get permissions over file' });
            });
        });
    });
});