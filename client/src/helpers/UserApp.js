class UserApp {
    constructor(account, name, publicKey, privateKey) {
      this.account = account;       // Address Account in MetaMask - Unique
      this.name = name;             // Name of the user - unique
      this.publicKey = publicKey;   // User's public key
      this.privateKey = privateKey; // User's private key
    }
}

export default UserApp;
