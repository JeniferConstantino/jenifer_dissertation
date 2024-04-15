import UserApp from '../helpers/UserApp'; 

describe('UserApp', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('verifyMnemonic', () => {
        describe('when the mnemonic corresponds to the user', () => {
            it('should return true', async () => {
                // Arrange
                const mnemonic = 'test';
                const fileManagerFacadeInstance = {
                    verifyUserAssociatedMnemonic: jest.fn().mockResolvedValue(true),
                    _selectedAccount: { current: 'mockedAccount' } // Mocking _selectedAccount
                };

                // Act
                const result = await UserApp.verifyMnemonic(mnemonic, fileManagerFacadeInstance);

                // Assert
                expect(result).toBe(true);
            });
        });
        describe('when the mnemonic doesn not correspond to the user', () => {
            it('should return false', async () => {
                // Arrange
                const mnemonic = 'test';
                const fileManagerFacadeInstance = {
                    verifyUserAssociatedMnemonic: jest.fn().mockResolvedValue(false),
                    _selectedAccount: { current: 'mockedAccount' } // Mocking _selectedAccount
                };

                // Act
                const result = await UserApp.verifyMnemonic(mnemonic, fileManagerFacadeInstance);

                // Assert
                expect(result).toBe(false);
            });
        });
    });

    describe('storeUserBlockchain', () => {
        it('should store user in the blockchain and return mnemonic on success', async () => {
            // Arrange
            const userName = 'testUser';
            const privateKey = 'privateKey';
            const publicKey = 'publicKey';
            const address = 'address';
            const mnemonic = 'mnemonic';
            const hashedMnemonic = 'hashedMnemonic';
            const userRetrieved = 'mockUser'; 
            
            const fileManagerFacadeInstance = {
                generateKeysFromMnemonic: jest.fn().mockResolvedValue({ privateKey, publicKey, address }),
                storeLocalSotrage: jest.fn(),
                registerUser: jest.fn(),
                getUser: jest.fn(),
                hashMnemonicSymmetricEncryption: jest.fn().mockResolvedValue(hashedMnemonic),
                selectedAccount: { current: 'currentAccount' },
            };

            fileManagerFacadeInstance.getUser.mockResolvedValue({
                success: true,
                user: userRetrieved,
                message: ""
            });

            const consoleLogSpy = jest.spyOn(console, 'log');
            
            // Act
            await UserApp.storeUserBlockchain(fileManagerFacadeInstance, userName, mnemonic);

            // Assert 
            expect(fileManagerFacadeInstance.generateKeysFromMnemonic).toHaveBeenCalledWith(mnemonic);
            expect(fileManagerFacadeInstance.storeLocalSotrage).toHaveBeenCalledWith(privateKey, publicKey, address);
            expect(fileManagerFacadeInstance.hashMnemonicSymmetricEncryption).toHaveBeenCalledWith(mnemonic);

            expect(consoleLogSpy).toHaveBeenCalledWith('Registration - user added in the blockchain.');
        });
        it('should handle error and log message on transaction failure', async () => {
            // Arrange
            const userName = 'testUser';
            const privateKey = 'privateKey';
            const publicKey = 'publicKey';
            const address = 'address';
            const userRetrieved = 'mockUser'; 
            const mnemonic = 'mnemonic';
            
            const fileManagerFacadeInstance = {
              registerUser: jest.fn(),
              getUser: jest.fn(),
              storeLocalSotrage: jest.fn(),
              hashMnemonicSymmetricEncryption: jest.fn(),
              generateKeysFromMnemonic: jest.fn().mockResolvedValue({ privateKey, publicKey, address }),
              selectedAccount: { current: 'currentAccount' }
            };
      
            fileManagerFacadeInstance.getUser.mockResolvedValue({
                success: false,
                user: userRetrieved,
                message: ""
            });

            // Act
            const result = await UserApp.storeUserBlockchain(fileManagerFacadeInstance, userName, mnemonic);

            // Assert
            expect(result).toBeNull();
        });
    });
});
