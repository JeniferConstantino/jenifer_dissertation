import DownloadFileCommand from "../helpers/Commands/DownloadFileCommand";
import { FileManagerFacade } from '../helpers/FileManagerFacade'; 
import { FileApp } from '../helpers/FileApp'; 

// Mock dependencies => to isolates  the test
jest.mock('../helpers/FileManagerFacade', () => ({
    FileManagerFacade: jest.fn().mockImplementation(() => ({
        getFileFromIPFS: jest.fn(),
        getEncSymmetricKeyFileUser: jest.fn(),
        decryptFileWithSymmetricKey: jest.fn(),
        downloadFileAudit: jest.fn(),
        selectedUser: { account: 'mocked_account' }
    }))
}));

jest.mock('../helpers/FileApp', () => ({
    FileApp: jest.fn().mockImplementation(() => ({
        ipfsCID: 'mocked_ipfsCID_1'
    }))
}));

console.error = jest.fn();
console.log = jest.fn();

describe('DownloadFileCommand', () => {

    let fileManager;
    let selectedFile;
    let downloadFileCommand;
    let mockFileContent;

    beforeEach(() => {
        fileManager = new FileManagerFacade();
        selectedFile = new FileApp();
        downloadFileCommand = new DownloadFileCommand(fileManager, selectedFile);

        mockFileContent = "some content on the file received from IPFS";
        fileManager.getFileFromIPFS.mockResolvedValue(mockFileContent);

        const mockEncSymmetricKey = "some encrypted symmetric key the user has over the file";
        fileManager.getEncSymmetricKeyFileUser.mockResolvedValue({
            success: true,
            resultString: mockEncSymmetricKey
        });

        const mockDecryptedFileWithSymKey = Buffer.from("some file content that has been decript by the symmetric key");
        fileManager.decryptFileWithSymmetricKey.mockResolvedValue(mockDecryptedFileWithSymKey);

        fileManager.downloadFileAudit.mockResolvedValue();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('execute', () => { 
        it('should download the file', async () => {
            // Arrange
            
            // Act
            await downloadFileCommand.execute();

            // Assert
            expect(fileManager.getFileFromIPFS).toHaveBeenCalledWith(selectedFile.ipfsCID);
            expect(fileManager.getEncSymmetricKeyFileUser).toHaveBeenCalledWith(fileManager.selectedUser.account, selectedFile.ipfsCID);
            expect(fileManager.decryptFileWithSymmetricKey).toHaveBeenCalledWith(selectedFile, expect.any(Buffer), mockFileContent);
            expect(fileManager.downloadFileAudit).toHaveBeenCalledWith(selectedFile.ipfsCID, fileManager.selectedUser.account);
        });

        it('should handle errors gracefully', async () => {
            // Arrange
            const mockError = new Error('Mock error while downloading file');
            fileManager.downloadFileAudit.mockRejectedValueOnce(mockError);

            // Act
            await downloadFileCommand.execute();

            // Assert
            expect(console.error).toHaveBeenCalledWith('Error decrypting or downloading file: ', mockError);
        });

        describe('when it fails to get the encrypted symmetric key', () => {
            it('should console.log the error', async () => {
                // Arrange
                fileManager.getEncSymmetricKeyFileUser.mockResolvedValue({ success: false, resultStrings: [] });
    
                // Act
                await downloadFileCommand.execute();
    
                // Assert
                expect(console.log).toHaveBeenCalledWith('Something went wrong while trying to get the encrypted symmetric key of the users file.');
            });
        });
    });
});
