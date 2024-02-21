
class UserApp {

  constructor(account, userName, publicKey, privateKey) {
    this.account = account;       // Address Account in MetaMask - Unique
    this.userName = userName;     // Name of the user - unique
    this.publicKey = publicKey;   // User's public key
    this.privateKey = privateKey; // User's private key
  }

  // Sees if the user already exists in the app by seeing if the account is already stored in the blockchain
  static async verifyIfAccountExists(fileManagerFacadeInstance) {
    try {
      // Verifies if the user exist
      var result = await fileManagerFacadeInstance.userRegisterContract.methods.getUser(fileManagerFacadeInstance._selectedAccount.current).call({from: fileManagerFacadeInstance._selectedAccount.current});
    
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

  // Stores the user in the blockchain
  static async storeUserBlockchain(fileManagerFacadeInstance, userName) {
    // Prepares the user to be stored
    const {privateKey, publicKey} = fileManagerFacadeInstance.generateKeyPair();
    console.log("Key Pair generated");

    // Adds the user to the blockchain
    try {
      var userLogged = new UserApp(fileManagerFacadeInstance.selectedAccount.current, userName, publicKey, privateKey);
      // Verifies if the user is elegible to register
      var existingAddress = await fileManagerFacadeInstance.userRegisterContract.methods.existingAddress(userLogged.account).call({from: fileManagerFacadeInstance._selectedAccount.current});
      var existingUserName = await fileManagerFacadeInstance.userRegisterContract.methods.existingUserName(userLogged.userName).call({from: fileManagerFacadeInstance._selectedAccount.current})
      
      if (existingAddress || existingUserName) {
        console.log("Error in registration! Existing Address: ", existingAddress, " Existing UserName: ", existingUserName);
        return;
      }
      
      // Stors the user in the blockchain
      const result = await fileManagerFacadeInstance.userRegisterContract.methods.userRegistered(userLogged).send({ from: fileManagerFacadeInstance._selectedAccount.current }); // from indicates the account that will be actually sending the transaction
      if (result.status) {
        // --------- Registration setup ---------------------
        fileManagerFacadeInstance._selectedUser = userLogged;
        // --------------------------------------------------
        console.log("Registration - user added in the blockchain.");
        return;
      }
      console.log("Something went wrong when trying to add the user to the blockchain.");       
    } catch (error) {
        console.error("Transaction error: ", error.message);
    }
  }

}

export default UserApp;
