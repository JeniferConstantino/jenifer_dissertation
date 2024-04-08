import { FileManagerFacade } from '../helpers/FileManagerFacade'; 
import { FileApp } from '../helpers/FileApp'; 
import ShareFileCommand from "../helpers/Commands/ShareFileCommand";

// Mocking localStorage
const localStorageMock = {
    getItem: jest.fn().mockReturnValue('privateKey'),
    setItem: jest.fn(),
    clear: jest.fn()
};
  
global.localStorage = localStorageMock;

// Mock dependencies => to isolates  the test
jest.mock('../helpers/FileManagerFacade', () => ({
    FileManagerFacade: jest.fn().mockImplementation(() => ({
        verifyUserAssociatedWithFile: jest.fn(),
        getEncSymmetricKeyFileUser: jest.fn(),
        getPubKeyUser: jest.fn(),
        encryptSymmetricKeys: jest.fn(),
        encryptSymmetricKey: jest.fn(),
        fileShare: jest.fn(),
        getAllEncSymmetricKeyFileUser: jest.fn(),
        decryptSymmetricKeys: jest.fn(),
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

describe('ShareFileCommand', () => {

    let fileManager;
    let selectedFile;
    let permissions;
    let accountUserToShareFileWith;
    let shareFileCommand;

    beforeEach(() => {
        fileManager = new FileManagerFacade();
        selectedFile = new FileApp();
        permissions = {edit: true, delete: false};
        accountUserToShareFileWith = 'mocked_account';
        shareFileCommand = new ShareFileCommand(fileManager, selectedFile, permissions, accountUserToShareFileWith);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('execute', () => { 
        describe('when everything is executed correctly', () => {
            it('should share the file', async () => {
                // Arrange
                fileManager.verifyUserAssociatedWithFile.mockResolvedValueOnce(false); 
                fileManager.getAllEncSymmetricKeyFileUser.mockResolvedValueOnce({success: true, resultStrings: ['mocked_enc_symmetric_key']});
                fileManager.decryptSymmetricKeys.mockResolvedValueOnce(['mocked_decrypted_symmetric_key']);                
                fileManager.getPubKeyUser.mockResolvedValueOnce({ success: true, resultString: 'mocked_public_key' });
                fileManager.encryptSymmetricKeys.mockResolvedValueOnce(['mocked_encrypted_symmetric_key']);
                fileManager.fileShare.mockResolvedValueOnce(); 
                fileManager.verifyUserAssociatedWithFile.mockResolvedValueOnce(true); 
    
                // Act
                await shareFileCommand.execute();
    
                // Assert
                expect(fileManager.verifyUserAssociatedWithFile).toHaveBeenCalledWith(accountUserToShareFileWith, selectedFile.ipfsCID);
                expect(fileManager.getAllEncSymmetricKeyFileUser).toHaveBeenCalledWith(fileManager.selectedUser.account, selectedFile.ipfsCID);
                expect(fileManager.getPubKeyUser).toHaveBeenCalledWith(accountUserToShareFileWith);
                expect(fileManager.encryptSymmetricKeys).toHaveBeenCalledWith(['mocked_decrypted_symmetric_key'], 'mocked_public_key');
                expect(fileManager.fileShare).toHaveBeenCalledWith(accountUserToShareFileWith, selectedFile.ipfsCID, ['mocked_encrypted_symmetric_key'], ['edit']);
                expect(console.log).toHaveBeenCalledWith("File Shared.");
            });
        });
        describe('when it fails fo get the encrypted symmetric key of the user', () => {
            it('should return error', async () => {
                // Arrange
                fileManager.getEncSymmetricKeyFileUser.mockResolvedValueOnce({ success: false, resultString: '' });
                fileManager.getAllEncSymmetricKeyFileUser.mockResolvedValueOnce({success: true, resultStrings: ['mocked_enc_symmetric_key']});
                fileManager.getPubKeyUser.mockResolvedValueOnce({ success: true, resultString: 'mocked_public_key' });
    
                // Act
                await shareFileCommand.execute();
    
                // Assert
                expect(fileManager.verifyUserAssociatedWithFile).toHaveBeenCalledWith(accountUserToShareFileWith, selectedFile.ipfsCID);
                expect(console.log).toHaveBeenCalledWith("Something went wrong while trying to associate the user with the file.");
            });
        });
        describe('when the suer is already associated with the file', () => {
            it('should return error', async () => {
                // Arrange
                fileManager.verifyUserAssociatedWithFile.mockResolvedValueOnce(true);
    
                // Act
                await shareFileCommand.execute();
    
                // Assert
                expect(fileManager.verifyUserAssociatedWithFile).toHaveBeenCalledWith(accountUserToShareFileWith, selectedFile.ipfsCID);
                expect(console.log).toHaveBeenCalledWith("It was called 'ShareFileCommand' but the user: ", accountUserToShareFileWith, " is already associated with the file: ", selectedFile.fileName);
            });
        });
        describe('when it fails to get the public key', () => {
            it('should console log an error', async () => {
                // Assert
                fileManager.verifyUserAssociatedWithFile.mockResolvedValueOnce(false); 
                fileManager.getAllEncSymmetricKeyFileUser.mockResolvedValueOnce({ success: true, resultString: 'mocked_enc_symmetric_key' });
                fileManager.decryptSymmetricKeys.mockReturnValue("mocked_decrypted_symmetric_key");
                fileManager.getPubKeyUser.mockResolvedValue({
                    success: false,
                    resultString: ''
                });
    
                // Act 
                await shareFileCommand.execute();
    
                // Arrange
                expect(console.log).toHaveBeenCalledWith('Something went wrong while trying to get the public key of the user.');
            })
        });
    });
});
