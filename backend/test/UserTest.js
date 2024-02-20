const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");

describe("UserRegister", function () {

    // Like a BeforeEach
    async function deployContractAdSetVariables() {
        const UserRegister = await ethers.getContractFactory("UserRegister");
        const userRegister = await UserRegister.deploy();

        let userAnaRita = {
            account: "0x7c852118294e51e653712a81e05800f419141751",
            userName: "Ana Rita",
            publicKey: "asd",
            privateKey: "qwe"
        };

        return { userRegister, userAnaRita };
    }

    it("Should register a user if username is not in use and not already registered", async function() {
        // Arrange
        const { userRegister, userAnaRita } = await loadFixture(deployContractAdSetVariables);        

        // Act
        const tx = await userRegister.userRegistered(userAnaRita);
        await tx.wait();
        
        // Assert
        const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
        expect(receipt.status).to.equal(1); // 1 = success

        const result = await userRegister.getUser(userAnaRita.account);
        expect(result.success).to.equal(true);        
    });

    it("Should NOT register the user if already registered", async function() {
        // Arrange
        const { userRegister, userAnaRita } = await loadFixture(deployContractAdSetVariables);        
        const tx = await userRegister.userRegistered(userAnaRita);
        await tx.wait();

        // Act
        let invalidAnaPaula = {
            account: "0x7c852118294e51e653712a81e05800f419141751", // same address as userAnaRita
            userName: "Ana Paula",
            publicKey: "wer",
            privateKey: "rew"
        };
        const tx2 = await userRegister.userRegistered(invalidAnaPaula);
        await tx2.wait();

        // Assert
        const receipt = await ethers.provider.getTransactionReceipt(tx2.hash);
        expect(receipt.status).to.equal(1); // 1 = success

        const result = await userRegister.getUser(invalidAnaPaula.account);
        expect(result.user.userName).to.equal("Ana Rita");  // Ana Rita because she was already registered with the address
    });

    it("Should NOT register the user if the userName is already in use", async function() {
        // Arrange
        const { userRegister, userAnaRita } = await loadFixture(deployContractAdSetVariables);        
        const tx = await userRegister.userRegistered(userAnaRita);
        await tx.wait();

        // Act
        let invalidAnaPaula = {
            account: "0x9c852118294e51e653712a81e05800f419141756", 
            userName: "Ana Rita", // same userName as userAnaRita
            publicKey: "wer",
            privateKey: "rew"
        };
        const tx2 = await userRegister.userRegistered(invalidAnaPaula);
        await tx2.wait();

        // Assert
        const receipt = await ethers.provider.getTransactionReceipt(tx2.hash);
        expect(receipt.status).to.equal(1); // 1 = success

        const result = await userRegister.getUser(invalidAnaPaula.account);
        expect(result.success).to.equal(false);  // User not stored in the blockchain
    });

    it("Should get a user if he was already registered", async function() {
        // Arrange
        const { userRegister, userAnaRita } = await loadFixture(deployContractAdSetVariables);        
        await userRegister.userRegistered(userAnaRita);

        // Act
        const result = await userRegister.getUser(userAnaRita.account);

        // Assert
        expect(result.success).to.equal(true);
        expect(result.user.account.toLowerCase()).to.equal(userAnaRita.account.toLowerCase());
        expect(result.user.name).to.equal(userAnaRita.name);
        expect(result.user.publicKey).to.equal(userAnaRita.publicKey);
        expect(result.user.privateKey).to.equal(userAnaRita.privateKey);
    });

    it("Should fail to get a user that is not registered ", async function() {
        // Arrange
        const { userRegister, userAnaRita } = await loadFixture(deployContractAdSetVariables);  

        // Act
        const result = await userRegister.getUser(userAnaRita.account);

        // Assert
        expect(result.success).to.equal(false);
        expect(result.user.account.toLowerCase()).to.equal("0x0000000000000000000000000000000000000000");
        expect(result.user.userName).to.equal('');
        expect(result.user.publicKey).to.equal('');
        expect(result.user.privateKey).to.equal('');
    });

    it("Should return false if there is a user with the same address", async function() {
        // Arrange
        const { userRegister, userAnaRita } = await loadFixture(deployContractAdSetVariables);  
        await userRegister.userRegistered(userAnaRita);

        // Act
        let invalidAnaPaula = {
            account: "0x7c852118294e51e653712a81e05800f419141751", // same address as userAnaRita
            userName: "Ana Paula",
            publicKey: "wer",
            privateKey: "rew"
        };
        const result = await userRegister.canRegister(invalidAnaPaula);

        // Assert
        expect(result).to.equal(false);
    });

    it("Should return false if there is a user with the same userName", async function() {
        // Arrange
        const { userRegister, userAnaRita } = await loadFixture(deployContractAdSetVariables);  
        await userRegister.userRegistered(userAnaRita);

        // Act
        let invalidAnaPaula = {
            account: "0x9c852118294e51e653712a81e05800f419141756", 
            userName: "Ana Rita", // same userName as userAnaRita
            publicKey: "wer",
            privateKey: "rew"
        };
        const result = await userRegister.canRegister(invalidAnaPaula);

        // Assert
        expect(result).to.equal(false);
    });

    it("Should return true if the there is no user with the same address and no user with the same userName", async function() {
        // Arrange
        const { userRegister, userAnaRita } = await loadFixture(deployContractAdSetVariables);  

        // Act
        const result = await userRegister.canRegister(userAnaRita);

        // Assert
        expect(result).to.equal(true);
    });

    it("Should return true if the address already exists", async function() {
        // Arrange
        const { userRegister, userAnaRita } = await loadFixture(deployContractAdSetVariables);  
        await userRegister.userRegistered(userAnaRita);

        // Act
        const result = await userRegister.existingAddress("0x7c852118294e51e653712a81e05800f419141751");

        // Assert
        expect(result).to.equal(true);
    });

    it("Should return false if the address doesn't exists", async function() {
        // Arrange
        const { userRegister } = await loadFixture(deployContractAdSetVariables);  

        // Act
        const result = await userRegister.existingAddress("0x7c852118294e51e653712a81e05800f419141751");

        // Assert
        expect(result).to.equal(false);
    });

    it("Should return true if the userName is already in use", async function() {
        // Arrange
        const { userRegister, userAnaRita } = await loadFixture(deployContractAdSetVariables);  
        await userRegister.userRegistered(userAnaRita);

        // Act
        const result = await userRegister.existingUserName("Ana Rita");

        // Assert
        expect(result).to.equal(true);
    });

    it("Should return false if the userName is not in use", async function() {
        // Arrange
        const { userRegister } = await loadFixture(deployContractAdSetVariables); 

        // Act
        const result = await userRegister.existingUserName("Ana Rita");

        // Assert
        expect(result).to.equal(false);
    });

});