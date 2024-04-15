
class UserApp {

  constructor(account, userName, mnemonic, publicKey) {
    this.account = account;       // Address Account in MetaMask - Unique
    this.userName = userName;     // Name of the user - unique
    this.mnemonic = mnemonic;     // Mnemonic of the user => seed phrase
    this.publicKey = publicKey;   // Stores the users' public key
  }

  // Sees if the user already exist in the app by seeing if the account is already stored in the blockchain
  static async getUserWithAccount(fileManagerFacadeInstance) {
    try{
      var resultUser = await fileManagerFacadeInstance.getUser(fileManagerFacadeInstance._selectedAccount.current);
      return resultUser;
    } catch(error){
      console.error("Error storing user on the blockchain:", error);
      throw error; 
    }
  }

  // Sees if the mnemonic corresponds to the user
  static async verifyMnemonic(mnemonic, fileManagerFacadeInstance){
    // verifies if the user is associated with the entered mnemonic
    var userAsscoiatedWithMnemonic = await fileManagerFacadeInstance.verifyUserAssociatedMnemonic(mnemonic, fileManagerFacadeInstance._selectedAccount.current);
    if(userAsscoiatedWithMnemonic) {
      return true;
    } 
    return false;
  }

  // Stores the user in the blockchain
  static async storeUserBlockchain(fileManagerFacadeInstance, userName, mnemonic) {
    try {
      // Gets a private and public key from the mnemonic
      const {privateKey, publicKey, address} = await fileManagerFacadeInstance.generateKeysFromMnemonic(mnemonic);
      // Stores the private and public key in the local storage
      await fileManagerFacadeInstance.storeLocalSotrage(privateKey, publicKey, address);
      // Hash the mnemonic before storing it - using symmetric encryption
      const hashedMnemonic = await fileManagerFacadeInstance.hashMnemonicSymmetricEncryption(mnemonic);

      // Because the usernames are going to be case insensitive, this is writing Maria = maria = MARIA and so it goes
      userName = userName.toLowerCase();

      // Cretaes the user to be stored
      var userLogged = new UserApp(fileManagerFacadeInstance.selectedAccount.current, userName, hashedMnemonic, publicKey.toString('hex'));
      
      // Registers the user in the blockchain
      await fileManagerFacadeInstance.registerUser(userLogged);
      
      // Verifies if the registration was seccessful
      const resultUserVerification = await fileManagerFacadeInstance.getUser(userLogged.account);
      if (resultUserVerification.success) {
        console.log("Registration - user added in the blockchain.");
        return userLogged;
      }
      // eslint-disable-next-line security-node/detect-crlf
      console.log("Something went wrong while trying to register the user: ", resultUserVerification.message);
      return null;
    } catch (error) {
        console.error("Transaction error: ", error.message);
        throw error;
    }
  }

}

export default UserApp;
