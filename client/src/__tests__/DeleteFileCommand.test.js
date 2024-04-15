import DeleteFileCommand from "../helpers/Commands/DeleteFileCommand";
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

describe('DeleteFileCommand', () => {

    let handleFileDeletedMock;
    let deactivateFileMock;
    let uploadedFiles;
    let selectedFile;

    beforeEach(() => {
        handleFileDeletedMock = jest.fn();
        deactivateFileMock = jest.fn(),
        uploadedFiles = [{ipfsCID: 'mocked_ipfsCID_1'}, {ipfsCID: 'mocked_ipfsCID_2'}];
        selectedFile = new FileApp();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('execute', () => { 
        describe('when there are no errors while trying too delete the file', () => {
            it('should delete the file and call handleFileDeleted', async () => {
                // Arrange selectedFile, handleFileDeleted, uploadedFiles, deactivateFile
                const deleteFileCommand = new DeleteFileCommand(selectedFile, handleFileDeletedMock, uploadedFiles, deactivateFileMock);
    
                // Act
                await deleteFileCommand.execute();
    
                // Assert
                expect(deactivateFileMock).toHaveBeenCalledWith('mocked_ipfsCID_1');
                expect(handleFileDeletedMock).toHaveBeenCalledWith([{ ipfsCID: 'mocked_ipfsCID_2' }]);
            });
        });
        describe('when it fails on deleting a file', () => {
            it('should console log the error', async () => {
                // Arrange
                const deleteFileCommand = new DeleteFileCommand(selectedFile, handleFileDeletedMock, uploadedFiles, deactivateFileMock);
                const mockError = new Error('Mock error while deactivating file');
                deactivateFileMock.mockRejectedValueOnce(mockError);
    
                // Act
                await deleteFileCommand.execute();
    
                // Assert
                expect(console.error).toHaveBeenCalledWith('Error while trying to delete the file: ', mockError);
            });
        });
    });
});
