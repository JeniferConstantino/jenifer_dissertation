import VerifyFileCommand from '../helpers/Commands/VerifyFileCommand';

// Mock dependencies => to isolates  the test
jest.mock('../helpers/FileManagerFacade', () => ({
    FileManagerFacade: jest.fn().mockImplementation()
}));

jest.mock('../helpers/FileApp', () => ({
    FileApp: jest.fn().mockImplementation(() => ({
        ipfsCID: 'mocked_ipfsCID_1',
        fileName: 'test.jpg',
    }))
}));

console.error = jest.fn();
console.log = jest.fn();

describe('VerifyFileComman', () => {

    let verifyFileCommand;
    let generateHash256;
    let verifyValidFile;
    let recordFileVerification;
    let selectedUserAccount;

    beforeEach(() => {
        generateHash256 = jest.fn();
        verifyValidFile = jest.fn();
        recordFileVerification = jest.fn();
        selectedUserAccount = 'mocked_account';
        const fileAsBuffer = {};
        verifyFileCommand = new VerifyFileCommand(fileAsBuffer, generateHash256, verifyValidFile, recordFileVerification, selectedUserAccount);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('execute', () => { 
        describe('when the file exists in the blockchain, associated to the user and in the active state', () => {
            it('should return true', async () => {
                // Arrange
                const mockFileHash = 'mockedHash';
                const mockValidFile = true;
    
                generateHash256.mockResolvedValue(mockFileHash);
                verifyValidFile.mockResolvedValue(mockValidFile);
    
                // Act
                const result = await verifyFileCommand.execute();
    
                // Assert
                expect(result).toBe(true); 
                expect(verifyValidFile).toHaveBeenCalledWith(selectedUserAccount, mockFileHash);
            });
        });
        describe('when the file does not exists in the blockchain, associated to the user and in the active state', () => {
            it('should return false', async () => {
                // Arrange
                const mockFileHash = 'mockedHash';
                const mockValidFile = false;
    
                generateHash256.mockResolvedValue(mockFileHash);
                verifyValidFile.mockResolvedValue(mockValidFile);
    
                // Act
                const result = await verifyFileCommand.execute();
    
                // Assert
                expect(result).toBe(false); 
                expect(verifyValidFile).toHaveBeenCalledWith(selectedUserAccount, mockFileHash);
            });
        });
    });
});
