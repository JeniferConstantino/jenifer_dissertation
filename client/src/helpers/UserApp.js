
class UserApp {

  constructor(account, userName, mnemonic, publicKey) {
    this.account = account;       // Address Account in MetaMask - Unique
    this.userName = userName;     // Name of the user - unique
    this.mnemonic = mnemonic;     // Mnemonic of the user => seed phrase
    this.publicKey = publicKey;   // Stores the users' public key
  }

  // Sees if the user already exists in the app by seeing if the account is already stored in the blockchain
  static async verifyIfAccountExists(fileManagerFacadeInstance) {
    try {
      // Verifies if the user exist
      var result = await fileManagerFacadeInstance.getUser(fileManagerFacadeInstance._selectedAccount.current);
      if (result.success === false) {
          console.log("User first time in the app");
          return null;
      } 

      console.log("User already in the app.");
      // --------- Registration setup ---------------------
      fileManagerFacadeInstance._selectedUser = result.user;
      // --------------------------------------------------
      return result.user;
    } catch (error) {
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
  static async storeUserBlockchain(fileManagerFacadeInstance, userName) {
    try {
      // Generates a mnemonic
      const mnemonic = await fileManagerFacadeInstance.generateMnemonic();
      // Gets a private and public key from the mnemonic
      const {privateKey, publicKey, address} = await fileManagerFacadeInstance.generateKeysFromMnemonic(mnemonic);
      // Stores the private and public key in the local storage
      await fileManagerFacadeInstance.storeLocalSotrage(privateKey, publicKey, address);
      // Hash the mnemonic before storing it - using symmetric encryption
      const hashedMnemonic = await fileManagerFacadeInstance.hashMnemonicSymmetricEncryption(mnemonic);
      // Cretaes the user to be stored
      var userLogged = new UserApp(fileManagerFacadeInstance.selectedAccount.current, userName, hashedMnemonic, publicKey.toString('hex'));
      
      // Verifies if the user is elegible to register
      var existingAddress = await fileManagerFacadeInstance.existingAddress(userLogged.account);
      var existingUserName = await fileManagerFacadeInstance.existingUserName(userLogged.userName);     
      if (existingAddress || existingUserName) {
        console.log("Error in registration! Existing Address: ", existingAddress, " Existing UserName: ", existingUserName);
        return;
      }
      
      // Stors the user in the blockchain
      const result = await fileManagerFacadeInstance.userRegistered(userLogged);
      if (result.status) {
        // --------- Registration setup ---------------------
        fileManagerFacadeInstance._selectedUser = userLogged;
        // --------------------------------------------------
        console.log("Registration - user added in the blockchain.");
        return mnemonic;
      }
      console.log("Something went wrong when trying to add the user to the blockchain.");       
    } catch (error) {
        console.error("Transaction error: ", error.message);
    }
  }

}

export default UserApp;
