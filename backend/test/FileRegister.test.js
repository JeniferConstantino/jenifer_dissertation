const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");

/*describe("FileRegister", function () {

    // Like a BeforeEach
    async function deployContractAndSetVariables() {
        const FileRegister = await ethers.getContractFactory("FileRegister");
        const fileRegister = await FileRegister.deploy();

        let file = {
            ipfsCID: "asdwfftg",        
            fileName: "nameFile.jpg",          
            owner: "0x7c852118294e51e653712a81e05800f419141751",             
            fileType: "image",           
            iv: "asdddww",  
        };

        return { fileRegister, file };
    }

    it("Should add a file", async function() {
        // Arrange
        const { fileRegister, file } = await loadFixture(deployContractAndSetVariables);        

        // Act
        const tx = await fileRegister.addFile(file);
        await tx.wait();
        
        // Assert
        const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
        expect(receipt.status).to.equal(1); // 1 = success

        const result = await fileRegister.getFileByIpfsCID(file.ipfsCID);
        expect(result.success).to.equal(true);        
    });

    it("Should get a file if the files' CID exists", async function() {
        // Arrange
        const { fileRegister, file } = await loadFixture(deployContractAndSetVariables);        
        const tx = await fileRegister.addFile(file);
        await tx.wait();

        // Act
        const result = await fileRegister.getFileByIpfsCID(file.ipfsCID);
        
        // Assert
        expect(result.success).to.equal(true);
        expect(result.file.ipfsCID.toLowerCase()).to.equal(file.ipfsCID);
        expect(result.file.fileName).to.equal(file.fileName);
        expect(result.file.owner.toLowerCase()).to.equal(file.owner.toLowerCase());
        expect(result.file.fileType).to.equal(file.fileType);
        expect(result.file.iv).to.equal(file.iv);              
    });

    it("Shouldn't get a file if the files' CID doesn't exist", async function() {
        // Arrange
        const { fileRegister, file } = await loadFixture(deployContractAndSetVariables);   

        // Act
        const result = await fileRegister.getFileByIpfsCID(file.ipfsCID);
        
        // Assert
        expect(result.success).to.equal(false);
        expect(result.file.ipfsCID.toLowerCase()).to.equal('');
        expect(result.file.fileName).to.equal('');
        expect(result.file.owner).to.equal('0x0000000000000000000000000000000000000000');
        expect(result.file.fileType).to.equal('');
        expect(result.file.iv).to.equal('');              
    });

});*/