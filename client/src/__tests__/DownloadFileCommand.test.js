import DownloadFileCommand from "../helpers/Commands/DownloadFileCommand";
import { FileApp } from '../helpers/FileApp'; 

// Mock dependencies => to isolates  the test
jest.mock('../helpers/FileManagerFacade', () => ({
    FileManagerFacade: jest.fn().mockImplementation()
}));

jest.mock('../helpers/FileApp', () => ({
    FileApp: jest.fn().mockImplementation(() => ({
        ipfsCID: 'mocked_ipfsCID_1'
    }))
}));

console.error = jest.fn();
console.log = jest.fn();

describe('DownloadFileCommand', () => {

    let selectedFile;
    let downloadFileCommand;
    let mockFileContent;
    let selectedUserAccountMock;
    let getFileFromIPFSMock;
    let getEncSymmetricKeyFileUserMock;
    let decryptFileWithSymmetricKeyMock;
    let downloadFileAuditMock;

    beforeEach(() => {
        selectedFile = new FileApp();
        selectedUserAccountMock = "mocked_account";
        getFileFromIPFSMock = jest.fn();
        getEncSymmetricKeyFileUserMock = jest.fn();
        decryptFileWithSymmetricKeyMock = jest.fn();
        downloadFileAuditMock = jest.fn();
        downloadFileCommand = new DownloadFileCommand(selectedUserAccountMock, selectedFile, getFileFromIPFSMock, getEncSymmetricKeyFileUserMock, decryptFileWithSymmetricKeyMock, downloadFileAuditMock);
        
        mockFileContent = "some content on the file received from IPFS";
        getFileFromIPFSMock.mockResolvedValue(mockFileContent);

        const mockEncSymmetricKey = "some encrypted symmetric key the user has over the file";
        getEncSymmetricKeyFileUserMock.mockResolvedValue({
            success: true,
            resultString: mockEncSymmetricKey
        });

        const mockDecryptedFileWithSymKey = Buffer.from("some file content that has been decript by the symmetric key");
        decryptFileWithSymmetricKeyMock.mockResolvedValue(mockDecryptedFileWithSymKey);

        downloadFileAuditMock.mockResolvedValue();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('execute', () => { 
        describe('when it executes everything properly', () => {
            it('should download the file', async () => {
                // Arrange
                
                // Act
                await downloadFileCommand.execute();
    
                // Assert
                expect(getFileFromIPFSMock).toHaveBeenCalledWith(selectedFile.ipfsCID);
                expect(getEncSymmetricKeyFileUserMock).toHaveBeenCalledWith(selectedUserAccountMock, selectedFile.ipfsCID);
                expect(decryptFileWithSymmetricKeyMock).toHaveBeenCalledWith(selectedFile, expect.any(Buffer), mockFileContent);
                expect(downloadFileAuditMock).toHaveBeenCalledWith(selectedFile.ipfsCID, selectedUserAccountMock);
            });
        });
        describe('when it fails on executing the download', () => {
            it('should console log the error', async () => {
                // Arrange
                const mockError = new Error('Mock error while downloading file');
                downloadFileAuditMock.mockRejectedValueOnce(mockError);
    
                // Act
                await downloadFileCommand.execute();
    
                // Assert
                expect(console.error).toHaveBeenCalledWith('Error decrypting or downloading file: ', mockError);
            });
        });
        describe('when it fails to get the encrypted symmetric key', () => {
            it('should console log the error', async () => {
                // Arrange
                getEncSymmetricKeyFileUserMock.mockResolvedValue({ success: false, resultStrings: [] });
    
                // Act
                await downloadFileCommand.execute();
    
                // Assert
                expect(console.log).toHaveBeenCalledWith('Something went wrong while trying to get the encrypted symmetric key of the users file.');
            });
        });
    });
});
