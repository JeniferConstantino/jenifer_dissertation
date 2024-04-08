import UserApp from '../helpers/UserApp'; 

describe('UserApp', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('verifyIfAccountExists', () => { 
        describe('when the user does not exist', () => {
            it('should should return null', async () => {
                // Arrange
                const fileManagerFacadeInstance = {
                    getUser: jest.fn().mockResolvedValue({ success: false }),
                    _selectedAccount: { current: 'mockedAccount' } // Mocking _selectedAccount
                };

                // Act
                const result = await UserApp.verifyIfAccountExists(fileManagerFacadeInstance);

                // Assert
                expect(result).toBeNull();
            });
        });
        describe('when the user exists', () => {
            it('should return the user', async () => {
                // Arrange
                const user = { account: '0x123', userName: 'test', mnemonic: 'test', publicKey: 'test' };
                const fileManagerFacadeInstance = {
                  getUser: jest.fn().mockResolvedValue({ success: true, user }),
                  _selectedAccount: { current: 'mockedAccount' } // Mocking _selectedAccount
                };
          
                // Act
                const result = await UserApp.verifyIfAccountExists(fileManagerFacadeInstance);
          
                // Assert
                expect(result).toEqual(user);
            });
        });
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
            
            const fileManagerFacadeInstance = {
                generateMnemonic: jest.fn().mockResolvedValue(mnemonic),
                generateKeysFromMnemonic: jest.fn().mockResolvedValue({ privateKey, publicKey, address }),
                storeLocalSotrage: jest.fn(),
                hashMnemonicSymmetricEncryption: jest.fn().mockResolvedValue(hashedMnemonic),
                selectedAccount: { current: 'currentAccount' },
                userRegistered: jest.fn().mockResolvedValue({ status: true })
            };

            const consoleLogSpy = jest.spyOn(console, 'log');
            
            // Act
            const result = await UserApp.storeUserBlockchain(fileManagerFacadeInstance, userName);

            // Assert 
            expect(fileManagerFacadeInstance.generateMnemonic).toHaveBeenCalled();
            expect(fileManagerFacadeInstance.generateKeysFromMnemonic).toHaveBeenCalledWith(mnemonic);
            expect(fileManagerFacadeInstance.storeLocalSotrage).toHaveBeenCalledWith(privateKey, publicKey, address);
            expect(fileManagerFacadeInstance.hashMnemonicSymmetricEncryption).toHaveBeenCalledWith(mnemonic);
            expect(fileManagerFacadeInstance.userRegistered).toHaveBeenCalledWith(expect.objectContaining({
                account: fileManagerFacadeInstance.selectedAccount.current,
                userName: userName.toLowerCase(),
                mnemonic: hashedMnemonic,
                publicKey: publicKey.toString('hex')
            }));

            expect(result).toBe(mnemonic);
            expect(consoleLogSpy).toHaveBeenCalledWith('Registration - user added in the blockchain.');
        });
        it('should handle error and log message on transaction failure', async () => {
            // Arrange
            const userName = 'testUser';
            const errorMessage = 'Transaction failed';
            
            const fileManagerFacadeInstance = {
              generateMnemonic: jest.fn().mockRejectedValue(new Error(errorMessage)),
              selectedAccount: { current: 'currentAccount' }
            };
      
            const consoleErrorSpy = jest.spyOn(console, 'error');
      
            // Act
            await expect(UserApp.storeUserBlockchain(fileManagerFacadeInstance, userName)).rejects.toThrowError(errorMessage);
      
            // Assert
            expect(consoleErrorSpy).toHaveBeenCalledWith('Transaction error: ', errorMessage);
        });
    });
});
