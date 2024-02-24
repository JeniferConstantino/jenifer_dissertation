const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");

describe("AccessControl", function () {

    // Like a BeforeEach
    async function deployContractAndSetVariables() {
        const FileRegister = await ethers.getContractFactory("FileRegister");
        let fileRegisterContract = await FileRegister.deploy().catch(error => {
            console.error("Error deploying FileRegister: ", error);
            process.exit(1);
        });  
        
        const AccessControl = await ethers.getContractFactory("AccessControl");
        const accessControl = await AccessControl.deploy(fileRegisterContract.target);

        const file = {
            ipfsCID: "yourIpfsCID1",        
            fileName: "nameFile.jpg",          
            owner: "0x7c852118294e51e653712a81e05800f419141751",             
            fileType: "image",           
            iv: "asdddww",  
        };

        const file2 = {
            ipfsCID: "yourIpfsCID2",        
            fileName: "nameFile.jpg",          
            owner: "0x7c852118294e51e653712a81e05800f419141751",             
            fileType: "image",           
            iv: "asdddww",  
        };

        const file3 = {
            ipfsCID: "yourIpfsCID3",        
            fileName: "nameFile.jpg",          
            owner: "0x9c845678294e51e653712a81e05800f419141756",             
            fileType: "image",           
            iv: "asdddww",  
        };

        let userAnaRita = {
            account: "0x9c852118294e51e653712a81e05800f419141756",
            userName: "Ana Rita",
            publicKey: "asd",
            privateKey: "qwe"
        };

        let userAna = {
            account: "0x9c845678294e51e653712a81e05800f419141756",
            userName: "Ana",
            publicKey: "asdpp",
            privateKey: "qwepp"
        };

        return { fileRegisterContract, accessControl, file, file2, file3, userAnaRita, userAna};
    }

    it("Should associate a user with a file", async function() {
        // Arrange        
        const { accessControl, userAnaRita, file } = await loadFixture(deployContractAndSetVariables);

        // Act
        const tx = await accessControl.addUserHasFile(userAnaRita, file, "yourEncSymmetricKey3", ["download", "delete"]);        
        await tx.wait();

        // Assert
        const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
        expect(receipt.status).to.equal(1); // 1 = success

        var result = await accessControl.getPermissionsOverFile(userAnaRita, file);
        expect(result.success).to.equal(true);       
        expect(result.permissions).to.deep.equal(["download", "delete"]);

        result = await accessControl.getEncSymmetricKeyFileUser(userAnaRita, file);
        expect(result.success).to.equal(true);
        expect(result.encSymmetricKey).to.equal("yourEncSymmetricKey3");

    });

    /*it("Should return true when the account input is the same as the list", async function() {
        // Arrange
        const { accessControl, userAnaRita, file } = await loadFixture(deployContractAndSetVariables);
        const userHasFileList = [
            {
                userAccount: "0x9c852118294e51e653712a81e05800f419141756",
                ipfsCID: "yourIpfsCID1",
                encSymmetricKey: "yourEncSymmetricKey1",
                permissions: ["download", "delete", "share"]
            }
        ];

        // Act
        const result = await accessControl.isKeyEqual(
            userAnaRita.account, 
            userHasFileList[0].userAccount,
            file.ipfsCID,
            userHasFileList[0].ipfsCID);
        
        // Assert
        expect(result).to.equal(true);
    });

    it("Should return false when the account input is not the same as the one in the list", async function() {
        // Arrange     
        const { accessControl, userAnaRita, file } = await loadFixture(deployContractAndSetVariables);   
        const userHasFileList = [
            {
                userAccount: "0x9c123418294e51e653712a81e05800f419141756",
                ipfsCID: "yourIpfsCID1",
                encSymmetricKey: "yourEncSymmetricKey1",
                permissions: ["download", "delete", "share"]
            }
        ];
        // Act
        const result = await accessControl.isKeyEqual(
            userAnaRita.account, 
            userHasFileList[0].userAccount,
            file.ipfsCID,
            userHasFileList[0].ipfsCID);

        // Assert
        expect(result).to.equal(false);
    });

    it("Should return true if the user is already associated with the file", async function() {
        // Arrange        
        const { accessControl, userAnaRita, file } = await loadFixture(deployContractAndSetVariables);        
        await accessControl.addUserHasFile(userAnaRita, file, "yourEncSymmetricKey2", ["download", "delete", "share"]);

        // Act
        const result = await accessControl.userAssociatedWithFile(userAnaRita, file);        

        // Assert
        expect(result).to.equal(true);
    });

    it("Should return false if the user is not associated with the file", async function() {
        // Arrange        
        const { accessControl, userAnaRita, file } = await loadFixture(deployContractAndSetVariables);        
        
        // Act
        const result = await accessControl.userAssociatedWithFile(userAnaRita, file);        

        // Assert
        expect(result).to.equal(false);
    });

    it("Should return success=true and the users' files, if the user is associated to files", async function() {
        // Arrange        
        const { fileRegisterContract, accessControl, userAnaRita, userAna, file, file2, file3 } = await loadFixture(deployContractAndSetVariables);
            // Adicionar os files à lista de files
        fileRegisterContract.addFile(file);
        fileRegisterContract.addFile(file2);
        fileRegisterContract.addFile(file3);

            // Associar files ao user
        await accessControl.addUserHasFile(userAnaRita, file, "yourEncSymmetricKey2", ["download", "delete", "share"]);
        await accessControl.addUserHasFile(userAnaRita, file2, "yourEncSymmetricKey3", ["download", "delete", ""]);
        await accessControl.addUserHasFile(userAna, file3, "yourEncSymmetricKey4", ["download", "delete", "share"]);

        // Act
        const result = await accessControl.getUserFiles(userAnaRita.account);
        
        // Assert
        expect(result.success).to.equal(true);
        expect(result.files[0].ipfsCID).to.equal(file.ipfsCID);
        expect(result.files[1].ipfsCID).to.equal(file2.ipfsCID);
        expect(result.files.length).to.equal(2);
    });

    it("Should return success=false and no users' files, if the user doesn't have files", async function() {
        // Arrange        
        const { accessControl, userAnaRita } = await loadFixture(deployContractAndSetVariables);

        // Act
        const result = await accessControl.getUserFiles(userAnaRita.account);
        
        // Assert
        expect(result.success).to.equal(false);
        expect(result.files.length).to.equal(0);
    });

    it("Should get success=true and the users' permission over a file, if the user has the file", async function() {
        // Arrange        
        const { accessControl, userAnaRita, file } = await loadFixture(deployContractAndSetVariables);
        await accessControl.addUserHasFile(userAnaRita, file, "yourEncSymmetricKey2", ["download", "delete", "share"]);

        // Act
        const result = await accessControl.getPermissionsOverFile(userAnaRita, file);

        // Assert
        expect(result.success).to.equal(true);
        expect(result.permissions).to.deep.equal(["download", "delete", "share"]);
    });

    it("Should get success=false and no users' permission over a file, if the user doesn't have the file", async function() {
        // Arrange        
        const { accessControl, userAnaRita, file } = await loadFixture(deployContractAndSetVariables);

        // Act
        const result = await accessControl.getPermissionsOverFile(userAnaRita, file);

        // Assert
        expect(result.success).to.equal(false);
        expect(result.permissions).to.deep.equal([]);
    });

    it("Should get success=true and the users' encrypted symmetric key, if the user has the file", async function() {
        // Arrange        
        const { accessControl, userAnaRita, file } = await loadFixture(deployContractAndSetVariables);
        await accessControl.addUserHasFile(userAnaRita, file, "yourEncSymmetricKey2", ["download", "delete", "share"]);
        
        // Act
        const result = await accessControl.getEncSymmetricKeyFileUser(userAnaRita, file);

        // Assert
        expect(result.success).to.equal(true);
        expect(result.encSymmetricKey).to.equal("yourEncSymmetricKey2");
    });

    it("Should get success=false and no users' encrypted symmetric key, if the user doesn't have the file", async function() {
        // Arrange        
        const { accessControl, userAnaRita, file } = await loadFixture(deployContractAndSetVariables);
        
        // Act
        const result = await accessControl.getEncSymmetricKeyFileUser(userAnaRita, file);

        // Assert
        expect(result.success).to.equal(false);
        expect(result.encSymmetricKey).to.equal("");
    });

    it("Should update the users' file permissions if the user has the file", async function() {
        // Arrange        
        const { accessControl, userAnaRita, file } = await loadFixture(deployContractAndSetVariables);
        await accessControl.addUserHasFile(userAnaRita, file, "yourEncSymmetricKey2", ["download", "delete", "share"]);
        
        // Act
        const tx = await accessControl.updateUserFilePermissions(userAnaRita, file, ["download", "delete"]);
        await tx.wait();

        // Assert
        const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
        expect(receipt.status).to.equal(1); // 1 = success

        const result = await accessControl.getPermissionsOverFile(userAnaRita, file);
        expect(result.success).to.equal(true);       
        expect(result.permissions).to.deep.equal(["download", "delete"]);
    });       

    it("Shouldn't update the users' file permissions if the user doesn't have the file", async function() {
        // Arrange        
        const { accessControl, userAnaRita, file } = await loadFixture(deployContractAndSetVariables);
        
        // Act
        const tx = await accessControl.updateUserFilePermissions(userAnaRita, file, ["download", "delete"]);
        await tx.wait();

        // Assert
        const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
        expect(receipt.status).to.equal(1); // 1 = success

        const result = await accessControl.getPermissionsOverFile(userAnaRita, file);
        expect(result.success).to.equal(false);       
        expect(result.permissions).to.deep.equal([]);
    });*/

});