import { FileApp } from '../helpers/FileApp'; 
import UpdatePermissionsCommand from '../helpers/Commands/UpdatePermissionsCommand';

// Mock dependencies => to isolates  the test
jest.mock('../helpers/FileManagerFacade', () => ({
    FileManagerFacade: jest.fn().mockImplementation(() => ({
        verifyUserAssociatedWithFile: jest.fn(),
        updateUserFilePermissions: jest.fn(),
        getPermissionsOverFile: jest.fn(),
        removeUserFileAssociation: jest.fn(),
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

describe('UpdatePermissionsCommand', () => {

    let selectedFile;
    let permissions;
    let accountUserToShareFileWith;
    let updatePermissionsCommand;
    let verifyUserAssociatedWithFile;
    let updateUserFilePermissions;
    let getPermissionsOverFile;
    let removeUserFileAssociation;

    beforeEach(() => {
        selectedFile = new FileApp();
        permissions = {edit: true, delete: false};
        accountUserToShareFileWith = 'mocked_account';
        verifyUserAssociatedWithFile = jest.fn();
        updateUserFilePermissions = jest.fn();
        getPermissionsOverFile = jest.fn();
        removeUserFileAssociation = jest.fn();
        updatePermissionsCommand = new UpdatePermissionsCommand(selectedFile, permissions, accountUserToShareFileWith, verifyUserAssociatedWithFile, updateUserFilePermissions, getPermissionsOverFile, removeUserFileAssociation);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('execute', () => { 
        describe('when permissions input are given, and the user is already associated with the file', () => {
            it('should update a users permissions over a file', async () => {
                // Arrange
                verifyUserAssociatedWithFile.mockResolvedValue(true);
                updateUserFilePermissions.mockResolvedValue();
                getPermissionsOverFile.mockResolvedValue({ resultStrings: ['edit'] });
    
                // Act
                await updatePermissionsCommand.execute();
    
                // Assert
                expect(verifyUserAssociatedWithFile).toHaveBeenCalledWith(accountUserToShareFileWith, selectedFile.ipfsCID);
                expect(updateUserFilePermissions).toHaveBeenCalledWith(accountUserToShareFileWith, selectedFile.ipfsCID, ['edit']);
                expect(getPermissionsOverFile).toHaveBeenCalledWith(accountUserToShareFileWith, selectedFile.ipfsCID);
                expect(console.log).toHaveBeenCalledWith("File Shared.");
            });
        });
        describe('when no permissions are given and the user is associated with the file', () => {
            it('should remove the relationship between the user and the file', async () => {
                // Arrange
                verifyUserAssociatedWithFile.mockResolvedValueOnce(true);
                removeUserFileAssociation.mockResolvedValue();
                verifyUserAssociatedWithFile.mockResolvedValueOnce(false);
    
                permissions = {};
                updatePermissionsCommand = new UpdatePermissionsCommand(selectedFile, permissions, accountUserToShareFileWith, verifyUserAssociatedWithFile, updateUserFilePermissions, getPermissionsOverFile, removeUserFileAssociation);
    
                // Act
                await updatePermissionsCommand.execute();
    
                // Assert
                expect(verifyUserAssociatedWithFile).toHaveBeenCalledWith(accountUserToShareFileWith, selectedFile.ipfsCID);
                expect(removeUserFileAssociation).toHaveBeenCalledWith(accountUserToShareFileWith, selectedFile.ipfsCID);
                expect(console.log).toHaveBeenCalledWith("Relationship removed");
            });
        });
        describe('when the user is not already associated with the file', () => {
            it('should return error', async () => {
                // Arrange
                verifyUserAssociatedWithFile.mockResolvedValue(false);
                
                // Act
                await updatePermissionsCommand.execute();
    
                // Assert
                expect(verifyUserAssociatedWithFile).toHaveBeenCalledWith(accountUserToShareFileWith, selectedFile.ipfsCID);
                expect(console.log).toHaveBeenCalled();
            });
        });
        describe('when getPermissionsOverFile fails', () => {
            it('should console.log an error', async () => {
                // Arrange
                verifyUserAssociatedWithFile.mockResolvedValue(true);
                updateUserFilePermissions.mockResolvedValue();
                getPermissionsOverFile.mockResolvedValue({ success: true, resultStrings: ['read', 'write'] });
    
                // Act
                await updatePermissionsCommand.execute();
    
                // Assert
                expect(verifyUserAssociatedWithFile).toHaveBeenCalledWith(accountUserToShareFileWith, selectedFile.ipfsCID);
                expect(updateUserFilePermissions).toHaveBeenCalledWith(accountUserToShareFileWith, selectedFile.ipfsCID, ['edit']);
                expect(getPermissionsOverFile).toHaveBeenCalledWith(accountUserToShareFileWith, selectedFile.ipfsCID);
                expect(console.log).toHaveBeenCalledWith("Something went wrong while trying to associate the user with the file.");
            });
        });  
    });
});