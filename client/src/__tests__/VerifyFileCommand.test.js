import { FileManagerFacade } from '../helpers/FileManagerFacade'; 
import VerifyFileCommand from '../helpers/Commands/VerifyFileCommand';

// Mock dependencies => to isolates  the test
jest.mock('../helpers/FileManagerFacade', () => ({
    FileManagerFacade: jest.fn().mockImplementation(() => ({
        generateHash256: jest.fn(),
        verifyValidFile: jest.fn(),
        selectedUser: { account: 'mocked_account' },
    }))
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

    let fileManager;
    let fileAsBuffer;
    let verifyFileCommand;

    beforeEach(() => {
        fileManager = new FileManagerFacade();
        fileAsBuffer = Buffer.from("some content");
        verifyFileCommand = new VerifyFileCommand(fileManager, );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('execute', () => { 
        it('should verify the file', async () => {
            // Arrange
            const mockFileHash = 'mockedHash';
            const mockValidFile = true;

            fileManager.generateHash256.mockResolvedValue(mockFileHash);
            fileManager.verifyValidFile.mockResolvedValue(mockValidFile);

            // Act
            const result = await verifyFileCommand.execute();

            // Assert
            expect(result).toBe(true); 
            expect(fileManager.verifyValidFile).toHaveBeenCalledWith(fileManager.selectedUser.account, mockFileHash);
        });
    });
});