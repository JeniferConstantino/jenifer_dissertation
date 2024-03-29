import DeleteFileCommand from "../helpers/Commands/DeleteFileCommand";
import { FileManagerFacade } from '../helpers/FileManagerFacade'; 
import { FileApp } from '../helpers/FileApp'; 

// Mock dependencies => to isolates  the test
jest.mock('../helpers/FileManagerFacade', () => ({
    FileManagerFacade: jest.fn().mockImplementation(() => ({
        deactivateFile: jest.fn(),
        selectedUser: { account: 'mocked_account' }
    }))
}));

jest.mock('../helpers/FileApp', () => ({
    FileApp: jest.fn().mockImplementation(() => ({
        ipfsCID: 'mocked_ipfsCID_1'
    }))
}));

console.error = jest.fn();

describe('DeleteFileCommand', () => {

    let handleFileDeletedMock;
    let uploadedFiles;
    let fileManager;
    let selectedFile;

    beforeEach(() => {
        handleFileDeletedMock = jest.fn();
        uploadedFiles = [{ipfsCID: 'mocked_ipfsCID_1'}, {ipfsCID: 'mocked_ipfsCID_2'}];
        fileManager = new FileManagerFacade();
        selectedFile = new FileApp();
    });

    describe('execute', () => { 
        it('should delete the file and call handleFileDeleted', async () => {
            // Arrange
            const deleteFileCommand = new DeleteFileCommand(fileManager, selectedFile, handleFileDeletedMock, uploadedFiles);

            // Act
            await deleteFileCommand.execute();

            // Assert
            expect(fileManager.deactivateFile).toHaveBeenCalledWith('mocked_account', 'mocked_ipfsCID_1');
            expect(handleFileDeletedMock).toHaveBeenCalledWith([{ ipfsCID: 'mocked_ipfsCID_2' }]);
        });

        it('should handle errors gracefully', async () => {
            // Arrange
            const mockError = new Error('Mock error while deactivating file');
            fileManager.deactivateFile.mockRejectedValueOnce(mockError);
            const deleteFileCommand = new DeleteFileCommand(fileManager, selectedFile, handleFileDeletedMock, uploadedFiles);

            // Act
            await deleteFileCommand.execute();

            // Assert
            expect(console.error).toHaveBeenCalledWith('Error while trying to delete the file: ', mockError);
        });
    });
});
