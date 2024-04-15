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

describe('ShareFileCommand', () => {

    let selectedFile;
    let permissions;
    let accountUserToShareFileWith;
    let shareFileCommand;
    let verifyUserAssociatedWithFile;
    let getAllEncSymmetricKeyFileUser;
    let decryptSymmetricKeys;
    let getPubKeyUser;
    let encryptSymmetricKeys;
    let fileShare;
    let selectedUserAccount;

    beforeEach(() => {
        selectedFile = new FileApp();
        permissions = {edit: true, delete: false};
        accountUserToShareFileWith = 'mocked_account';
        verifyUserAssociatedWithFile = jest.fn();
        getAllEncSymmetricKeyFileUser = jest.fn();
        decryptSymmetricKeys = jest.fn();
        getPubKeyUser = jest.fn();
        encryptSymmetricKeys = jest.fn();
        fileShare = jest.fn();
        selectedUserAccount = jest.fn();
        shareFileCommand = new ShareFileCommand(selectedFile, permissions, accountUserToShareFileWith, verifyUserAssociatedWithFile, getAllEncSymmetricKeyFileUser, decryptSymmetricKeys, getPubKeyUser, encryptSymmetricKeys, fileShare, selectedUserAccount);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('execute', () => { 
        describe('when everything is executed correctly', () => {
            it('should share the file', async () => {
                // Arrange
                verifyUserAssociatedWithFile.mockResolvedValueOnce(false); 
                getAllEncSymmetricKeyFileUser.mockResolvedValueOnce({success: true, resultStrings: ['mocked_enc_symmetric_key']});
                decryptSymmetricKeys.mockResolvedValueOnce(['mocked_decrypted_symmetric_key']);                
                getPubKeyUser.mockResolvedValueOnce({ success: true, resultString: 'mocked_public_key' });
                encryptSymmetricKeys.mockResolvedValueOnce(['mocked_encrypted_symmetric_key']);
                fileShare.mockResolvedValueOnce(); 
                verifyUserAssociatedWithFile.mockResolvedValueOnce(true); 
    
                // Act
                await shareFileCommand.execute();
    
                // Assert
                expect(verifyUserAssociatedWithFile).toHaveBeenCalledWith(accountUserToShareFileWith, selectedFile.ipfsCID);
                expect(getAllEncSymmetricKeyFileUser).toHaveBeenCalledWith(selectedUserAccount, selectedFile.ipfsCID);
                expect(getPubKeyUser).toHaveBeenCalledWith(accountUserToShareFileWith);
                expect(encryptSymmetricKeys).toHaveBeenCalledWith(['mocked_decrypted_symmetric_key'], 'mocked_public_key');
                expect(fileShare).toHaveBeenCalledWith(accountUserToShareFileWith, selectedFile.ipfsCID, ['mocked_encrypted_symmetric_key'], ['edit']);
                expect(console.log).toHaveBeenCalledWith("File Shared.");
            });
        });
        describe('when it fails fo get the encrypted symmetric key of the user', () => {
            it('should return error', async () => {
                // Arrange
                getAllEncSymmetricKeyFileUser.mockResolvedValueOnce({success: true, resultStrings: ['mocked_enc_symmetric_key']});
                getPubKeyUser.mockResolvedValueOnce({ success: true, resultString: 'mocked_public_key' });
    
                // Act
                await shareFileCommand.execute();
    
                // Assert
                expect(verifyUserAssociatedWithFile).toHaveBeenCalledWith(accountUserToShareFileWith, selectedFile.ipfsCID);
                expect(console.log).toHaveBeenCalledWith("Something went wrong while trying to associate the user with the file.");
            });
        });
        describe('when the suer is already associated with the file', () => {
            it('should return error', async () => {
                // Arrange
                verifyUserAssociatedWithFile.mockResolvedValueOnce(true);
    
                // Act
                await shareFileCommand.execute();
    
                // Assert
                expect(verifyUserAssociatedWithFile).toHaveBeenCalledWith(accountUserToShareFileWith, selectedFile.ipfsCID);
                expect(console.log).toHaveBeenCalled();
            });
        });
        describe('when it fails to get the public key', () => {
            it('should console log an error', async () => {
                // Assert
                verifyUserAssociatedWithFile.mockResolvedValueOnce(false); 
                getAllEncSymmetricKeyFileUser.mockResolvedValueOnce({ success: true, resultString: 'mocked_enc_symmetric_key' });
                decryptSymmetricKeys.mockReturnValue("mocked_decrypted_symmetric_key");
                getPubKeyUser.mockResolvedValue({
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