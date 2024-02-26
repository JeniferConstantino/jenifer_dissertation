const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");

describe("UserRegister", function () {

    // Like a BeforeEach
    async function deployContractAndSetVariables() {
        const Helper = await ethers.getContractFactory("Helper");
        let helperContract = await Helper.deploy().catch(error => {
            console.error("Error deploying FileRegister: ", error);
            process.exit(1);
        });  

        const UserRegister = await ethers.getContractFactory("UserRegister");
        const userRegister = await UserRegister.deploy(helperContract.target);
        
        const [signer1, signer2] = await ethers.getSigners(); // Get the first signer 

        let userAnaRita = {
            account: await signer1.getAddress(), // address of the one executing the transaction
            userName: "Ana Rita",
            publicKey: "asd",
            privateKey: "qwe"
        };

        let invalidAnaPaula = {
            account: await signer1.getAddress(), // same address as userAnaRita
            userName: "Ana Paula",
            publicKey: "wer",
            privateKey: "rew"
        };

        let invalidAnaRita = {
            account: await signer2.getAddress(), // same address as userAnaRita
            userName: "Ana Rita",
            publicKey: "wer",
            privateKey: "rew"
        };

        return { userRegister, userAnaRita, invalidAnaPaula, invalidAnaRita, signer1, signer2 };
    }

    it("Should register a user if: username and address are unique, and user executing the transaction is the user trying to register", async function() {
        // Arrange
        const { userRegister, userAnaRita, signer1 } = await loadFixture(deployContractAndSetVariables);        

        // Act
        const tx = await userRegister.connect(signer1).userRegistered(userAnaRita);
        await tx.wait();
        
        // Assert
        const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
        expect(receipt.status).to.equal(1); // 1 = success

        const result = await userRegister.connect(signer1).getUser(userAnaRita.account);
        expect(result.success).to.equal(true);        
    });

    it("Should NOT register the user if: address already in use, and the user executing the transaction is the user trying to register", async function() {
        // Arrange
        const { userRegister, userAnaRita, invalidAnaPaula, signer1 } = await loadFixture(deployContractAndSetVariables);        
        const tx = await userRegister.connect(signer1).userRegistered(userAnaRita);
        await tx.wait();

        // Act
        const tx2 = await userRegister.connect(signer1).userRegistered(invalidAnaPaula);
        await tx2.wait();

        // Assert
        const receipt = await ethers.provider.getTransactionReceipt(tx2.hash);
        expect(receipt.status).to.equal(1); // 1 = success

        const result = await userRegister.connect(signer1).getUser(invalidAnaPaula.account);
        expect(result.user.userName).to.equal("Ana Rita");  // Ana Rita because she was already registered with the address
    });

    it("Should NOT register the user if: userName already in use, and the user executing the transaction is the user trying to register", async function() {
        // Arrange
        const { userRegister, userAnaRita, invalidAnaRita, signer1, signer2 } = await loadFixture(deployContractAndSetVariables);        
        const tx = await userRegister.connect(signer1).userRegistered(userAnaRita);
        await tx.wait();

        // Act
        const tx2 = await userRegister.connect(signer2).userRegistered(invalidAnaRita);
        await tx2.wait();

        // Assert
        const receipt = await ethers.provider.getTransactionReceipt(tx2.hash);
        expect(receipt.status).to.equal(1); // 1 = success

        const result = await userRegister.connect(signer2).getUser(invalidAnaRita.account);
        expect(result.success).to.equal(false); 
        expect(result.user.account).to.equal("0x0000000000000000000000000000000000000000");  // User not stored because the name Ana Rita already existed
        expect(result.user.userName).to.equal("");
    });

    it("Should NOT register the user if the user executing the transaction is not the user trying to register", async function() {
        // Arrange
        const { userRegister, userAnaRita, signer2 } = await loadFixture(deployContractAndSetVariables);        

        // Act
        const tx = await userRegister.connect(signer2).userRegistered(userAnaRita);
        await tx.wait();
        
        // Assert
        const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
        expect(receipt.status).to.equal(1); // 1 = success

        const result = await userRegister.getUser(userAnaRita.account);
        expect(result.success).to.equal(false);      
        expect(result.user.account).to.equal("0x0000000000000000000000000000000000000000");  // User not stored
    });

    it("Should get a user if he was already registered, and the transaction executer is the same as the user", async function() {
        // Arrange
        const { userRegister, userAnaRita, signer1 } = await loadFixture(deployContractAndSetVariables);        
        await userRegister.connect(signer1).userRegistered(userAnaRita);

        // Act
        const result = await userRegister.connect(signer1).getUser(userAnaRita.account);

        // Assert
        expect(result.success).to.equal(true);
        expect(result.user.account.toLowerCase()).to.equal(userAnaRita.account.toLowerCase());
        expect(result.user.name).to.equal(userAnaRita.name);
        expect(result.user.publicKey).to.equal(userAnaRita.publicKey);
        expect(result.user.privateKey).to.equal(userAnaRita.privateKey);
    });

    it("Should fail to get a user that is not registered, and the transaction executer is the same as the user", async function() {
        // Arrange
        const { userRegister, userAnaRita, signer1 } = await loadFixture(deployContractAndSetVariables);  

        // Act
        const result = await userRegister.connect(signer1).getUser(userAnaRita.account);

        // Assert
        expect(result.success).to.equal(false);
        expect(result.user.account.toLowerCase()).to.equal("0x0000000000000000000000000000000000000000");
        expect(result.user.userName).to.equal('');
        expect(result.user.publicKey).to.equal('');
        expect(result.user.privateKey).to.equal('');
    });

    it("Should fail to get the user if the transaction executer is not the same as the user", async function() {
        // Arrange
        const { userRegister, userAnaRita, signer1, signer2 } = await loadFixture(deployContractAndSetVariables);        
        const txRegister = await userRegister.connect(signer1).userRegistered(userAnaRita);
        await txRegister.wait();

        // Act
        const result = await userRegister.connect(signer2).getUser(userAnaRita.account);

        // Assert
        expect(result.success).to.equal(false);
        expect(result.user.account.toLowerCase()).to.equal("0x0000000000000000000000000000000000000000");
        expect(result.user.userName).to.equal("");
        expect(result.user.publicKey).to.equal("");
        expect(result.user.privateKey).to.equal("");
    });

    it("Should return the users' account if a user with the given name exists (no matter who is executing the transaction)", async function() {
        // Arrange
        const { userRegister, userAnaRita, signer1, signer2 } = await loadFixture(deployContractAndSetVariables);        
        const txRegister = await userRegister.connect(signer1).userRegistered(userAnaRita);
        await txRegister.wait();

        // Act
        const result = await userRegister.connect(signer2).getUserAccount(userAnaRita.userName);

        // Assert
        expect(result.success).to.equal(true);
        expect(result.resultAddress).to.equal(userAnaRita.account);
    });

    it("Shouldn't return the users' accout if a user with the given name doesn't exist (no matter who is executing the transaction)", async function(){
        // Arrange
        const { userRegister, userAnaRita, signer1 } = await loadFixture(deployContractAndSetVariables);  

        // Act
        const result = await userRegister.connect(signer1).getUserAccount(userAnaRita.userName);

        // Assert
        expect(result.success).to.equal(false);
        expect(result.resultAddress).to.equal("0x0000000000000000000000000000000000000000");
    });

    it("Should return the public key if the user exist (no matter who is executing the transaction)", async function(){
       // Arrange
       const { userRegister, userAnaRita, signer1, signer2 } = await loadFixture(deployContractAndSetVariables);  
       const txRegister = await userRegister.connect(signer1).userRegistered(userAnaRita);
       await txRegister.wait();

       // Act
       const result = await userRegister.connect(signer2).getPublicKey(userAnaRita.account);

       // Assert
       expect(result.success).to.equal(true);
       expect(result.resultString).to.equal(userAnaRita.publicKey);
    });
    
    it("Shouldn't return the public key if the user doesn't exist (no matter who is executing the transaction)", async function(){
       // Arrange
       const { userRegister, userAnaRita, signer1 } = await loadFixture(deployContractAndSetVariables); 

       // Act
       const result = await userRegister.connect(signer1).getPublicKey(userAnaRita.account);

       // Assert
       expect(result.success).to.equal(false);
       expect(result.resultString).to.equal("");
    });

    it("Should return false if there is a user with the same address, and the transaction executer is the same as the user", async function() {
        // Arrange
        const { userRegister, userAnaRita, invalidAnaPaula, signer1 } = await loadFixture(deployContractAndSetVariables);  
        await userRegister.connect(signer1).userRegistered(userAnaRita);

        // Act
        const result = await userRegister.connect(signer1).canRegister(invalidAnaPaula);

        // Assert
        expect(result).to.equal(false);
    });

    it("Should return false if there is a user with the same userName, and the transaction executer is the same as the user", async function() {
        // Arrange
        const { userRegister, userAnaRita, invalidAnaRita, signer1, signer2 } = await loadFixture(deployContractAndSetVariables);  
        await userRegister.connect(signer1).userRegistered(userAnaRita);

        // Act
        const result = await userRegister.connect(signer2).canRegister(invalidAnaRita);

        // Assert
        expect(result).to.equal(false);
    });

    it("Should return true if there is no user with the same address and no user with the same userName, and the transaction executerr is the same as the user", async function() {
        // Arrange
        const { userRegister, userAnaRita, signer1 } = await loadFixture(deployContractAndSetVariables);  

        // Act
        const result = await userRegister.connect(signer1).canRegister(userAnaRita);

        // Assert
        expect(result).to.equal(true);
    });

    it("Should return false if the one executing the transaction is not the same as the user", async function() {
        // Arrange
        const { userRegister, userAnaRita, signer2 } = await loadFixture(deployContractAndSetVariables);  

        // Act
        const result = await userRegister.connect(signer2).canRegister(userAnaRita);

        // Assert
        expect(result).to.equal(false);
    });


    it("Should return true if the address already exists (no matter the transaction executer)", async function() {
        // Arrange
        const { userRegister, userAnaRita, signer1 } = await loadFixture(deployContractAndSetVariables);  
        await userRegister.connect(signer1).userRegistered(userAnaRita);

        // Act
        const result = await userRegister.connect(signer1).existingAddress(userAnaRita.account);

        // Assert
        expect(result).to.equal(true);
    });

    it("Should return false if the address doesn't exists (no matter the transaction executer)", async function() {
        // Arrange
        const { userRegister, signer1, userAnaRita } = await loadFixture(deployContractAndSetVariables);  

        // Act
        const result = await userRegister.connect(signer1).existingAddress(userAnaRita.account);

        // Assert
        expect(result).to.equal(false);
    });

    it("Should return true if the userName is already in use", async function() {
        // Arrange
        const { userRegister, userAnaRita, signer1 } = await loadFixture(deployContractAndSetVariables);  
        await userRegister.connect(signer1).userRegistered(userAnaRita);

        // Act
        const result = await userRegister.connect(signer1).existingUserName(userAnaRita.userName);

        // Assert
        expect(result).to.equal(true);
    });

    it("Should return false if the userName is not in use", async function() {
        // Arrange
        const { userRegister, userAnaRita, signer1 } = await loadFixture(deployContractAndSetVariables); 

        // Act
        const result = await userRegister.connect(signer1).existingUserName(userAnaRita.userName);

        // Assert
        expect(result).to.equal(false);
    });
});