import DropFileCommand from "../helpers/Commands/DropFileCommand";

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

console.error = jest.fn();
console.log = jest.fn();

describe('DropFileCommand', () => {

    let fileAsBuffer
    let dropFileCommand;
    let generateSymmetricKey = jest.fn();
    let encryptFileWithSymmetricKey = jest.fn();
    let addFileToIPFS = jest.fn();
    let generateHash256 = jest.fn();
    let getFileByIpfsCID = jest.fn();
    let getPermissionsOverFile = jest.fn();
    let selectedUserAccount = 'mocked_account';

    beforeEach(() => {
        fileAsBuffer = Buffer.from("some content");
        dropFileCommand = new DropFileCommand(fileAsBuffer, generateSymmetricKey, encryptFileWithSymmetricKey, addFileToIPFS, generateHash256, getFileByIpfsCID, getPermissionsOverFile, selectedUserAccount);
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
                generateSymmetricKey = generateSymmetricKey.mockReturnValue('mockedSymmetricKey');
                
                encryptFileWithSymmetricKey = encryptFileWithSymmetricKey.mockResolvedValue({ encryptedFile: 'mockedEncryptedFile', iv: 'mockedIV' });
                addFileToIPFS = addFileToIPFS.mockResolvedValue('mocked_ipfsCID');
                generateHash256 = generateHash256.mockResolvedValue('mockedFileHash');
                getFileByIpfsCID = getFileByIpfsCID.mockResolvedValue({ success: true });
                getPermissionsOverFile = getPermissionsOverFile.mockResolvedValue({ success: true });
    
                // Act
                await dropFileCommand.execute();
    
                // Assert
                expect(generateSymmetricKey).toHaveBeenCalled();
                expect(addFileToIPFS).toHaveBeenCalledWith('mockedEncryptedFile');
                expect(dropFileCommand.storeFile).toHaveBeenCalledWith('mockedSymmetricKey', 'mockedIV', 'mockedFileHash', 'mocked_ipfsCID');
                expect(getFileByIpfsCID).toHaveBeenCalledWith('mocked_ipfsCID', 'active');
                expect(getPermissionsOverFile).toHaveBeenCalledWith('mocked_account', 'mocked_ipfsCID');
                expect(console.log).toHaveBeenCalledWith('Action performed');
            });
        });
        describe('when it fails in getting the file by it s CID', () => {
            it("should console log the error", async function(){
                // Arrange
                dropFileCommand.storeFile = jest.fn().mockReturnValue({ ipfsCID: 'mocked_ipfsCID' });
                generateSymmetricKey = jest.fn().mockReturnValue('mockedSymmetricKey');
                
                encryptFileWithSymmetricKey = encryptFileWithSymmetricKey.mockResolvedValue({ encryptedFile: 'mockedEncryptedFile', iv: 'mockedIV' });
                addFileToIPFS = addFileToIPFS.mockResolvedValue('mocked_ipfsCID');
                generateHash256 = generateHash256.mockResolvedValue('mockedFileHash');
                getFileByIpfsCID = getFileByIpfsCID.mockResolvedValue({ success: false, error: 'Failed to get file by CID' });
                getPermissionsOverFile = getPermissionsOverFile.mockResolvedValue({ success: true });
    
                // Act
                await dropFileCommand.execute();
    
                // Assert
                expect(console.log).toHaveBeenCalled(); // did not put the error message so the unit test doesn't get to dependent on it
            });
        });
        describe('when it fails in getting the permissions of the file', () => {
            it("shounld console log the error", async function(){
                // Arrange
                dropFileCommand.storeFile = jest.fn().mockReturnValue({ ipfsCID: 'mocked_ipfsCID' });
                generateSymmetricKey = generateSymmetricKey.mockReturnValue('mockedSymmetricKey');
                
                encryptFileWithSymmetricKey = encryptFileWithSymmetricKey.mockResolvedValue({ encryptedFile: 'mockedEncryptedFile', iv: 'mockedIV' });
                addFileToIPFS = addFileToIPFS.mockResolvedValue('mocked_ipfsCID');
                generateHash256 = generateHash256.mockResolvedValue('mockedFileHash');
                getFileByIpfsCID = getFileByIpfsCID.mockResolvedValue({ success: true });
                getPermissionsOverFile = getPermissionsOverFile.mockResolvedValue({ success: false, error: 'Failed to get permissions over file' });
    
                // Act
                await dropFileCommand.execute();
    
                // Assert
                expect(console.log).toHaveBeenCalled();
            });
        });
    });
});