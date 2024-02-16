
class UserApp {

  constructor(account, name, publicKey, privateKey) {
    this.account = account;       // Address Account in MetaMask - Unique
    this.name = name;             // Name of the user - unique
    this.publicKey = publicKey;   // User's public key
    this.privateKey = privateKey; // User's private key
  }

  // Sees if the user already exists in the app by seeing if the account is already stored in the blockchain
  static async verifyIfAccountExists(fileManagerFacadeInstance) {
    try {
      // Verifies if the user exist
      var userStored = await fileManagerFacadeInstance.userManagerContract.methods.getUser(fileManagerFacadeInstance._selectedAccount.current).call({from: fileManagerFacadeInstance._selectedAccount.current});
      
      if (userStored.name === "") {
          console.log("User first time in the app");
          return null;
      } 

      console.log("User already in the app.");
      const selectedUser = userStored;
      // --------- Registration setup ---------------------
      fileManagerFacadeInstance._selectedUser = selectedUser;
      // --------------------------------------------------
      return userStored;
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
    var userLogged = new UserApp(fileManagerFacadeInstance.selectedAccount.current, userName, publicKey, privateKey);

    // Adds the user to the blockchain
    try {
      var errorRegister = await fileManagerFacadeInstance.userManagerContract.methods.checkRegistration(userLogged).call({from: fileManagerFacadeInstance._selectedAccount.current});
      if (errorRegister.length === 0) { // The user can register, no error message was sent
          const receipt = await fileManagerFacadeInstance.userManagerContract.methods.register(userLogged).send({ from: fileManagerFacadeInstance._selectedAccount.current }); // from indicates the account that will be actually sending the transaction
          const registrationEvent  = receipt.events["RegistrationResult"];
          if (registrationEvent) {
            const { success, message } = registrationEvent.returnValues;
            if (success) {
              const selectedUser = userLogged;
              // --------- Registration setup ---------------------
              fileManagerFacadeInstance._selectedUser = selectedUser;
              // --------------------------------------------------
              console.log("Registration - user added in the blockchain.");
            } else {
              console.log("message: ", message);
            }
          }
      } else {
          console.log("errorRegister: ", errorRegister);
      }    
    } catch (error) {
        console.error("Transaction error: ", error.message);
        console.log("Make sure that the user is not already authenticated in the app. And make sure that the username is unique.");
    }
  }

}

export default UserApp;
