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

        const userHasFileList = [
            {
                userAccount: "0x9c852118294e51e653712a81e05800f419141756",
                ipfsCID: "yourIpfsCID1",
                encSymmetricKey: "yourEncSymmetricKey1",
                permissions: ["download", "delete", "share"]
            },
            {
                userAccount: "0x9c852118294e51e653712a81e05800f419141123",
                ipfsCID: "yourIpfsCID2",
                encSymmetricKey: "yourEncSymmetricKey2",
                permissions: ["download", "delete", "share"]
            }
        ];

        return { accessControl, userHasFileList };
    }

    it("Should return true when the account input is the same as the list", async function() {
        // Arrange
        const { accessControl, userHasFileList } = await loadFixture(deployContractAndSetVariables);
        const userHasFile = {
            userAccount: "0x9c852118294e51e653712a81e05800f419141756",
            ipfsCID: "yourIpfsCID1",
            encSymmetricKey: "yourEncSymmetricKey1",
            permissions: ["download", "delete", "share"]
        }

        // Act
        const result = await accessControl.isKeyEqual(
            userHasFile.userAccount, 
            userHasFileList[0].userAccount,
            userHasFile.ipfsCID,
            userHasFileList[0].ipfsCID);
        
        // Assert
        expect(result).to.equal(true);
    });

    it("Should return false when the account input is not the same as the one in the list", async function() {
        // Arrange     
        const { accessControl, userHasFileList } = await loadFixture(deployContractAndSetVariables);        
        const userHasFile = {
            userAccount: "0x9c852118294e51e653712a81e05800f419141987", 
            ipfsCID: "yourIpfsCID3",
            encSymmetricKey: "yourEncSymmetricKey3",
            permissions: ["download", "delete", ""]
        }

        // Act
        const result = await accessControl.isKeyEqual(
            userHasFile.userAccount, 
            userHasFileList[0].userAccount,
            userHasFile.ipfsCID,
            userHasFileList[0].ipfsCID);

        // Assert
        expect(result).to.equal(false);
    });

    it("Should return true if the user is already associated with the file", async function() {
        // Arrange        
        

        // Act
        userAssociatedWithFile();        

        // Assert
    });

    it("Should return false if the user is not associated with the file", async function() {
        // Arrange        
        

        // Act
        userAssociatedWithFile();

        // Assert
    });

    it("Should return success=true and the users' files, if the user has files", async function() {
        // Arrange        
        

        // Act
        getUserFiles();

        // Assert
    });

    it("Should return success=false and no users' files, if the user doesn't have files", async function() {
        // Arrange        
        

        // Act
        getUserFiles();

        // Assert
    });

    it("Should get success=true and the users' permission over a file, if the user has the file", async function() {
        // Arrange        
        

        // Act
        getPermissionsOverFile();

        // Assert
    });

    it("Should get success=false and no users' permission over a file, if the user doesn't have the file", async function() {
        // Arrange        
        

        // Act
        getPermissionsOverFile();

        // Assert
    });


    it("Should get success=true and the users' encrypted symmetric key, if the user has the file", async function() {
        // Arrange        
        

        // Act
        getEncSymmetricKeyFileUser();

        // Assert
    });

    it("Should get success=false and no users' encrypted symmetric key, if the user doesn't have the file", async function() {
        // Arrange        
        

        // Act
        getEncSymmetricKeyFileUser();

        // Assert
    });

    it("Should update the users' file permissions if the user has the file", async function() {
        // Arrange        
        

        // Act
        updateUserFilePermissions();

        // Assert
    });

    it("Shouldn't update the users' file permissions if the user doesn't have the file", async function() {
        // Arrange        
        

        // Act
        updateUserFilePermissions();

        // Assert
    });

    it("Should associate a user to a file giver certain permissions, if the user is not already associated", async function() {
        // Arrange        
        

        // Act
        shareFile();

        // Assert
    });

    it("Should not associate a user to a file if the user is already associated to it", async function() {
        // Arrange        
        

        // Act
        shareFile();

        // Assert
    });

    it("Should associate a file to the user and add the file, if the user is already associated to it.", async function() {
        // Arrange        
        

        // Act
        uploadFile();

        // Assert
    });

    it("Shouldn't associate a file to the user and add the file, if the user is not already associated to it.", async function() {
        // Arrange        
        

        // Act
        uploadFile();

        // Assert
    });

    it("Should associate a user with a file", async function() {
        // Arrange        
        

        // Act
        addUserHasFile();

        // Assert
    });

});