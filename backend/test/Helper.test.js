const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");

describe("Helper", function () {

    async function deployContractAndSetVariables() {
        const Helper = await ethers.getContractFactory("Helper");
        let helperContract = await Helper.deploy().catch(error => {
            console.error("Error deploying FileRegister: ", error);
            process.exit(1);
        });  

        const [signer1, signer2] = await ethers.getSigners(); // Get the first signer 

        let userAnaRita = {
            account: await signer1.getAddress(), // address of the one executing the transaction
            userName: "Ana Rita",
            publicKey: "asd",
            privateKey: "qwe"
        };
        const fileAnaRita = {
            ipfsCID: "anaRitaIpfsCID1",        
            fileName: "anaRitaFile1.jpg",          
            owner: userAnaRita.account, // Ana Rita is the file owner             
            fileType: "image",           
            iv: "ivFileAnaRita",  
        };

        return { helperContract, userAnaRita, fileAnaRita, signer1, signer2 };
    }

    it("Should return true if the users' fields are valid and the transaction executer is the same as the user", async function() {
        // Arrange
        const { helperContract, signer1, userAnaRita } = await loadFixture(deployContractAndSetVariables); 

        // Act
        const result = await helperContract.connect(signer1).validUserFields(userAnaRita);

        // Assert
        expect(result).to.equal(true);
    });

    it("Should return false if the users' fields are not valid, and the transaction executer is the same as the user", async function() {
        // Arrange
        const { helperContract, signer2 } = await loadFixture(deployContractAndSetVariables); 
        let invalidUser = {
            account: await signer2.getAddress(),
            userName: "", // invalid userName
            publicKey: "wer",
            privateKey: "rew"
        };

        // Act
        const result = await helperContract.connect(signer2).validUserFields(invalidUser);

        // Assert
        expect(result).to.equal(false);
        
    });
    
    it("Should return true if the file parameters are valid", async function() {
        // Arrange
        const { helperContract, signer1, fileAnaRita } = await loadFixture(deployContractAndSetVariables); 

        // Act
        const result = await helperContract.connect(signer1).fileParamValid(fileAnaRita);

        // Assert
        expect(result).to.equal(true);
    });
    
    it("Should return false if the file parameters are invalid", async function() {
        // Arrange
        const { helperContract, signer1 } = await loadFixture(deployContractAndSetVariables); 
        let invalidFile = {
            ipfsCID: "",    // invalid ipfsCID    
            fileName: "nameFile.jpg",          
            owner: await signer1.getAddress(),             
            fileType: "image",           
            iv: "yourIv_1",  
        };

        // Act
        const result = await helperContract.connect(signer1).fileParamValid(invalidFile);

        // Assert
        expect(result).to.equal(false);
    });
    
    it("Should return true if the userHasFile fields are valid", async function() {
        // Arrange
        const { helperContract, fileAnaRita, userAnaRita, signer1} = await loadFixture(deployContractAndSetVariables);   
        const encSymmetricKey = "encSymmetricKeyFileAnaRita";

        // Act
        const result = await helperContract.connect(signer1).verifyValidFields(userAnaRita.account, fileAnaRita.ipfsCID, encSymmetricKey, ["delete"])

        // Assert
        expect(result).to.equal(true);
    });

    it("Should return false if the userHasFile fields are invalid", async function() {
        // Arrange
        const { helperContract, fileAnaRita, userAnaRita, signer1} = await loadFixture(deployContractAndSetVariables);   
        const encSymmetricKey = "";
        
        // Act
        const result = await helperContract.connect(signer1).verifyValidFields(userAnaRita.account, fileAnaRita.ipfsCID, encSymmetricKey, ["delete"])

        // Assert
        expect(result).to.equal(false);
    });

});