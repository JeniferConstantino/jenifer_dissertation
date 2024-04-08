/*const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");

describe("AuditLog", function () {

    // Like a BeforeEach
    async function deployContractAndSetVariables() {
        const Helper = await ethers.getContractFactory("Helper");
        let helperContract = await Helper.deploy().catch(error => {
            console.error("Error deploying FileRegister: ", error);
            process.exit(1);
        }); 

        const AccessControl = await ethers.getContractFactory("AccessControl");
        const accessControl = await AccessControl.deploy(helperContract.target);

        const userRegisterAddress = await accessControl.getUserRegisterAddress();
        const userRegisterContract = await hre.ethers.getContractAt("UserRegister", userRegisterAddress);

        const auditLofControlAddress = await accessControl.getAuditLogControlAddress();
        const auditLogControlContract = await hre.ethers.getContractAt("AuditLogControl", auditLofControlAddress);

        const [signer1, signer2] = await ethers.getSigners(); // Get the first signer 

        const userAnaRita = {
            account: await signer1.getAddress(),  // address of the one executing the transaction
            userName: "Ana Rita",
            mnemonic: "wisdom skate describe aim code april harsh reveal board order habit van",
            publicKey: "publicKeyAnaRita"
        };

        const userAnaPaula = {
            account: await signer2.getAddress(),  // address of the one executing the transaction
            userName: "Ana Paula",
            mnemonic: "angry flavor wire wish struggle prepare apart say stuff lounge increase area",
            publicKey: "publicKeyAnaPaula"
        };

        const fileAnaRita = {
            ipfsCID: "file1CID",        
            fileName: "file1.jpg",  
            version: 0,
            prevIpfsCID: "0",        
            owner: await signer1.getAddress(),             
            fileType: "image",           
            iv: "file1_iv",  
            state: "",
            fileHash: "hashFile"
        };
        return { userRegisterContract,  auditLogControlContract, accessControl, userAnaRita, userAnaPaula, fileAnaRita, signer1, signer2 };
    }

    describe("recordLogFromAccessControl", async function(){
        describe("when the transaction executer is not the AccessControl contract", async function(){
            it("should NOT record the log", async function(){
                // Arrange
                const { auditLogControlContract, fileAnaRita, userAnaRita, signer1 } = await loadFixture(deployContractAndSetVariables);

                // Act
                const tx = await auditLogControlContract.connect(signer1).recordLogFromAccessControl(userAnaRita.account, fileAnaRita.ipfsCID, userAnaRita.account, "download", "download");
                await tx.wait();

                // Assert
                const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
                expect(receipt.status).to.equal(1); // 1 = success

                const result = await auditLogControlContract.connect(signer1).getLogs([fileAnaRita.ipfsCID]);
                expect(result.success).to.equal(false);
                expect(result.logs.length).to.equal(0);
            });
        });
    });

    describe("getLogs", async function(){
        describe("when the transaction is not associated with the file", async function(){
            it("should NOT return the file logs", async function(){
                // Arrange
                const { userRegisterContract, accessControl, auditLogControlContract, fileAnaRita, userAnaRita, userAnaPaula, signer1, signer2 } = await loadFixture(deployContractAndSetVariables);
                const encSymmetricKey = "encSymmetricKeyFileAnaRita";
                await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user
                await userRegisterContract.connect(signer2).userRegistered(userAnaPaula); // Register the user
                await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita, encSymmetricKey); // Ana Rita owner of the file

                // Act
                const res = await auditLogControlContract.connect(signer2).getLogs([fileAnaRita.ipfsCID]);
                
                // Asset
                expect(res.success).to.equal(false);
                expect(res.logs.length).to.equal(0);
            });
        });
    });

    // Already tests the recordLogFromAccessControl() and the getLogs()
    // Other tests of this method are in the AccessControl.test.js
    describe("getLogs + recordLogFromAccessControl", async function(){
        describe("when the transaction executer is the AccessControl contract", async function(){
            describe("and the action was well performed, and no previous action was executed", async function(){
                it("should return false and no logs", async function(){
                    // Arrange
                    const { accessControl, userRegisterContract, auditLogControlContract, fileAnaRita, userAnaRita, signer1 } = await loadFixture(deployContractAndSetVariables);
                    await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user

                    // Act
                    const tx = await accessControl.connect(signer1).downloadFileAudit(fileAnaRita.ipfsCID, userAnaRita.account);
                    await tx.wait();

                    // Assert
                    const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
                    expect(receipt.status).to.equal(1); // 1 = success

                    const result = await auditLogControlContract.connect(signer1).getLogs([fileAnaRita.ipfsCID]);
                    expect(result.success).to.equal(false);
                    expect(result.logs.length).to.equal(0); 
                });
            });
        });
    });
});*/