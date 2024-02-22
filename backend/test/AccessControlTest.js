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

});