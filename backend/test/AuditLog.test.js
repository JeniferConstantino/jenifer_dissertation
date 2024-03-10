const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
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

        const fileRegisterAddress = await accessControl.getFileRegisterAddress();
        const fileRegisterContract = await hre.ethers.getContractAt("FileRegister", fileRegisterAddress);
        await fileRegisterContract.setAccessControlAddress(accessControl.target); // Already testing the setAccessControlAddress()

        const userRegisterAddress = await accessControl.getUserRegisterAddress();
        const userRegisterContract = await hre.ethers.getContractAt("UserRegister", userRegisterAddress);

        const [signer1, signer2] = await ethers.getSigners(); // Get the first signer 

        const userAnaRita = {
            account: await signer1.getAddress(),  // address of the one executing the transaction
            userName: "Ana Rita",
            publicKey: "publicKeyAnaRita",
            privateKey: "privatekeyAnaRita"
        };

        const userAnaPaula = {
            account: await signer2.getAddress(),  // address of the one executing the transaction
            userName: "Ana Paula",
            publicKey: "publicKeyAnaPaula",
            privateKey: "privatekeyAnaPaula"
        };

        const fileAnaRita = {
            ipfsCID: "anaRitaIpfsCID1",        
            fileName: "anaRitaFile1.jpg",          
            owner: userAnaRita.account, // Ana Rita is the file owner             
            fileType: "image",           
            iv: "ivFileAnaRita",  
        };

        return { userRegisterContract, fileRegisterContract,  accessControl, userAnaRita, userAnaPaula, fileAnaRita, signer1, signer2 };
    }

    // Already tests the recordLogFromAccessControl() and the getLogs()
    it("Should store on the audit log when a user uploads a file", async function() {
        // Arrange
        const { userRegisterContract, accessControl, userAnaRita, fileAnaRita, signer1 } = await loadFixture(deployContractAndSetVariables);
        const encSymmetricKey = "encSymmetricKeyFileAnaRita";
        userRegisterContract.connect(signer1).userRegistered(userAnaRita);

        // Act
        const tx = await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita, encSymmetricKey); // executes the recordLogFromAccessControl
        await tx.wait();

        // Assert
        const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
        expect(receipt.status).to.equal(1); // 1 = success
        
        const auditLogControlAddress = await accessControl.connect(signer1).getAuditLogControlAddress(); 
        const auditLogControlContract = await ethers.getContractAt("AuditLogControl", auditLogControlAddress);
        
        const result = await auditLogControlContract.connect(signer1).getLogs([fileAnaRita.ipfsCID]); // executes the getLogs()
        expect(result.success).to.equal(true);
        expect(result.logs.length).to.equal(1); // It has the upload
    });

    it("Should store on the audit log when a user shares a file", async function() {
        // Arrange
        const { userRegisterContract, accessControl, userAnaRita, userAnaPaula, fileAnaRita, signer1, signer2 } = await loadFixture(deployContractAndSetVariables);
        const encSymmetricKey = "encSymmetricKeyFileAnaRita";
        userRegisterContract.connect(signer1).userRegistered(userAnaRita);
        userRegisterContract.connect(signer2).userRegistered(userAnaPaula);
        await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita, encSymmetricKey); // executes the recordLogFromAccessControl

        // Act
        const tx = await accessControl.connect(signer1).shareFile(userAnaPaula.account, fileAnaRita.ipfsCID, encSymmetricKey, ["share, delete"]);
        await tx.wait();

        // Assert
        const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
        expect(receipt.status).to.equal(1); // 1 = success
        
        const auditLogControlAddress = await accessControl.connect(signer1).getAuditLogControlAddress(); 
        const auditLogControlContract = await ethers.getContractAt("AuditLogControl", auditLogControlAddress);
        
        const result = await auditLogControlContract.connect(signer1).getLogs([fileAnaRita.ipfsCID]); // executes the getLogs()
        expect(result.success).to.equal(true);
        expect(result.logs.length).to.equal(2); // It has the upload and the share
    });

    it("Should store on the audit log when a user updates the users' permissions over file", async function() {
        // Arrange
        const { userRegisterContract, accessControl, userAnaRita, userAnaPaula, fileAnaRita, signer1, signer2 } = await loadFixture(deployContractAndSetVariables);
        const encSymmetricKey = "encSymmetricKeyFileAnaRita";
        userRegisterContract.connect(signer1).userRegistered(userAnaRita);
        userRegisterContract.connect(signer2).userRegistered(userAnaPaula);
        await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita, encSymmetricKey); // executes the recordLogFromAccessControl
        await accessControl.connect(signer1).shareFile(userAnaPaula.account, fileAnaRita.ipfsCID, encSymmetricKey, ["share, delete"]);

        // Act
        const tx = await accessControl.connect(signer1).updateUserFilePermissions(userAnaPaula.account, fileAnaRita.ipfsCID, ["share"]);
        await tx.wait();

        // Assert
        const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
        expect(receipt.status).to.equal(1); // 1 = success
        
        const auditLogControlAddress = await accessControl.connect(signer1).getAuditLogControlAddress(); 
        const auditLogControlContract = await ethers.getContractAt("AuditLogControl", auditLogControlAddress);
        
        const result = await auditLogControlContract.connect(signer1).getLogs([fileAnaRita.ipfsCID]); // executes the getLogs()
        expect(result.success).to.equal(true);
        expect(result.logs.length).to.equal(3); // It has the upload, the share, and the update permissions
    });

    it("Should store on the audit log when a user downloads a file if the transaction executer is the same as the user and the user has download permissions over the file", async function() {
        // Arrange
        const { accessControl, userRegisterContract, fileAnaRita, userAnaRita, signer1 } = await loadFixture(deployContractAndSetVariables);
        const encSymmetricKey = "encSymmetricKeyFileAnaRita";
        await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user
        await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita, encSymmetricKey); // gives the download permissions

        // Act
        const tx = await accessControl.connect(signer1).downloadFileAudit(fileAnaRita.ipfsCID, userAnaRita.account);
        await tx.wait();

        // Assert
        const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
        expect(receipt.status).to.equal(1); // 1 = success
        
        const auditLogControlAddress = await accessControl.connect(signer1).getAuditLogControlAddress();
        const auditLogControlContract = await ethers.getContractAt("AuditLogControl", auditLogControlAddress);
        
        const result = await auditLogControlContract.connect(signer1).getLogs([fileAnaRita.ipfsCID]);
        expect(result.success).to.equal(true);
        expect(result.logs.length).to.equal(2); // It has the upload and download in the log
    });

    it("Shouldn't store the download in the audit log if the transaction executer is different from the user and the user has download permissions over the file", async function() {
        // Arrange
        const { accessControl, userRegisterContract, fileAnaRita, userAnaRita, signer1, signer2 } = await loadFixture(deployContractAndSetVariables);
        const encSymmetricKey = "encSymmetricKeyFileAnaRita";
        await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user
        await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita, encSymmetricKey); // gives the download permissions

        // Act
        const tx = await accessControl.connect(signer2).downloadFileAudit(fileAnaRita.ipfsCID, userAnaRita.account);
        await tx.wait();

        // Assert
        const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
        expect(receipt.status).to.equal(1); // 1 = success

        const auditLogControlAddress = await accessControl.connect(signer1).getAuditLogControlAddress();
        const auditLogControlContract = await ethers.getContractAt("AuditLogControl", auditLogControlAddress);

        const result = await auditLogControlContract.connect(signer1).getLogs([fileAnaRita.ipfsCID]);
        expect(result.success).to.equal(true);
        expect(result.logs.length).to.equal(1); // Already has the upload on the audit log, but doesn't have the download 
    });

    it("Shouldn't store the download in the audit log if the transaction executer is the same as the  user and the user doesn't have permissions over the file", async function(){
        // Arrange
        const { accessControl, userRegisterContract, fileAnaRita, userAnaRita, signer1 } = await loadFixture(deployContractAndSetVariables);
        await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user

        // Act
        const tx = await accessControl.connect(signer1).downloadFileAudit(fileAnaRita.ipfsCID, userAnaRita.account);
        await tx.wait();

        // Assert
        const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
        expect(receipt.status).to.equal(1); // 1 = success

        const auditLogControlAddress = await accessControl.connect(signer1).getAuditLogControlAddress();
        const auditLogControlContract = await ethers.getContractAt("AuditLogControl", auditLogControlAddress);

        const result = await auditLogControlContract.connect(signer1).getLogs([fileAnaRita.ipfsCID]);
        expect(result.success).to.equal(false);
        expect(result.logs.length).to.equal(0); 
    });

    // Already tests the delete() action being stored in the audit log
    it("Shouldn't store the download in the audit log if the file is not in the active state", async function(){
        // Arrange
        const { accessControl, userRegisterContract, fileAnaRita, userAnaRita, signer1 } = await loadFixture(deployContractAndSetVariables);
        const encSymmetricKey = "encSymmetricKeyFileAnaRita";
        await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user
        await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita, encSymmetricKey); // gives the download permissions
        await accessControl.connect(signer1).deactivateFileUserAssociation(userAnaRita.account, fileAnaRita.ipfsCID); // Eliminates the file by deactivating it

        // Act
        const tx = await accessControl.connect(signer1).downloadFileAudit(fileAnaRita.ipfsCID, userAnaRita.account);
        await tx.wait();

        // Assert
        const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
        expect(receipt.status).to.equal(1); // 1 = success

        const auditLogControlAddress = await accessControl.connect(signer1).getAuditLogControlAddress();
        const auditLogControlContract = await ethers.getContractAt("AuditLogControl", auditLogControlAddress);

        const result = await auditLogControlContract.connect(signer1).getLogs([fileAnaRita.ipfsCID]);
        expect(result.success).to.equal(true);
        expect(result.logs.length).to.equal(2); // It has the upload and delete in the log, it didn't store the download
    });
});

