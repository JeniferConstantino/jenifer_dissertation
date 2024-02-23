const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");

describe("FileRegister", function () {

    // Like a BeforeEach
    async function deployContractAndSetVariables() {
        const FileRegister = await ethers.getContractFactory("FileRegister");
        const fileRegister = await FileRegister.deploy();

        const [signer1, signer2] = await ethers.getSigners(); // Get the first signer 

        let file = {
            ipfsCID: "youripfscid",        
            fileName: "nameFile.jpg",          
            owner: await signer1.getAddress(),             
            fileType: "image",           
            iv: "yourIv_1",  
        };

        return { fileRegister, file, signer1, signer2 };
    }

    it("Should add a file", async function() {
        // Arrange
        const { fileRegister, file, signer1 } = await loadFixture(deployContractAndSetVariables);        

        // Act
        const tx = await fileRegister.connect(signer1).addFile(file);
        await tx.wait();
        
        // Assert
        const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
        expect(receipt.status).to.equal(1); // 1 = success

        const result = await fileRegister.connect(signer1).getFileByIpfsCID(file.ipfsCID);
        expect(result.success).to.equal(true);      
        expect(result.file.ipfsCID).to.equal(file.ipfsCID);    
        expect(result.file.fileName).to.equal(file.fileName);    
        expect(result.file.owner).to.equal(file.owner);    
        expect(result.file.fileType).to.equal(file.fileType);    
        expect(result.file.iv).to.equal(file.iv);    
    });

    it("Shouldn't add a file if the transaction executer is not the file owner", async function(){
        // Arrange
        const { fileRegister, file, signer2 } = await loadFixture(deployContractAndSetVariables);        

        // Act
        const tx = await fileRegister.connect(signer2).addFile(file);
        await tx.wait();

        // Assert
        const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
        expect(receipt.status).to.equal(1); // 1 = success

        const result = await fileRegister.connect(signer2).getFileByIpfsCID(file.ipfsCID);
        expect(result.success).to.equal(false);      
        expect(result.file.ipfsCID).to.equal("");    
        expect(result.file.fileName).to.equal("");    
        expect(result.file.owner).to.equal("0x0000000000000000000000000000000000000000");    
        expect(result.file.fileType).to.equal("");    
        expect(result.file.iv).to.equal("");   
    });

    it("Should get a file if the files' CID exists", async function() {
        // Arrange
        const { fileRegister, file, signer1 } = await loadFixture(deployContractAndSetVariables);        
        const tx = await fileRegister.connect(signer1).addFile(file);
        await tx.wait();

        // Act
        const result = await fileRegister.connect(signer1).getFileByIpfsCID(file.ipfsCID);
        
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
        const { fileRegister, file, signer1 } = await loadFixture(deployContractAndSetVariables);   

        // Act
        const result = await fileRegister.connect(signer1).getFileByIpfsCID(file.ipfsCID);
        
        // Assert
        expect(result.success).to.equal(false);
        expect(result.file.ipfsCID.toLowerCase()).to.equal('');
        expect(result.file.fileName).to.equal('');
        expect(result.file.owner).to.equal('0x0000000000000000000000000000000000000000');
        expect(result.file.fileType).to.equal('');
        expect(result.file.iv).to.equal('');              
    });

    it("Should return true if the file doesn't exist, the file parametrs are valid, and the transaction executer is the owner of the file", async function() {
        // Arrange
        const { fileRegister, file, signer1 } = await loadFixture(deployContractAndSetVariables);   

        // Act
        const result = await fileRegister.connect(signer1).canAddFile(file);

        // Assert
        expect(result).to.equal(true);
    });

    it("Should return false if the file already exist", async function() {
        // Arrange
        const { fileRegister, file, signer1 } = await loadFixture(deployContractAndSetVariables);   
        await fileRegister.connect(signer1).addFile(file);

        // Act
        const result = await fileRegister.connect(signer1).canAddFile(file);

        // Assert
        expect(result).to.equal(false);
    });

    it("Should return false if file parametrs aren't valid", async function() {
        // Arrange
        const { fileRegister, signer1 } = await loadFixture(deployContractAndSetVariables); 
        let invalidFile = {
            ipfsCID: "",    // invalid ipfsCID    
            fileName: "nameFile.jpg",          
            owner: await signer1.getAddress(),             
            fileType: "image",           
            iv: "yourIv_1",  
        };

        // Act
        const result = await fileRegister.connect(signer1).canAddFile(invalidFile);

        // Assert
        expect(result).to.equal(false);
    });

    it("Should return false if the transaction executer is not the owner of the file", async function() {
        // Arrange
        const { fileRegister, file, signer2 } = await loadFixture(deployContractAndSetVariables);   

        // Act
        const result = await fileRegister.connect(signer2).canAddFile(file);

        // Assert
        expect(result).to.equal(false);
    });

    it("Should return true if the file already exists", async function() {
        // Arrange
        const { fileRegister, file, signer1 } = await loadFixture(deployContractAndSetVariables);   
        await fileRegister.connect(signer1).addFile(file);

        // Act
        const result = await fileRegister.connect(signer1).fileExists(file.ipfsCID);

        // Assert
        expect(result).to.equal(true);
    });

    it("Should return false if the file doesn't exist", async function() {
        // Arrange
        const { fileRegister, file, signer1 } = await loadFixture(deployContractAndSetVariables);   

        // Act
        const result = await fileRegister.connect(signer1).fileExists(file.ipfsCID);

        // Assert
        expect(result).to.equal(false);
    });

    it("Should return true if the file parameters are valid", async function() {
        // Arrange
        const { fileRegister, signer1, file } = await loadFixture(deployContractAndSetVariables); 

        // Act
        const result = await fileRegister.connect(signer1).canAddFile(file);

        // Assert
        expect(result).to.equal(true);
    });

    it("Should return false if the file parameters are invalid", async function() {
        // Arrange
        const { fileRegister, signer1 } = await loadFixture(deployContractAndSetVariables); 
        let invalidFile = {
            ipfsCID: "",    // invalid ipfsCID    
            fileName: "nameFile.jpg",          
            owner: await signer1.getAddress(),             
            fileType: "image",           
            iv: "yourIv_1",  
        };

        // Act
        const result = await fileRegister.connect(signer1).fileParamValid(invalidFile);

        // Assert
        expect(result).to.equal(false);
    });

    it("Should return false if the transaction executer is not the same as the file owner", async function() {
        // Arrange
        const { fileRegister, signer2, file } = await loadFixture(deployContractAndSetVariables); 

        // Act
        const result = await fileRegister.connect(signer2).canAddFile(file);

        // Assert
        expect(result).to.equal(false);
    });

});