/*const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");

describe("UserManager", function () {

    // Like a BeforeEach
    async function deployContractAdSetVariables() {
        const TryingTest = await ethers.getContractFactory("TryingTest");
        const tryingTest = await TryingTest.deploy();

        return { tryingTest };
    }

    // Stores a user in the blockchain and then gets the user from it
    it("Should get jenifer", async function() {
        // Arrange
        const { tryingTest } = await loadFixture(deployContractAdSetVariables);        

        // Act
        const address = "0x7c852118294e51e653712a81e05800f419141751";
        await tryingTest.existingUserName(address);
        const userRes = await tryingTest.getNum(address); // Access the mapping directly

        console.log("userRes: ", userRes);
        // Assert
        expect(userRes.userName).to.equal("Joao");
    });

});*/