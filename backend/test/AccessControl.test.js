const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");

describe("AccessControl", function () {

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

        const [signer1, signer2, signer3] = await ethers.getSigners(); // Get the first signer 

        const userAnaRita = {
            account: await signer1.getAddress(),  // address of the one executing the transaction
            userName: "ana rita",
            mnemonic: "wisdom skate describe aim code april harsh reveal board order habit van",
            publicKey: "publicKeyAnaRita"
        };

        const userAnaPaula = {
            account: await signer2.getAddress(),  // address of the one executing the transaction
            userName: "ana paula",
            mnemonic: "angry flavor wire wish struggle prepare apart say stuff lounge increase area",
            publicKey: "publicKeyAnaPaula"
        };

        const userAnaLuisa = {
            account: await signer3.getAddress(),  // address of the one executing the transaction
            userName: "ana luisa",
            mnemonic: "loyal total absurd raccoon today simple whip subway ladder frost purchase twice",
            publicKey: "publicKeyAnaLuisa"
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

        const fileAnaPaula = {
            ipfsCID: "anaPaulaIpfsCID2",        
            fileName: "anaPaulaFile1.jpg",  
            version: 0,
            prevIpfsCID: "0",        
            owner: userAnaPaula.account, // Ana Paula is the file owner             
            fileType: "image",           
            iv: "ivFileAnaPaula", 
            state: "",
            fileHash: "fileHashAnaPaula"  
        };

        return { userRegisterContract, fileRegisterContract, accessControl, userAnaRita, userAnaPaula, userAnaLuisa, fileAnaRita, fileAnaPaula, signer1, signer2, signer3 };
    }


    // Tests: association between the user and the file 
    //        addFile() verification is done on the FileRegister.test.js
    //        the auditLog verification is done on the AuditLog.test.js
    //        this test verifies if the association between the user and the file was well performed
    // Already tests: elegibleToUpload()
    // Already tests the recordLogFromAccessControl() and the getLogs() from AuditLog.sol
    describe("uploadFile", function(){
        describe("when the transaction executer is the same as the user account", async function(){
            describe("and the user is not associated with the file, the user exists, the file doesn't exist, and fields are valid", async function(){
                it("should uplad the file and add the action to the Audit Log", async function(){
                    // Arrange
                    const { userRegisterContract, accessControl, userAnaRita, fileAnaRita, signer1 } = await loadFixture(deployContractAndSetVariables);
                    const encSymmetricKey = "encSymmetricKeyFileAnaRita";
                    userRegisterContract.connect(signer1).userRegistered(userAnaRita);

                    // Act
                    const tx = await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita, encSymmetricKey);
                    await tx.wait();

                    // Assert
                    const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
                    expect(receipt.status).to.equal(1); // 1 = success

                    const resEcSymmetricKey = await accessControl.connect(signer1).getEncSymmetricKeyFileUser(userAnaRita.account, fileAnaRita.ipfsCID);
                    expect(resEcSymmetricKey.success).to.equal(true);       
                    expect(resEcSymmetricKey.resultString).to.equal(encSymmetricKey);
                    
                    const resPermissions = await accessControl.getPermissionsOverFile(userAnaRita.account, fileAnaRita.ipfsCID);
                    expect(resPermissions.success).to.equal(true);
                    expect(resPermissions.resultStrings).to.deep.equal(["share", "download", "delete", "edit"]);
                    
                    const userAssociatedWithFile = await accessControl.userAssociatedWithFile(userAnaRita.account, fileAnaRita.ipfsCID);
                    expect(userAssociatedWithFile).to.equal(true);

                    const auditLogControlAddress = await accessControl.connect(signer1).getAuditLogControlAddress();
                    const auditLogControlContract = await ethers.getContractAt("AuditLogControl", auditLogControlAddress);

                    const result = await auditLogControlContract.connect(signer1).getLogs([fileAnaRita.ipfsCID]);
                    expect(result.success).to.equal(true);
                    expect(result.logs.length).to.equal(1); // It has the upload
                });
            });
            describe("and the user is already associated with the file", async function(){
                it("should NOT uplad the file", async function(){
                    // Arrange
                    const { userRegisterContract, accessControl, userAnaRita, fileAnaRita, signer1 } = await loadFixture(deployContractAndSetVariables);
                    const encSymmetricKey = "encSymmetricKeyFileAnaRita";
                    const newEncSymmetricKey = "encSymmetricKeyNewFileAnaRitaUpload";
                    await userRegisterContract.connect(signer1).userRegistered(userAnaRita);
                    await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita, encSymmetricKey); // Associates with the file

                    // Act
                    const tx = await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita, newEncSymmetricKey); // tries to execute the same action
                    await tx.wait();

                    // Assert
                    const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
                    expect(receipt.status).to.equal(1); // 1 = success
                    
                    const resEcSymmetricKey = await accessControl.getEncSymmetricKeyFileUser(userAnaRita.account, fileAnaRita.ipfsCID);
                    expect(resEcSymmetricKey.success).to.equal(true);       
                    expect(resEcSymmetricKey.resultString).to.equal(encSymmetricKey); // Encryption key keeps the same as the 1st upload

                    const userAssociatedWithFile = await accessControl.userAssociatedWithFile(userAnaRita.account, fileAnaRita.ipfsCID);
                    expect(userAssociatedWithFile).to.equal(true);
                });
            });
        });
        describe("when the transaction executer is not the same as the user account", async function(){
            it("should NOT upload the file", async function(){
                // Arrange
                const { userRegisterContract, accessControl, userAnaRita, fileAnaRita, signer2 } = await loadFixture(deployContractAndSetVariables);
                const encSymmetricKey = "encSymmetricKeyFileAnaRita";
                userRegisterContract.userRegistered(userAnaRita);

                // Act
                const tx = await accessControl.connect(signer2).uploadFile(userAnaRita.account, fileAnaRita, encSymmetricKey);
                await tx.wait();

                // Assert
                const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
                expect(receipt.status).to.equal(1); // 1 = success
                
                const userAssociatedWithFile = await accessControl.userAssociatedWithFile(userAnaRita.account, fileAnaRita.ipfsCID);
                expect(userAssociatedWithFile).to.equal(false);
            });
        });
    });

    // Already tests the elegibleToShare
    // Already tests the recordLogFromAccessControl() and the getLogs() from AuditLog.sol
    describe("shareFile", function(){
        describe("when the user to share is not the file owner or the transaction executer, the user is not associated with the file, the transaction executer is associated with the file with share permissions, file and user exists, file is in the active state and its fields are valid", async function(){
            it("should share the file with the user and add the action to the audit log", async function(){
                // Arrange
                const { userRegisterContract, accessControl, userAnaPaula, userAnaRita, fileAnaPaula, signer2, signer1 } = await loadFixture(deployContractAndSetVariables);
                const encSymmetricKey = "encSymmetricKeyFileAnaPaula";
                await userRegisterContract.connect(signer2).userRegistered(userAnaPaula); // Register the user
                await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user
                await accessControl.connect(signer2).uploadFile(userAnaPaula.account, fileAnaPaula, encSymmetricKey); // uploads the file so the signe2 has "share" permissions

                // Act
                const tx = await accessControl.connect(signer2).shareFile(userAnaRita.account, fileAnaPaula.ipfsCID, encSymmetricKey, ["download", "delete"]);
                await tx.wait();

                // Assert
                const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
                expect(receipt.status).to.equal(1); // 1 = success

                const isUserAssociatedAfterUpload = await accessControl.connect(signer1).userAssociatedWithFile(userAnaRita.account, fileAnaPaula.ipfsCID);
                expect(isUserAssociatedAfterUpload).to.equal(true);

                const resPermissions = await accessControl.connect(signer1).getPermissionsOverFile(userAnaRita.account, fileAnaPaula.ipfsCID);
                expect(resPermissions.success).to.equal(true);
                expect(resPermissions.resultStrings).to.deep.equal(["download", "delete"]);

                const auditLogControlAddress = await accessControl.connect(signer1).getAuditLogControlAddress();
                const auditLogControlContract = await ethers.getContractAt("AuditLogControl", auditLogControlAddress);

                const result = await auditLogControlContract.connect(signer1).getLogs([fileAnaPaula.ipfsCID]);
                expect(result.success).to.equal(true);
                expect(result.logs.length).to.equal(2); // It has the upload
            });
        });
        describe("when the file doesn't exist", async function(){
            it("should NOT share the file with the user", async function(){
                // Arrange
                const { userRegisterContract, accessControl, userAnaPaula, userAnaRita, fileAnaPaula, fileAnaRita, signer2, signer1 } = await loadFixture(deployContractAndSetVariables);
                const encSymmetricKey = "encSymmetricKeyFileAnaPaula";
                await userRegisterContract.connect(signer2).userRegistered(userAnaPaula); // Register the user
                await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user
                await accessControl.connect(signer2).uploadFile(userAnaPaula.account, fileAnaPaula, encSymmetricKey); // uploads the file so the signe2 has "share" permissions

                // Act
                const tx = await accessControl.connect(signer2).shareFile(userAnaRita.account, fileAnaRita.ipfsCID, encSymmetricKey, ["download", "delete"]);
                await tx.wait();

                // Assert
                const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
                expect(receipt.status).to.equal(1); // 1 = success

                const isUserAssociatedAfterUpload = await accessControl.connect(signer1).userAssociatedWithFile(userAnaRita.account, fileAnaPaula.ipfsCID);
                expect(isUserAssociatedAfterUpload).to.equal(false);
            });
        });
        describe("when the user doesn't exist", async function(){
            it("should NOT share the file with the user", async function(){
                // Arrange
                const { userRegisterContract, accessControl, userAnaPaula, userAnaRita, fileAnaPaula, signer2, signer1 } = await loadFixture(deployContractAndSetVariables);
                const encSymmetricKey = "encSymmetricKeyFileAnaPaula";
                await userRegisterContract.connect(signer2).userRegistered(userAnaPaula); // Register the user
                await accessControl.connect(signer2).uploadFile(userAnaPaula.account, fileAnaPaula, encSymmetricKey); // uploads the file so the signe2 has "share" permissions

                // Act
                const tx = await accessControl.connect(signer2).shareFile(userAnaRita.account, fileAnaPaula.ipfsCID, encSymmetricKey, ["download", "delete"]);
                await tx.wait();

                // Assert
                const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
                expect(receipt.status).to.equal(1); // 1 = success

                const isUserAssociatedAfterUpload = await accessControl.connect(signer1).userAssociatedWithFile(userAnaRita.account, fileAnaPaula.ipfsCID);
                expect(isUserAssociatedAfterUpload).to.equal(false);
            });
        });
        describe("when the user to share the file with is the same as the transaction executer", async function(){
            it("should NOT share the file with the user", async function(){
                // Arrange
                const { userRegisterContract, accessControl, userAnaPaula, userAnaRita, fileAnaRita, signer2, signer1 } = await loadFixture(deployContractAndSetVariables);
                const encSymmetricKey = "encSymmetricKeyFileAnaRita";
                await userRegisterContract.connect(signer2).userRegistered(userAnaPaula); // Register the user
                await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user

                await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita, encSymmetricKey); // Ana Rita owner of the file
                await accessControl.connect(signer1).shareFile(userAnaPaula.account, fileAnaRita.ipfsCID, encSymmetricKey, ["download", "share"]); // Ana Rita shares the fie with Ana Paula

                // Act - userAnaPaula tries to give herself more permissions over fileAnaRita 
                const tx = await accessControl.connect(signer2).shareFile(userAnaPaula.account, fileAnaRita.ipfsCID, encSymmetricKey, ["download", "delete", "share"]);
                await tx.wait();

                // Assert
                const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
                expect(receipt.status).to.equal(1); // 1 = success

                const isUserAssociatedAfterUpload = await accessControl.connect(signer2).userAssociatedWithFile(userAnaPaula.account, fileAnaRita.ipfsCID);
                expect(isUserAssociatedAfterUpload).to.equal(true);

                const resPermissions = await accessControl.connect(signer2).getPermissionsOverFile(userAnaPaula.account, fileAnaRita.ipfsCID);
                expect(resPermissions.success).to.equal(true);
                expect(resPermissions.resultStrings).to.deep.equal(["download", "share"]); // Permission share was not added 
            });
        });
        describe("when the user to share the file with is the same as the file owner", async function(){
            it("should NOT share the file with the user", async function(){
                // Arrange
                const { userRegisterContract, accessControl, userAnaPaula, userAnaRita, fileAnaRita, signer2, signer1 } = await loadFixture(deployContractAndSetVariables);
                const encSymmetricKey = "encSymmetricKeyFileAnaRita";
                await userRegisterContract.connect(signer2).userRegistered(userAnaPaula); // Register the user
                await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user

                await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita, encSymmetricKey); // Ana Rita owner of the file
                await accessControl.connect(signer1).shareFile(userAnaPaula.account, fileAnaRita.ipfsCID, encSymmetricKey, ["download", "delete", "share"]); // Ana Rita shares the fie with Ana Paula

                // Act - userAnaPaula tries to take all the owners permission over the file
                const tx = await accessControl.connect(signer2).shareFile(userAnaRita.account, fileAnaRita.ipfsCID, encSymmetricKey, []);
                await tx.wait();

                // Assert
                const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
                expect(receipt.status).to.equal(1); // 1 = success

                const isUserAssociatedAfterUpload = await accessControl.connect(signer1).userAssociatedWithFile(userAnaRita.account, fileAnaRita.ipfsCID);
                expect(isUserAssociatedAfterUpload).to.equal(true);

                const resPermissions = await accessControl.connect(signer1).getPermissionsOverFile(userAnaRita.account, fileAnaRita.ipfsCID);
                expect(resPermissions.success).to.equal(true);
                expect(resPermissions.resultStrings).to.deep.equal(["share", "download", "delete", "edit"]); // The file owner keeps with all his permissions
            });
        });
        describe("when the user to share the file with is already associated with the file", async function(){
            it("should NOT share the file with the user", async function(){
                // Arrange
                const { userRegisterContract, accessControl, userAnaPaula, userAnaRita, fileAnaPaula, signer2, signer1 } = await loadFixture(deployContractAndSetVariables);
                const encSymmetricKey = "encSymmetricKeyFileAnaPaula";
                await userRegisterContract.connect(signer2).userRegistered(userAnaPaula); // Register the user
                await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user
                await accessControl.connect(signer2).uploadFile(userAnaPaula.account, fileAnaPaula, encSymmetricKey); // uploads the file so the signe2 has "share" permissions
                await accessControl.connect(signer2).shareFile(userAnaRita.account, fileAnaPaula.ipfsCID, encSymmetricKey, ["download", "delete"]);

                // Act - tries to update the file permissions by calling agian the shareFile
                const tx = await accessControl.connect(signer2).shareFile(userAnaRita.account, fileAnaPaula.ipfsCID, encSymmetricKey, ["download"]);
                await tx.wait();

                // Assert
                const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
                expect(receipt.status).to.equal(1); // 1 = success

                const isUserAssociatedAfterUpload = await accessControl.connect(signer1).userAssociatedWithFile(userAnaRita.account, fileAnaPaula.ipfsCID);
                expect(isUserAssociatedAfterUpload).to.equal(true);

                const resPermissions = await accessControl.connect(signer1).getPermissionsOverFile(userAnaRita.account, fileAnaPaula.ipfsCID);
                expect(resPermissions.success).to.equal(true);
                expect(resPermissions.resultStrings).to.deep.equal(["download", "delete"]); // No efect o the try to update the files' permissions
            });
        });
        describe("when the transaction executer doesn't have share permissions over the file", async function(){
            it("should NOT share the file with the user", async function(){
                // Arrange
                const { userRegisterContract, accessControl, userAnaPaula, userAnaRita, userAnaLuisa, fileAnaRita, signer2, signer1, signer3 } = await loadFixture(deployContractAndSetVariables);
                const encSymmetricKey = "encSymmetricKeyFileAnaRita";
                await userRegisterContract.connect(signer2).userRegistered(userAnaPaula); // Register the user
                await userRegisterContract.connect(signer1).userRegistered(userAnaRita);  // Register the user
                await userRegisterContract.connect(signer3).userRegistered(userAnaLuisa); // Register the user

                await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita, encSymmetricKey); // Ana Rita owner of the file
                await accessControl.connect(signer1).shareFile(userAnaPaula.account, fileAnaRita.ipfsCID, encSymmetricKey, ["download", "delete"]); // Ana Rita shares the fie with Ana Paula

                // Act - userAnaPaula tries to take all the owners permission over the file
                const tx = await accessControl.connect(signer2).shareFile(userAnaLuisa.account, fileAnaRita.ipfsCID, encSymmetricKey, ["download"]);
                await tx.wait();

                // Assert
                const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
                expect(receipt.status).to.equal(1); // 1 = success

                const isUserAssociatedAfterUpload = await accessControl.connect(signer3).userAssociatedWithFile(userAnaLuisa.account, fileAnaRita.ipfsCID);
                expect(isUserAssociatedAfterUpload).to.equal(false);
            });
        });
        describe("when the file is not in the active state", async function(){
            it("should NOT share the file with the user", async function(){
                // Arrange
                const { userRegisterContract, accessControl, userAnaPaula, userAnaRita, fileAnaPaula, signer2, signer1 } = await loadFixture(deployContractAndSetVariables);
                const encSymmetricKey = "encSymmetricKeyFileAnaPaula";
                await userRegisterContract.connect(signer2).userRegistered(userAnaPaula); // Register the user
                await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user
                await accessControl.connect(signer2).uploadFile(userAnaPaula.account, fileAnaPaula, encSymmetricKey); // uploads the file so the signe2 has "share" permissions

                await accessControl.connect(signer2).deactivateFile(userAnaPaula.account, fileAnaPaula.ipfsCID); // deactivate the file - deletes the file

                // Act
                const tx = await accessControl.connect(signer2).shareFile(userAnaRita.account, fileAnaPaula.ipfsCID, encSymmetricKey, ["download", "delete"]);
                await tx.wait();

                // Assert
                const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
                expect(receipt.status).to.equal(1); // 1 = success

                const isUserAssociatedAfterUpload = await accessControl.connect(signer1).userAssociatedWithFile(userAnaRita.account, fileAnaPaula.ipfsCID);
                expect(isUserAssociatedAfterUpload).to.equal(false);
            });
        });
    });

    // already tests the elegibleToUpdPermissions()
    // Already tests the recordLogFromAccessControl() and the getLogs() from AuditLog.sol
    describe("updateUserFilePermissions", function(){
        describe("when the transaction executer is not the user or the file owner, and the transaction executer has share permissions", async function(){
            it("should update the users' permissions and add the action to the Audit Log", async function(){
                // Arrange
                const { userRegisterContract, accessControl, userAnaPaula, userAnaRita, fileAnaRita, signer1, signer2 } = await loadFixture(deployContractAndSetVariables);
                const encSymmetricKey = "encSymmetricKeyFileAnaRita";
                await userRegisterContract.connect(signer2).userRegistered(userAnaPaula); // Register the user
                await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user

                await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita, encSymmetricKey); // Ana Rita owner of the file
                await accessControl.connect(signer1).shareFile(userAnaPaula.account, fileAnaRita.ipfsCID, encSymmetricKey, ["download", "delete"]); // Ana Rita shares the fie with Ana Paula

                // Act
                const tx = await accessControl.connect(signer1).updateUserFilePermissions(userAnaPaula.account, fileAnaRita.ipfsCID, ["download"]);
                await tx.wait();

                // Assert
                const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
                expect(receipt.status).to.equal(1); // 1 = success

                const isUserAssociatedAfterUpload = await accessControl.connect(signer2).userAssociatedWithFile(userAnaPaula.account, fileAnaRita.ipfsCID);
                expect(isUserAssociatedAfterUpload).to.equal(true);

                const resPermissions = await accessControl.connect(signer2).getPermissionsOverFile(userAnaPaula.account, fileAnaRita.ipfsCID);
                expect(resPermissions.success).to.equal(true);
                expect(resPermissions.resultStrings).to.deep.equal(["download"]); // Permission share was not added

                const auditLogControlAddress = await accessControl.connect(signer1).getAuditLogControlAddress();
                const auditLogControlContract = await ethers.getContractAt("AuditLogControl", auditLogControlAddress);

                const result = await auditLogControlContract.connect(signer1).getLogs([fileAnaRita.ipfsCID]);
                expect(result.success).to.equal(true);
                expect(result.logs.length).to.equal(3); // It has the upload
            });
        });
        describe("when the transaction executer is the user", async function(){
            it("should NOT update the users' permissions", async function(){
                // Arrange
                const { userRegisterContract, accessControl, userAnaPaula, userAnaRita, fileAnaRita, signer2, signer1 } = await loadFixture(deployContractAndSetVariables);
                const encSymmetricKey = "encSymmetricKeyFileAnaRita";
                await userRegisterContract.connect(signer2).userRegistered(userAnaPaula); // Register the user
                await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user

                await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita, encSymmetricKey); // Ana Rita owner of the file
                await accessControl.connect(signer1).shareFile(userAnaPaula.account, fileAnaRita.ipfsCID, encSymmetricKey, ["download", "share"]); // Ana Rita shares the fie with Ana Paula

                // Act - userAnaPaula tries to update her own permissions
                const tx = await accessControl.connect(signer2).updateUserFilePermissions(userAnaPaula.account, fileAnaRita.ipfsCID, ["download", "delete", "share"]);
                await tx.wait();

                // Assert
                const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
                expect(receipt.status).to.equal(1); // 1 = success

                const isUserAssociatedAfterUpload = await accessControl.connect(signer2).userAssociatedWithFile(userAnaPaula.account, fileAnaRita.ipfsCID);
                expect(isUserAssociatedAfterUpload).to.equal(true);

                const resPermissions = await accessControl.connect(signer2).getPermissionsOverFile(userAnaPaula.account, fileAnaRita.ipfsCID);
                expect(resPermissions.success).to.equal(true);
                expect(resPermissions.resultStrings).to.deep.equal(["download", "share"]); // Permission delete was not added
            });
        });
        describe("when the transaction executer is the file owner", async function(){
            it("should NOT update the users' permissions", async function(){
                // Arrange
                const { userRegisterContract, accessControl, userAnaPaula, userAnaRita, userAnaLuisa, fileAnaRita, signer2, signer1, signer3 } = await loadFixture(deployContractAndSetVariables);
                const encSymmetricKey = "encSymmetricKeyFileAnaRita";
                await userRegisterContract.connect(signer2).userRegistered(userAnaPaula); // Register the user
                await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user
                await userRegisterContract.connect(signer3).userRegistered(userAnaLuisa); // Register the user

                await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita, encSymmetricKey); // Ana Rita owner of the file
                await accessControl.connect(signer1).shareFile(userAnaPaula.account, fileAnaRita.ipfsCID, encSymmetricKey, ["download", "delete"]); // Ana Rita shares the fie with Ana Paula
                await accessControl.connect(signer1).shareFile(userAnaLuisa.account, fileAnaRita.ipfsCID, encSymmetricKey, ["download", "share"]); // Ana Rita shares the fie with Ana Paula

                // Act - userAnaPaula tries to update permissions of another user
                const tx = await accessControl.connect(signer2).updateUserFilePermissions(userAnaLuisa.account, fileAnaRita.ipfsCID, ["download", "delete"]);
                await tx.wait();

                // Assert
                const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
                expect(receipt.status).to.equal(1); // 1 = success

                const isUserAssociatedAfterUpload = await accessControl.connect(signer3).userAssociatedWithFile(userAnaLuisa.account, fileAnaRita.ipfsCID);
                expect(isUserAssociatedAfterUpload).to.equal(true);

                const resPermissions = await accessControl.connect(signer3).getPermissionsOverFile(userAnaLuisa.account, fileAnaRita.ipfsCID);
                expect(resPermissions.success).to.equal(true);
                expect(resPermissions.resultStrings).to.deep.equal(["download", "share"]); // Permission share was not excahnged for the delete
            });
        });
        describe("when the transaction executer doesn't have share permissions", async function(){
            it("should NOT update the users' permissions", async function(){
                // Arrange
                const { userRegisterContract, accessControl, userAnaPaula, userAnaRita, fileAnaRita, signer2, signer1 } = await loadFixture(deployContractAndSetVariables);
                const encSymmetricKey = "encSymmetricKeyFileAnaRita";
                await userRegisterContract.connect(signer2).userRegistered(userAnaPaula); // Register the user
                await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user
                await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita, encSymmetricKey); // Ana Rita owner of the file
                await accessControl.connect(signer1).shareFile(userAnaPaula.account, fileAnaRita.ipfsCID, encSymmetricKey, ["download", "share"]); // Ana Rita shares the fie with Ana Paula

                // Act - userAnaPaula tries to update the file owner permissions
                const tx = await accessControl.connect(signer2).updateUserFilePermissions(userAnaRita.account, fileAnaRita.ipfsCID, []);
                await tx.wait();

                // Assert
                const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
                expect(receipt.status).to.equal(1); // 1 = success

                const isUserAssociatedAfterUpload = await accessControl.connect(signer1).userAssociatedWithFile(userAnaRita.account, fileAnaRita.ipfsCID);
                expect(isUserAssociatedAfterUpload).to.equal(true);

                const resPermissions = await accessControl.connect(signer1).getPermissionsOverFile(userAnaRita.account, fileAnaRita.ipfsCID);
                expect(resPermissions.success).to.equal(true);
                expect(resPermissions.resultStrings).to.deep.equal(["share", "download", "delete", "edit"]); // Permission delete was not added
            });
        });
        describe("when the file to be shared is not in the active state", async function(){
            it("should NOT update the users' permissions", async function(){
                // Arrange
                const { userRegisterContract, accessControl, userAnaPaula, userAnaRita, fileAnaRita, signer1, signer2 } = await loadFixture(deployContractAndSetVariables);
                const encSymmetricKey = "encSymmetricKeyFileAnaRita";
                await userRegisterContract.connect(signer2).userRegistered(userAnaPaula); // Register the user
                await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user

                await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita, encSymmetricKey); // Ana Rita owner of the file
                await accessControl.connect(signer1).shareFile(userAnaPaula.account, fileAnaRita.ipfsCID, encSymmetricKey, ["download", "delete"]); // Ana Rita shares the fie with Ana Paula

                await accessControl.connect(signer1).deactivateFile(userAnaRita.account, fileAnaRita.ipfsCID);

                // Act
                const tx = await accessControl.connect(signer1).updateUserFilePermissions(userAnaPaula.account, fileAnaRita.ipfsCID, ["download"]);
                await tx.wait();

                // Assert
                const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
                expect(receipt.status).to.equal(1); // 1 = success

                const isUserAssociatedAfterUpload = await accessControl.connect(signer2).userAssociatedWithFile(userAnaPaula.account, fileAnaRita.ipfsCID);
                expect(isUserAssociatedAfterUpload).to.equal(false);

                const resPermissions = await accessControl.connect(signer2).getPermissionsOverFile(userAnaPaula.account, fileAnaRita.ipfsCID);
                expect(resPermissions.success).to.equal(false); // We cannot get the permissions of files that are now deactivated
            });
        });
    });

    // Already tests the recordLogFromAccessControl() and the getLogs() from AuditLog.sol
    describe("deactivateFile", function(){
        describe("when the transaction executer has delete permitions over a file, and the file is in the active state", async function(){
            it("should deactivate the file", async function(){
                // Arrange
                const { accessControl, userRegisterContract, fileAnaRita, userAnaRita, signer1 } = await loadFixture(deployContractAndSetVariables);
                const encSymmetricKey = "encSymmetricKeyFileAnaRita";
                await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user
                await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita, encSymmetricKey); // gives the download permissions
                
                // Act
                const tx = await accessControl.connect(signer1).deactivateFile(userAnaRita.account, fileAnaRita.ipfsCID);
                await tx.wait();

                // Assert
                const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
                expect(receipt.status).to.equal(1); // 1 = success

                const res = await accessControl.connect(signer1).userAssociatedWithFile(userAnaRita.account, fileAnaRita.ipfsCID);
                expect(res).to.equal(false);

                const auditLogControlAddress = await accessControl.connect(signer1).getAuditLogControlAddress();
                const auditLogControlContract = await ethers.getContractAt("AuditLogControl", auditLogControlAddress);

                const result = await auditLogControlContract.connect(signer1).getLogs([fileAnaRita.ipfsCID]);
                expect(result.success).to.equal(true);
                expect(result.logs.length).to.equal(2); // It has the upload and the file deactivated
            });
        });
        describe("when the transaction executer doesn't have permissions over a file", async function(){
            it("should NOT deactivate the file ", async function(){
                // Arrange
                const { accessControl, userRegisterContract, fileAnaRita, userAnaRita, userAnaPaula, signer1, signer2 } = await loadFixture(deployContractAndSetVariables);
                const encSymmetricKey = "encSymmetricKeyFileAnaRita";
                await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user
                await userRegisterContract.connect(signer2).userRegistered(userAnaPaula); // Register the user

                await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita, encSymmetricKey); // gives the download permissions
                await accessControl.connect(signer1).shareFile(userAnaPaula.account, fileAnaRita.ipfsCID, encSymmetricKey, ["download"]); // Ana Rita shares the fie with Ana Paula

                // Act
                const tx = await accessControl.connect(signer2).deactivateFile(userAnaPaula.account, fileAnaRita.ipfsCID);
                await tx.wait();

                // Assert
                const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
                expect(receipt.status).to.equal(1); // 1 = success

                const res = await accessControl.connect(signer1).userAssociatedWithFile(userAnaRita.account, fileAnaRita.ipfsCID);
                expect(res).to.equal(true);

                const auditLogControlAddress = await accessControl.connect(signer1).getAuditLogControlAddress();
                const auditLogControlContract = await ethers.getContractAt("AuditLogControl", auditLogControlAddress);
                
                const result = await auditLogControlContract.connect(signer1).getLogs([fileAnaRita.ipfsCID]);
                expect(result.success).to.equal(true);
                expect(result.logs.length).to.equal(2); // It has the upload and the file share
            });
        });
        describe("when the file doesn't exist", async function(){
            it("should NOT deactivate the file ", async function(){
                // Arrange
                const { accessControl, userRegisterContract, fileAnaRita, userAnaRita, userAnaPaula, signer1, signer2 } = await loadFixture(deployContractAndSetVariables);
                await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user

                // Act
                const tx = await accessControl.connect(signer2).deactivateFile(userAnaPaula.account, fileAnaRita.ipfsCID);
                await tx.wait();

                // Assert
                const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
                expect(receipt.status).to.equal(1); // 1 = success

            });
        });
        describe("when the file is not in the active state", async function(){
            it("should NOT deactivate the file ", async function(){
                // Arrange
                const { accessControl, userRegisterContract, fileAnaRita, userAnaRita, signer1 } = await loadFixture(deployContractAndSetVariables);
                const encSymmetricKey = "encSymmetricKeyFileAnaRita";
                await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user

                await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita, encSymmetricKey); // gives the download permissions
                await accessControl.connect(signer1).deactivateFile(userAnaRita.account, fileAnaRita.ipfsCID);  // deactivates the file

                // Act
                const tx = await accessControl.connect(signer1).deactivateFile(userAnaRita.account, fileAnaRita.ipfsCID); // tries to deactivate the file which was already deactivated
                await tx.wait();

                // Assert
                const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
                expect(receipt.status).to.equal(1); // 1 = success

                const res = await accessControl.connect(signer1).userAssociatedWithFile(userAnaRita.account, fileAnaRita.ipfsCID);
                expect(res).to.equal(false); // because the file is deactivated

            });
        });
    });

    // Other cases of this method are tested on the FileReegister.test.js in the editFile method
    // Already tests the recordLogFromAccessControl() and the getLogs() from AuditLog.sol
    describe("editFile", async function(){
        describe("when the transaction executer has edit permissions over a file and the file is in the active state", async function(){
            it("should associate all users to this new edited file", async function(){
                // Arrange
                const { accessControl, userRegisterContract, fileAnaRita, fileAnaPaula, userAnaRita, userAnaLuisa, userAnaPaula, signer1, signer2, signer3 } = await loadFixture(deployContractAndSetVariables);
                await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user Ana Rita
                await userRegisterContract.connect(signer2).userRegistered(userAnaPaula); // Register the user Ana Paula
                await userRegisterContract.connect(signer3).userRegistered(userAnaLuisa); // Register the user Ana Luisa

                // Each user has its own encSymmetricKey over the file, which on the client side is decripted using their private keys
                const encSymmetricKeyAnaRita = "encSymmetricKeyFileAnaRita";
                const encSymmetricKeyAnaPaula = "encSymmetricKeyFileAnaPaula";
                const encSymmetricKeyAnaLuisa = "encSymmetricKeyFileAnaLuisa";
                await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita, encSymmetricKeyAnaRita); // Ana Rita has all permissions over the file
                await accessControl.connect(signer1).shareFile(userAnaPaula.account, fileAnaRita.ipfsCID, encSymmetricKeyAnaPaula, ["download", "delete"]); // Ana Rita shares the fie with Ana Paula
                await accessControl.connect(signer1).shareFile(userAnaLuisa.account, fileAnaRita.ipfsCID, encSymmetricKeyAnaLuisa, ["edit"]); // Ana Rita shares the fie with Ana Luisa

                // Act
                const tx = await accessControl.connect(signer1).editFile(fileAnaRita, fileAnaPaula, [userAnaRita.account, userAnaPaula.account], [encSymmetricKeyAnaRita, encSymmetricKeyAnaPaula]);
                await tx.wait();

                // Assert
                const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
                expect(receipt.status).to.equal(1); // 1 = success

                
                var res = await accessControl.userAssociatedWithFile(userAnaRita.account, fileAnaPaula.ipfsCID);
                var resEncSymmetricKey = await accessControl.connect(signer1).getEncSymmetricKeyFileUser(userAnaRita.account, fileAnaPaula.ipfsCID); // symmetric key is corresponding to each user
                var resPermissions = await accessControl.getPermissionsOverFile(userAnaRita.account, fileAnaPaula.ipfsCID); // permissions are kept the same over this new file
                expect(res).to.equal(true);
                expect(resEncSymmetricKey.resultString).to.equal(encSymmetricKeyAnaRita);
                expect(resPermissions.resultStrings).to.deep.equal(["share", "download", "delete", "edit"]);
                
                res = await accessControl.userAssociatedWithFile(userAnaPaula.account, fileAnaPaula.ipfsCID);
                resEncSymmetricKey = await accessControl.connect(signer2).getEncSymmetricKeyFileUser(userAnaPaula.account, fileAnaPaula.ipfsCID);
                resPermissions = await accessControl.getPermissionsOverFile(userAnaPaula.account, fileAnaPaula.ipfsCID);
                expect(res).to.equal(true);
                expect(resEncSymmetricKey.resultString).to.equal(encSymmetricKeyAnaPaula);
                expect(resPermissions.resultStrings).to.deep.equal(["download", "delete"]);

                res = await accessControl.userAssociatedWithFile(userAnaLuisa.account, fileAnaPaula.ipfsCID);
                resEncSymmetricKey = await accessControl.connect(signer3).getEncSymmetricKeyFileUser(userAnaLuisa.account, fileAnaPaula.ipfsCID);
                resPermissions = await accessControl.getPermissionsOverFile(userAnaLuisa.account, fileAnaPaula.ipfsCID); 
                expect(res).to.equal(true);
                expect(resEncSymmetricKey.resultString).to.equal("encSymmetricKeyFileAnaRita");
                expect(resPermissions.resultStrings).to.deep.equal(["edit"]);

                const auditLogControlAddress = await accessControl.connect(signer1).getAuditLogControlAddress();
                const auditLogControlContract = await ethers.getContractAt("AuditLogControl", auditLogControlAddress);

                const result = await auditLogControlContract.connect(signer1).getLogs([fileAnaRita.ipfsCID]);
                expect(result.success).to.equal(true);
                expect(result.logs.length).to.equal(4); 
            });
        });
        describe("when the transaction executer doesn't have edit permissions over a file", async function(){
            it("should NOT edit the file", async function(){
                // Arrange
                const { accessControl, userRegisterContract, fileAnaRita, fileAnaPaula, userAnaRita, userAnaPaula, signer1, signer2 } = await loadFixture(deployContractAndSetVariables);
                await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user Ana Rita
                await userRegisterContract.connect(signer2).userRegistered(userAnaPaula); // Register the user Ana Paula

                // Each user has its own encSymmetricKey over the file, which on the client side is decripted using their private keys
                const encSymmetricKeyAnaRita = "encSymmetricKeyFileAnaRita";
                const encSymmetricKeyAnaPaula = "encSymmetricKeyFileAnaPaula";
                await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita, encSymmetricKeyAnaRita); // Ana Rita has all permissions over the file
                await accessControl.connect(signer1).shareFile(userAnaPaula.account, fileAnaRita.ipfsCID, encSymmetricKeyAnaPaula, ["download", "delete"]); // Ana Rita shares the fie with Ana Paula

                // Act
                const tx = await accessControl.connect(signer2).editFile(fileAnaRita, fileAnaPaula, [userAnaRita.account, userAnaPaula.account], [encSymmetricKeyAnaRita, encSymmetricKeyAnaPaula]);
                await tx.wait();

                // Assert
                const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
                expect(receipt.status).to.equal(1); // 1 = success


                var res = await accessControl.userAssociatedWithFile(userAnaRita.account, fileAnaPaula.ipfsCID);
                expect(res).to.equal(false);

                res = await accessControl.userAssociatedWithFile(userAnaPaula.account, fileAnaPaula.ipfsCID);
                expect(res).to.equal(false);

                const auditLogControlAddress = await accessControl.connect(signer1).getAuditLogControlAddress();
                const auditLogControlContract = await ethers.getContractAt("AuditLogControl", auditLogControlAddress);

                const result = await auditLogControlContract.connect(signer1).getLogs([fileAnaRita.ipfsCID]);
                expect(result.success).to.equal(true);
                expect(result.logs.length).to.equal(2); 
            });
        });
        describe("when the file is not in the active state", async function(){
            it("should NOT edit the file", async function(){
                // Arrange
                const { accessControl, userRegisterContract, fileAnaRita, fileAnaPaula, userAnaRita, userAnaLuisa, userAnaPaula, signer1, signer2, signer3 } = await loadFixture(deployContractAndSetVariables);
                await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user Ana Rita
                await userRegisterContract.connect(signer2).userRegistered(userAnaPaula); // Register the user Ana Paula
                await userRegisterContract.connect(signer3).userRegistered(userAnaLuisa); // Register the user Ana Luisa

                // Each user has its own encSymmetricKey over the file, which on the client side is decripted using their private keys
                const encSymmetricKeyAnaRita = "encSymmetricKeyFileAnaRita";
                await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita, encSymmetricKeyAnaRita); // Ana Rita has all permissions over the file
                await accessControl.connect(signer1).deactivateFile(userAnaRita.account, fileAnaRita.ipfsCID);  // deactivates the file => puts the file in the deactive state

                // Act
                const tx = await accessControl.connect(signer1).editFile(fileAnaRita, fileAnaPaula, [userAnaRita.account], [encSymmetricKeyAnaRita]);
                await tx.wait();

                // Assert
                const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
                expect(receipt.status).to.equal(1); // 1 = success

                var res = await accessControl.userAssociatedWithFile(userAnaRita.account, fileAnaPaula.ipfsCID);
                expect(res).to.equal(false);

                const auditLogControlAddress = await accessControl.connect(signer1).getAuditLogControlAddress();
                const auditLogControlContract = await ethers.getContractAt("AuditLogControl", auditLogControlAddress);

                const result = await auditLogControlContract.connect(signer1).getLogs([fileAnaRita.ipfsCID]);
                expect(result.success).to.equal(true);
                expect(result.logs.length).to.equal(2); 
            });
        });
    });

    // Already tests the recordLogFromAccessControl() and the getLogs() from AuditLog.sol
    describe("downloadFileAudit", async function(){
        describe("when the transaction executer is the same as the user", async function(){
            describe("and the user has download permissions and the file is in the active state", async function(){
                // Arrange
                const { accessControl, userRegisterContract, fileAnaRita, userAnaRita, signer1 } = await loadFixture(deployContractAndSetVariables);
                await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user Ana Rita
                const encSymmetricKeyAnaRita = "encSymmetricKeyFileAnaRita";
                await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita, encSymmetricKeyAnaRita); // Ana Rita has all permissions over the file

                // Act
                const tx = await accessControl.connect(signer1).downloadFileAudit(fileAnaRita.ipfsCID, userAnaRita.account);
                await tx.wait();

                // Assert
                const auditLogControlAddress = await accessControl.connect(signer1).getAuditLogControlAddress();
                const auditLogControlContract = await ethers.getContractAt("AuditLogControl", auditLogControlAddress);

                const result = await auditLogControlContract.connect(signer1).getLogs([fileAnaRita.ipfsCID]);
                expect(result.success).to.equal(true);
                expect(result.logs.length).to.equal(2); 
            });
            describe("and the user doesn't have download permissions", async function(){
                // Arrange
                const { accessControl, userRegisterContract, fileAnaRita, userAnaRita, userAnaPaula, signer1, signer2 } = await loadFixture(deployContractAndSetVariables);
                await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user Ana Rita
                const encSymmetricKeyAnaRita = "encSymmetricKeyFileAnaRita";
                await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita, encSymmetricKeyAnaRita); // Ana Rita has all permissions over the file
                await accessControl.connect(signer1).shareFile(userAnaPaula.account, fileAnaRita.ipfsCID, encSymmetricKeyAnaPaula, ["delete"]); // Ana Rita shares the fie with Ana Paula

                // Act
                const tx = await accessControl.connect(signer2).downloadFileAudit(fileAnaRita.ipfsCID, userAnaRita.account);
                await tx.wait();

                // Assert
                const auditLogControlAddress = await accessControl.connect(signer1).getAuditLogControlAddress();
                const auditLogControlContract = await ethers.getContractAt("AuditLogControl", auditLogControlAddress);

                const result = await auditLogControlContract.connect(signer1).getLogs([fileAnaRita.ipfsCID]);
                expect(result.success).to.equal(true);
                expect(result.logs.length).to.equal(2); 
            });
            describe("and the file is not in the active state", async function(){
                // Arrange
                const { accessControl, userRegisterContract, fileAnaRita, userAnaRita, signer1 } = await loadFixture(deployContractAndSetVariables);
                await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user Ana Rita
                const encSymmetricKeyAnaRita = "encSymmetricKeyFileAnaRita";
                await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita, encSymmetricKeyAnaRita); // Ana Rita has all permissions over the file
                await accessControl.connect(signer1).deactivateFile(userAnaRita.account, fileAnaRita.ipfsCID);  // deactivates the file => puts the file in the deactive state

                // Act
                const tx = await accessControl.connect(signer1).downloadFileAudit(fileAnaRita.ipfsCID, userAnaRita.account);
                await tx.wait();

                // Assert
                const auditLogControlAddress = await accessControl.connect(signer1).getAuditLogControlAddress();
                const auditLogControlContract = await ethers.getContractAt("AuditLogControl", auditLogControlAddress);

                const result = await auditLogControlContract.connect(signer1).getLogs([fileAnaRita.ipfsCID]);
                expect(result.success).to.equal(true);
                expect(result.logs.length).to.equal(2); 
            });
        });
        describe("when the transaction executer is not the same as the user", async function(){
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
    });

    // Already tests the recordLogFromAccessControl() and the getLogs() from AuditLog.sol
    describe("removeUserFileAssociation", async function(){
        describe("when the transaction executer is not the same as the user", async function(){
            describe("and the user is not the file owner, the user has share permissions over the file, and the file is in the active state", async function(){
                it("should remove the relationship between the user and the file", async function(){
                    // Arrange
                    const { userRegisterContract, accessControl, userAnaPaula, userAnaRita, fileAnaRita, signer1, signer2 } = await loadFixture(deployContractAndSetVariables);
                    const encSymmetricKey = "encSymmetricKeyFileAnaRita";
                    await userRegisterContract.connect(signer2).userRegistered(userAnaPaula); // Register the user
                    await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user

                    await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita, encSymmetricKey); // Ana Rita owner of the file
                    await accessControl.connect(signer1).shareFile(userAnaPaula.account, fileAnaRita.ipfsCID, encSymmetricKey, ["download", "delete"]); // Ana Rita shares the fie with Ana Paula

                    // Act
                    const tx = await accessControl.connect(signer1).removeUserFileAssociation(userAnaPaula.account, fileAnaRita.ipfsCID);
                    await tx.wait();

                    // Assert
                    const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
                    expect(receipt.status).to.equal(1); // 1 = success

                    const isUserAssociatedAfterUpload = await accessControl.connect(signer2).userAssociatedWithFile(userAnaPaula.account, fileAnaRita.ipfsCID);
                    expect(isUserAssociatedAfterUpload).to.equal(false);

                    const auditLogControlAddress = await accessControl.connect(signer1).getAuditLogControlAddress();
                    const auditLogControlContract = await ethers.getContractAt("AuditLogControl", auditLogControlAddress);

                    const result = await auditLogControlContract.connect(signer1).getLogs([fileAnaRita.ipfsCID]);
                    expect(result.success).to.equal(true);
                    expect(result.logs.length).to.equal(3); // It has the upload
                });
            });
            describe("and the user is the file owner", async function() {
                it("should NOT remove the relationship between the user and the file", async function(){
                    // Arrange
                    const { userRegisterContract, accessControl, userAnaPaula, userAnaRita, fileAnaRita, signer1, signer2 } = await loadFixture(deployContractAndSetVariables);
                    const encSymmetricKey = "encSymmetricKeyFileAnaRita";
                    await userRegisterContract.connect(signer2).userRegistered(userAnaPaula); // Register the user
                    await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user

                    await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita, encSymmetricKey); // Ana Rita owner of the file
                    await accessControl.connect(signer1).shareFile(userAnaPaula.account, fileAnaRita.ipfsCID, encSymmetricKey, ["download", "delete", "share"]); // Ana Rita shares the fie with Ana Paula

                    // Act
                    const tx = await accessControl.connect(signer2).removeUserFileAssociation(userAnaRita.account, fileAnaRita.ipfsCID);
                    await tx.wait();

                    // Assert
                    const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
                    expect(receipt.status).to.equal(1); // 1 = success

                    const isUserAssociatedAfterUpload = await accessControl.connect(signer1).userAssociatedWithFile(userAnaRita.account, fileAnaRita.ipfsCID); // relationship of ana rita is kept
                    expect(isUserAssociatedAfterUpload).to.equal(true);

                    const auditLogControlAddress = await accessControl.connect(signer1).getAuditLogControlAddress();
                    const auditLogControlContract = await ethers.getContractAt("AuditLogControl", auditLogControlAddress);

                    const result = await auditLogControlContract.connect(signer1).getLogs([fileAnaRita.ipfsCID]);
                    expect(result.success).to.equal(true);
                    expect(result.logs.length).to.equal(2); // It has the upload
                });
            });
            describe("and the user doesn't have share permissions", async function() {
                it("should NOT remove the relationship between the user and the file", async function(){
                    // Arrange
                    const { userRegisterContract, accessControl, userAnaPaula, userAnaRita, userAnaLuisa, fileAnaRita, signer1, signer2, signer3 } = await loadFixture(deployContractAndSetVariables);
                    const encSymmetricKey = "encSymmetricKeyFileAnaRita";
                    await userRegisterContract.connect(signer2).userRegistered(userAnaPaula); // Register the user
                    await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user
                    await userRegisterContract.connect(signer3).userRegistered(userAnaLuisa); // Register the user

                    await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita, encSymmetricKey); // Ana Rita owner of the file
                    await accessControl.connect(signer1).shareFile(userAnaPaula.account, fileAnaRita.ipfsCID, encSymmetricKey, ["download", "delete"]); // Ana Rita shares the fie with Ana Paula
                    await accessControl.connect(signer1).shareFile(userAnaLuisa.account, fileAnaRita.ipfsCID, encSymmetricKey, ["download"]); // Ana Rita shares the fie with Ana Paula

                    // Act
                    const tx = await accessControl.connect(signer2).removeUserFileAssociation(userAnaLuisa.account, fileAnaRita.ipfsCID);
                    await tx.wait();

                    // Assert
                    const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
                    expect(receipt.status).to.equal(1); // 1 = success

                    const isUserAssociatedAfterUpload = await accessControl.connect(signer3).userAssociatedWithFile(userAnaLuisa.account, fileAnaRita.ipfsCID); // Ana Luisa keeps on beeing associated 
                    expect(isUserAssociatedAfterUpload).to.equal(true);

                    const auditLogControlAddress = await accessControl.connect(signer1).getAuditLogControlAddress();
                    const auditLogControlContract = await ethers.getContractAt("AuditLogControl", auditLogControlAddress);

                    const result = await auditLogControlContract.connect(signer1).getLogs([fileAnaRita.ipfsCID]);
                    expect(result.success).to.equal(true);
                    expect(result.logs.length).to.equal(3); // It has the upload
                });
            });
            describe("and the file is not in the active state", async function() {
                it("should NOT remove the relationship between the user and the file", async function(){
                    // Arrange
                    const { userRegisterContract, accessControl, userAnaPaula, userAnaRita, fileAnaRita, signer1, signer2 } = await loadFixture(deployContractAndSetVariables);
                    const encSymmetricKey = "encSymmetricKeyFileAnaRita";
                    await userRegisterContract.connect(signer2).userRegistered(userAnaPaula); // Register the user
                    await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user

                    await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita, encSymmetricKey); // Ana Rita owner of the file
                    await accessControl.connect(signer1).shareFile(userAnaPaula.account, fileAnaRita.ipfsCID, encSymmetricKey, ["download", "delete"]); // Ana Rita shares the fie with Ana Paula
                    await accessControl.connect(signer1).deactivateFile(userAnaRita.account, fileAnaRita.ipfsCID);  // deactivates the file => puts the file in the deactive state

                    // Act
                    const tx = await accessControl.connect(signer1).removeUserFileAssociation(userAnaPaula.account, fileAnaRita.ipfsCID);
                    await tx.wait();

                    // Assert
                    const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
                    expect(receipt.status).to.equal(1); // 1 = success

                    const isUserAssociatedAfterUpload = await accessControl.connect(signer2).userAssociatedWithFile(userAnaPaula.account, fileAnaRita.ipfsCID);
                    expect(isUserAssociatedAfterUpload).to.equal(false); // it's false because the file is now deactivated

                    const auditLogControlAddress = await accessControl.connect(signer1).getAuditLogControlAddress();
                    const auditLogControlContract = await ethers.getContractAt("AuditLogControl", auditLogControlAddress);

                    const result = await auditLogControlContract.connect(signer1).getLogs([fileAnaRita.ipfsCID]);
                    expect(result.success).to.equal(true);
                    expect(result.logs.length).to.equal(3); // the transaction for removing permissions was not added
                });
            });
        });
        describe("when the transaction executer is the same as the user", async function(){
            it("should NOT remove the relationship between the user and the file", async function(){
                // Arrange
                const { userRegisterContract, accessControl, userAnaPaula, userAnaRita, fileAnaRita, signer1, signer2 } = await loadFixture(deployContractAndSetVariables);
                const encSymmetricKey = "encSymmetricKeyFileAnaRita";
                await userRegisterContract.connect(signer2).userRegistered(userAnaPaula); // Register the user
                await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user

                await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita, encSymmetricKey); // Ana Rita owner of the file

                // Act
                const tx = await accessControl.connect(signer1).removeUserFileAssociation(userAnaRita.account, fileAnaRita.ipfsCID);
                await tx.wait();

                // Assert
                const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
                expect(receipt.status).to.equal(1); // 1 = success

                const isUserAssociatedAfterUpload = await accessControl.connect(signer1).userAssociatedWithFile(userAnaRita.account, fileAnaRita.ipfsCID);
                expect(isUserAssociatedAfterUpload).to.equal(true);

                const auditLogControlAddress = await accessControl.connect(signer1).getAuditLogControlAddress();
                const auditLogControlContract = await ethers.getContractAt("AuditLogControl", auditLogControlAddress);

                const result = await auditLogControlContract.connect(signer1).getLogs([fileAnaRita.ipfsCID]);
                expect(result.success).to.equal(true);
                expect(result.logs.length).to.equal(1); 
            });
        });
    });

    describe("getEncSymmetricKeyFileUser", async function(){
        describe("when the transaction executer is the same as the user", async function(){
            describe("and the user is associated with the file, and the file is in the active state", async function(){
                it("should return true and the symmetric key", async function(){
                    // Arrange        
                    const { accessControl, userRegisterContract, fileAnaRita, userAnaRita, signer1 } = await loadFixture(deployContractAndSetVariables);
                    const encSymmetricKey = "encSymmetricKeyFileAnaRita";
                    await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user
                    await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita, encSymmetricKey); // Ana Rita owner of the file

                    // Act
                    const result = await accessControl.connect(signer1).getEncSymmetricKeyFileUser(userAnaRita.account, fileAnaRita.ipfsCID);

                    // Assert
                    expect(result.success).to.equal(true);
                    expect(result.resultString).to.equal(encSymmetricKey);
                });
            });
            describe("and the user is not associated with the file", async function(){
                it("should return false and an empty symmetric key", async function(){
                    // Arrange        
                    const { accessControl, userRegisterContract, userAnaRita, userAnaPaula, fileAnaRita, signer1, signer2 } = await loadFixture(deployContractAndSetVariables);
                    const encSymmetricKey = "encSymmetricKeyFileAnaRita";
                    await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user
                    await userRegisterContract.connect(signer2).userRegistered(userAnaPaula); // Register the user
                    await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita, encSymmetricKey); // Ana Rita owner of the file

                    // Act
                    const result = await accessControl.connect(signer2).getEncSymmetricKeyFileUser(userAnaPaula.account, fileAnaRita.ipfsCID);

                    // Assert
                    expect(result.success).to.equal(false);
                    expect(result.resultString).to.equal("");
                });
            });
            describe("and the file is not in the active state", async function(){
                // Arrange        
                const { accessControl, userRegisterContract, fileAnaRita, userAnaRita, signer1 } = await loadFixture(deployContractAndSetVariables);
                const encSymmetricKey = "encSymmetricKeyFileAnaRita";
                await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user
                await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita, encSymmetricKey); // Ana Rita owner of the file
                await accessControl.connect(signer1).deactivateFile(userAnaRita.account, fileAnaRita.ipfsCID);

                // Act
                const result = await accessControl.connect(signer1).getEncSymmetricKeyFileUser(userAnaRita.account, fileAnaRita.ipfsCID);

                // Assert
                expect(result.success).to.equal(false);
                expect(result.resultString).to.equal("");
            });
        });
        describe("when the transaction executer is not the same as the user", async function(){
            // Arrange        
            const { accessControl, userRegisterContract, userAnaRita, userAnaPaula, fileAnaRita, signer1, signer2 } = await loadFixture(deployContractAndSetVariables);
            const encSymmetricKey = "encSymmetricKeyFileAnaRita";
            await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user
            await userRegisterContract.connect(signer2).userRegistered(userAnaPaula); // Register the user
            await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita, encSymmetricKey); // Ana Rita owner of the file

            // Act
            const result = await accessControl.connect(signer2).getEncSymmetricKeyFileUser(userAnaRita.account, fileAnaRita.ipfsCID);

            // Assert
            expect(result.success).to.equal(false);
            expect(result.resultString).to.equal("");
        });
    });

    
    describe("getPermissionsOverFile", async function(){
        describe("when the user is associated with the file", async function(){
            describe("and the file is in the active state", async function(){
                it("should return the permissions a user has over a file", async function(){
                    // Arrange        
                    const { accessControl, userRegisterContract, userAnaRita, fileAnaRita, signer1 } = await loadFixture(deployContractAndSetVariables);
                    const encSymmetricKey = "encSymmetricKeyFileAnaRita";
                    await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user
                    await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita, encSymmetricKey); // Ana Rita owner of the file

                    // Act
                    const result = await accessControl.connect(signer1).getPermissionsOverFile(userAnaRita.account, fileAnaRita.ipfsCID);

                    // Assert
                    expect(result.success).to.equal(true);
                    expect(result.resultStrings).to.deep.equal(["share", "download", "delete", "edit"]);
                });
            });
            describe("and the file is not in the active state", async function(){
                it("should return false and an empty array", async function(){
                    // Arrange        
                    const { accessControl, userRegisterContract, userAnaRita, fileAnaRita, signer1 } = await loadFixture(deployContractAndSetVariables);
                    const encSymmetricKey = "encSymmetricKeyFileAnaRita";
                    await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user
                    await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita, encSymmetricKey); // Ana Rita owner of the file
                    await accessControl.connect(signer1).deactivateFile(userAnaRita.account, fileAnaRita.ipfsCID);

                    // Act
                    const result = await accessControl.connect(signer1).getPermissionsOverFile(userAnaRita.account, fileAnaRita.ipfsCID);

                    // Assert
                    expect(result.success).to.equal(false);
                    expect(result.resultStrings).to.deep.equal([]);
                });
            });
        });
        describe("when the user is not associated with the file", async function(){
            it("should return false and an empty array", async function(){
                // Arrange        
                const { accessControl, userRegisterContract, userAnaRita, userAnaPaula, fileAnaRita, signer1, signer2 } = await loadFixture(deployContractAndSetVariables);
                const encSymmetricKey = "encSymmetricKeyFileAnaRita";
                await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user
                await userRegisterContract.connect(signer2).userRegistered(userAnaPaula); // Register the user
                await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita, encSymmetricKey); // Ana Rita owner of the file

                // Act
                const result = await accessControl.connect(signer2).getPermissionsOverFile(userAnaPaula.account, fileAnaRita.ipfsCID);

                // Assert
                expect(result.success).to.equal(false);
                expect(result.resultStrings).to.deep.equal([]);
            });
        });
    });

    describe("getUsersWithDownloadPermissionsFile", async function(){
        describe("when the message sender is associated with the file", async function(){
            describe("and the file is in the active state", async function(){
                it("should return the users' addresses that are associated with download permissions", async function(){
                    // Arrange
                    const { accessControl, userRegisterContract, userAnaRita, userAnaPaula, fileAnaRita, signer1, signer2 } = await loadFixture(deployContractAndSetVariables);
                    const encSymmetricKey = "encSymmetricKeyFileAnaRita";
                    await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user
                    await userRegisterContract.connect(signer2).userRegistered(userAnaPaula); // Register the user
                    await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita, encSymmetricKey); // Ana Rita owner of the file
                    await accessControl.connect(signer1).shareFile(userAnaPaula.account, fileAnaRita.ipfsCID, encSymmetricKey, ["download", "delete"]); // Ana Rita shares the fie with Ana Paula

                    // Act
                    const result = await accessControl.connect(signer1).getUsersWithDownloadPermissionsFile(fileAnaRita);

                    // Assert
                    expect(result.success).to.equal(true);
                    expect(result.resultAddresses).to.deep.equal([userAnaRita.account, userAnaPaula.account]);
                });
            });
            describe("and the file is NOT in the active state", async function(){
                it("should ", async function(){
                    // Arrange
                    const { accessControl, userRegisterContract, userAnaRita, userAnaPaula, fileAnaRita, signer1, signer2 } = await loadFixture(deployContractAndSetVariables);
                    const encSymmetricKey = "encSymmetricKeyFileAnaRita";
                    await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user
                    await userRegisterContract.connect(signer2).userRegistered(userAnaPaula); // Register the user
                    await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita, encSymmetricKey); // Ana Rita owner of the file
                    await accessControl.connect(signer1).deactivateFile(userAnaRita.account, fileAnaRita.ipfsCID);  // deactivates the file => puts the file in the deactive state

                    // Act
                    const result = await accessControl.connect(signer1).getUsersWithDownloadPermissionsFile(fileAnaRita);

                    // Assert
                    expect(result.success).to.equal(false);
                    expect(result.resultAddresses).to.deep.equal([]);
                });
            });
        });
        describe("when the message sender is not associated with the file", async function(){
            it("should ", async function(){

            });
        });

    });

    describe("getUserFiles", async function(){
        describe("when the transaction executer is the same as the user", async function(){
            it("should return the files in the given state", async function(){
                // Arrange        
                const { userRegisterContract, accessControl, userAnaRita, userAnaPaula, fileAnaRita, fileAnaPaula, signer1, signer2 } = await loadFixture(deployContractAndSetVariables);
                const encSymmetricKeyAnaRita = "encSymmetricKeyFileAnaRita";
                const encSymmetricKeyAnaPaula = "encSymmetricKeyFileAnaPaula";

                    // Adiona users à lista de users
                await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user
                await userRegisterContract.connect(signer2).userRegistered(userAnaPaula); // Register the user
                
                    // User uploads files
                await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita, encSymmetricKeyAnaRita); // Ana Rita owner of the file
                await accessControl.connect(signer2).uploadFile(userAnaPaula.account, fileAnaPaula, encSymmetricKeyAnaPaula); // Ana Rita owner of the file

                // Act
                const result = await accessControl.connect(signer1).getUserFiles(userAnaRita.account, "active");

                // Assert
                expect(result.success).to.equal(true);
                expect(result.files[0].ipfsCID).to.equal(fileAnaRita.ipfsCID);
                expect(result.files.length).to.equal(1);
            });
            it("should return the files in the active, deactive, and edited state when given an empty state", async function(){
                // Arrange        
                const { userRegisterContract, accessControl, userAnaRita, userAnaPaula, fileAnaRita, fileAnaPaula, signer1, signer2 } = await loadFixture(deployContractAndSetVariables);
                const encSymmetricKeyAnaRita = "encSymmetricKeyFileAnaRita";
                const encSymmetricKeyAnaPaula = "encSymmetricKeyFileAnaPaula";

                    // Adiona users à lista de users
                await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user
                await userRegisterContract.connect(signer2).userRegistered(userAnaPaula); // Register the user
            

                    // User uploads files
                await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita, encSymmetricKeyAnaRita); // Ana Rita owner of the file
                await accessControl.connect(signer2).uploadFile(userAnaPaula.account, fileAnaPaula, encSymmetricKeyAnaPaula); // Ana Rita owner of the file
            
                    // User deactivates files
                await accessControl.connect(signer1).deactivateFile(userAnaRita.account, fileAnaRita.ipfsCID);

                // Act
                const result = await accessControl.connect(signer1).getUserFiles(userAnaRita.account, "");
                
                // Assert
                expect(result.success).to.equal(true);
                expect(result.files[0].ipfsCID).to.equal(fileAnaRita.ipfsCID);
                expect(result.files.length).to.equal(1); // It only updated the field
            });
        });
        describe("when the transaction executer is not the same as the user", async function(){
            it("should NOT return the files in the given state", async function(){
                // Arrange        
                const { userRegisterContract, accessControl, userAnaRita, userAnaPaula, fileAnaRita, fileAnaPaula, signer1, signer2 } = await loadFixture(deployContractAndSetVariables);
                const encSymmetricKeyAnaRita = "encSymmetricKeyFileAnaRita";
                const encSymmetricKeyAnaPaula = "encSymmetricKeyFileAnaPaula";

                    // Adiona users à lista de users
                await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user
                await userRegisterContract.connect(signer2).userRegistered(userAnaPaula); // Register the user


                    // User uploads files
                await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita, encSymmetricKeyAnaRita); // Ana Rita owner of the file
                await accessControl.connect(signer2).uploadFile(userAnaPaula.account, fileAnaPaula, encSymmetricKeyAnaPaula); // Ana Rita owner of the file

                // Act - trying to get the userAnaPaula files
                const result = await accessControl.connect(signer1).getUserFiles(userAnaPaula.account, "");

                // Assert
                expect(result.success).to.equal(false);
                expect(result.files.length).to.equal(0);
            });
        });
    });

    describe("userHasPermissionOverFile", async function(){
        desccribe("when the file is in the active state", async function(){
            desccribe("and the user has the given permissions over the file", async function(){
                it("should return true", async function(){
                    // Arrange
                    const { accessControl, userRegisterContract, fileAnaRita, userAnaRita, signer1 } = await loadFixture(deployContractAndSetVariables);   
                    const encSymmetricKey = "encSymmetricKeyFileAnaRita";
                    await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user
                    await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita, encSymmetricKey); // Ana Rita owner of the file
                            
                    // Act 
                    const result = await accessControl.connect(signer1).userHasPermissionOverFile(userAnaRita.account, fileAnaRita.ipfsCID, "delete");

                    // Assert 
                    expect(result).to.equal(true);
                });
            });
            describe("and the user doesn't have the given permissions over the file", async function(){
                it("should return false", async function(){
                    // Arrange
                    const { accessControl, userRegisterContract, fileAnaRita, userAnaPaula, userAnaRita, userAnaLuisa, signer1, signer2, signer3 } = await loadFixture(deployContractAndSetVariables);   
                    const encSymmetricKey = "encSymmetricKeyFileAnaRita";
                    await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user
                    await userRegisterContract.connect(signer2).userRegistered(userAnaPaula); // Register the user
                    await userRegisterContract.connect(signer3).userRegistered(userAnaLuisa); // Register the user
                    await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita, encSymmetricKey); // Ana Rita owner of the file
                    await accessControl.connect(signer1).shareFile(userAnaPaula.account, fileAnaRita.ipfsCID, encSymmetricKey, ["delete"]);

                    // Act 
                    const result = await accessControl.connect(signer1).userHasPermissionOverFile(userAnaPaula.account, fileAnaRita.ipfsCID, "share");

                    // Assert 
                    expect(result).to.equal(false);
                });
            });
        });
        describe("when the file is in the deactive state", async function(){
            it("should return false", async function(){
                // Arrange
                const { accessControl, userRegisterContract, fileAnaRita, userAnaRita, signer1 } = await loadFixture(deployContractAndSetVariables);   
                const encSymmetricKey = "encSymmetricKeyFileAnaRita";
                await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user
                await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita, encSymmetricKey); // Ana Rita owner of the file
                await accessControl.connect(signer1).deactivateFile(userAnaRita.account, fileAnaRita.ipfsCID);        

                // Act 
                const result = await accessControl.connect(signer1).userHasPermissionOverFile(userAnaRita.account, fileAnaRita.ipfsCID, "delete");

                // Assert 
                expect(result).to.equal(false);
            });
        });
    });

    describe("userAssociatedWithFile", async function(){
        desccribe("when the transaction executer is already associated with the file", async function(){
            describe("and the user is associates with the file", async function(){
                it("should return true", async function(){
                    // Arrange        
                    const { accessControl, userRegisterContract, userAnaRita, fileAnaRita, signer1 } = await loadFixture(deployContractAndSetVariables);
                    const encSymmetricKey = "encSymmetricKeyFileAnaRita";
                    await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user
                    await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita, encSymmetricKey); // Ana Rita owner of the file

                    // Act
                    const result = await accessControl.connect(signer1).userAssociatedWithFile(userAnaRita.account, fileAnaRita.ipfsCID);        

                    // Assert
                    expect(result).to.equal(true);
                });
            });
            describe("and the user is not associates with the file", async function(){
                it("should return false", async function(){
                    // Arrange        
                    const { accessControl, userRegisterContract, userAnaRita, userAnaPaula, fileAnaRita, signer1, signer2} = await loadFixture(deployContractAndSetVariables);
                    const encSymmetricKey = "encSymmetricKeyFileAnaRita";
                    await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user
                    await userRegisterContract.connect(signer2).userRegistered(userAnaPaula); // Register the user
                    await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita, encSymmetricKey); // Ana Rita owner of the file

                    // Act
                    const result = await accessControl.connect(signer1).userAssociatedWithFile(userAnaPaula.account, fileAnaRita.ipfsCID);        

                    // Assert
                    expect(result).to.equal(false);
                });
            }); 
        });
        describe("when the transaction executer is NOT associated with the file", async function(){
            it("should return false", async function(){
                // Arrange        
                const { accessControl, userRegisterContract, userAnaRita, userAnaPaula, fileAnaRita, signer1, signer2} = await loadFixture(deployContractAndSetVariables);
                const encSymmetricKey = "encSymmetricKeyFileAnaRita";
                await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user
                await userRegisterContract.connect(signer2).userRegistered(userAnaPaula); // Register the user
                await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita, encSymmetricKey); // Ana Rita owner of the file

                // Act
                const result = await accessControl.connect(signer2).userAssociatedWithFile(userAnaRita.account, fileAnaRita.ipfsCID);        

                // Assert
                expect(result).to.equal(false);
            });
        });
    });
    
    // Already tests the method: "getIpfsCIDsByName()" of the FileRegister.sol
    describe("userAssociatedWithFileName", async function(){
        describe("when the user is associated with the a file with the given name", async function(){
            it("should return true", async function(){
                // Arrange
                const { accessControl, userRegisterContract, userAnaRita, fileAnaRita, signer1} = await loadFixture(deployContractAndSetVariables);
                const encSymmetricKey = "encSymmetricKeyFileAnaRita";
                await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user
                await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita, encSymmetricKey); // Ana Rita owner of the file

                // Act
                const result = await accessControl.connect(signer1).userAssociatedWithFileName(userAnaRita.account, "file1.jpg");        

                // Assert
                expect(result).to.equal(true);
            });
        });
        describe("when the user is not associated with the a file with the given name", async function(){
            it("should return false", async function(){
                // Arrange
                const { accessControl, userRegisterContract, userAnaRita, fileAnaRita, signer1} = await loadFixture(deployContractAndSetVariables);
                const encSymmetricKey = "encSymmetricKeyFileAnaRita";
                await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user
                await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita, encSymmetricKey); // Ana Rita owner of the file

                // Act
                const result = await accessControl.connect(signer1).userAssociatedWithFileName(userAnaRita.account, "file12.jpg");        

                // Assert
                expect(result).to.equal(false);
            });
        });
    });

    describe("verifyValidFile", async function(){
        describe("when the user has a file", async function(){
            describe("and the file is in the active state, and with the same file hash", async function(){
                it("should return true", async function(){
                    // Arrange
                    const { accessControl, userRegisterContract, userAnaRita, fileAnaRita, signer1} = await loadFixture(deployContractAndSetVariables);
                    const encSymmetricKey = "encSymmetricKeyFileAnaRita";
                    await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user
                    await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita, encSymmetricKey); // Ana Rita owner of the file

                    // Act
                    const result = await accessControl.connect(signer1).verifyValidFile(userAnaRita.account, fileAnaRita.fileHash);

                    // Assert
                    expect(result).to.equal(true);
                });
            });
            describe("and the file is not in the acitve state", async function(){
                it("should return false", async function(){
                    // Arrange
                    const { accessControl, userRegisterContract, userAnaRita, fileAnaRita, signer1} = await loadFixture(deployContractAndSetVariables);
                    const encSymmetricKey = "encSymmetricKeyFileAnaRita";
                    await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user
                    await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita, encSymmetricKey); // Ana Rita owner of the file
                    await accessControl.connect(signer1).deactivateFile(userAnaRita.account, fileAnaRita.ipfsCID);       // file is now in the deactive state 

                    // Act
                    const result = await accessControl.connect(signer1).verifyValidFile(userAnaRita.account, fileAnaRita.fileHash);

                    // Assert
                    expect(result).to.equal(false);
                });
            });
            describe("and the file doesn't have the same file hash", async function(){
                it("should return false", async function(){
                    // Arrange
                    const { accessControl, userRegisterContract, userAnaRita, fileAnaRita, fileAnaPaula, signer1} = await loadFixture(deployContractAndSetVariables);
                    const encSymmetricKey = "encSymmetricKeyFileAnaRita";
                    await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user
                    await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita, encSymmetricKey); // Ana Rita owner of the file
                    await accessControl.connect(signer1).editFile(fileAnaRita, fileAnaPaula, [userAnaRita.account], [encSymmetricKey]);

                    // Act
                    const result = await accessControl.connect(signer1).verifyValidFile(userAnaRita.account, fileAnaRita.fileHash);

                    // Assert
                    expect(result).to.equal(false); // false because in the active state is now the fileAnaPaula
                });
            });
        });
        describe("when a user doesn't have a file", async function(){
            it("should return false ", async function(){
                // Arrange
                const { accessControl, userRegisterContract, userAnaRita, fileAnaRita, fileAnaPaula, signer1} = await loadFixture(deployContractAndSetVariables);
                const encSymmetricKey = "encSymmetricKeyFileAnaRita";
                await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user
                await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita, encSymmetricKey); // Ana Rita owner of the file

                // Act
                const result = await accessControl.connect(signer1).verifyValidFile(userAnaRita.account, fileAnaPaula.fileHash);

                // Assert
                expect(result).to.equal(false);
            });
        });
    });

    describe("getAuditLogControlAddress", async function(){
        it("should return the address of the AuditLogControl contract", async function(){
            // Arrange
            const { accessControl } = await loadFixture(deployContractAndSetVariables);   
            
            // Act
            const auditLogControlAddress  = await accessControl.getAuditLogControlAddress();
    
            // Assert
            expect(auditLogControlAddress).to.not.equal("0x0000000000000000000000000000000000000000");
        });
    });

    describe("getFileRegisterAddress", async function(){
        it("should return the address of the FileRegister contract", async function(){
            // Arrange
            const { accessControl } = await loadFixture(deployContractAndSetVariables);   
                                    
            // Act
            const fileRegisterAddress  = await accessControl.getFileRegisterAddress();

            // Assert
            expect(fileRegisterAddress).to.not.equal("0x0000000000000000000000000000000000000000");
        });
    });

    describe("getUserRegisterAddress", async function(){
        it("should return the address of the UserRegister contract", async function(){
            // Arrange
            const { accessControl } = await loadFixture(deployContractAndSetVariables);   
                                    
            // Act
            const userRegisterAddress  = await accessControl.getUserRegisterAddress();

            // Assert
            expect(userRegisterAddress).to.not.equal("0x0000000000000000000000000000000000000000");
        });
    });
});