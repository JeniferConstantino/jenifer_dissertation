/*const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");

describe("FileRegister", function () {

    // Like a BeforeEach
    async function deployContractAndSetVariables() {
        const Helper = await ethers.getContractFactory("Helper");
        let helperContract = await Helper.deploy().catch(error => {
            console.error("Error deploying FileRegister: ", error);
            process.exit(1);
        });  

        const AccessContrrol = await ethers.getContractFactory("AccessControl");
        const accessControlContract = await AccessContrrol.deploy(helperContract.target);

        const fileRegisterAddress = await accessControlContract.getFileRegisterAddress();
        const fileRegisterContract = await hre.ethers.getContractAt("FileRegister", fileRegisterAddress);
        await fileRegisterContract.setAccessControlAddress(accessControlContract.target); // Already testing the setAccessControlAddress()

        const userRegisterAddress = await accessControlContract.getUserRegisterAddress();
        const userRegisterContract = await hre.ethers.getContractAt("UserRegister", userRegisterAddress);

        const [signer1, signer2] = await ethers.getSigners(); // Get the first signer 

        let file = {
            ipfsCID: "file1CID",        
            fileName: "file1.jpg",          
            owner: await signer1.getAddress(),             
            fileType: "image",           
            iv: "file1_iv",  
        };

        let file1Wrong = {
            ipfsCID: "file1CID",        
            fileName: "file1Wrong.jpg",          
            owner: await signer1.getAddress(),             
            fileType: "image",           
            iv: "file1Wrong_iv",  
        };

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

        return { userRegisterContract, fileRegisterContract, accessControlContract, userAnaRita, userAnaPaula, file, file1Wrong, signer1, signer2 };
    }

    // Tests: canAddFile() and addFile()
    it("Should add a file if the transaction executer is the file owner, the file doesn't exist, and the file inputs are valid", async function() {
        // Arrange
        const { userRegisterContract, fileRegisterContract, accessControlContract, userAnaRita, file, signer1 } = await loadFixture(deployContractAndSetVariables);        
        const encSymmetricKey = "encSymmetricKeyFileAnaRita";
        await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user


        // Act
        // Note: I wasn't able to execute the addFile() using the accessControl contracts' address so I decided to use the upload() which calls the addFile
        const tx = await accessControlContract.connect(signer1).uploadFile(signer1, file, encSymmetricKey); // This executes the add file 
        await tx.wait();
        
        // Assert
        const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
        expect(receipt.status).to.equal(1); // 1 = success

        const result = await fileRegisterContract.connect(signer1).getFileByIpfsCID(file.ipfsCID);
        expect(result.success).to.equal(true);      
        expect(result.file.ipfsCID).to.equal(file.ipfsCID);    
        expect(result.file.fileName).to.equal(file.fileName);    
        expect(result.file.owner).to.equal(file.owner);    
        expect(result.file.fileType).to.equal(file.fileType);    
        expect(result.file.iv).to.equal(file.iv);    
    });

    // Tests: canAddFile(), fileExists() and addFile()
    it("Shouldn't add a file if the transaction executer is the file owner but the file already exists", async function() {
        // Arrange
        const { userRegisterContract, accessControlContract, fileRegisterContract, userAnaRita, file, file1Wrong, signer1 } = await loadFixture(deployContractAndSetVariables);   
        const encSymmetricKey = "encSymmetricKeyFileAnaRita";
        await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user
        await accessControlContract.connect(signer1).uploadFile(signer1, file, encSymmetricKey); // The uploadFile() executes the addFile()
        
        // Act
        // Note: I wasn't able to execute the addFile() using the accessControl contracts' address so I decided to use the upload() which calls the addFile
        const tx = await accessControlContract.connect(signer1).uploadFile(signer1, file1Wrong, encSymmetricKey); // This executes the add file 
        await tx.wait();
        
        // Assert
        const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
        expect(receipt.status).to.equal(1); // 1 = success

        const result = await fileRegisterContract.connect(signer1).getFileByIpfsCID(file1Wrong.ipfsCID);
        expect(result.success).to.equal(true);      
        expect(result.file.ipfsCID).to.equal(file.ipfsCID);     // Keeps the data of the first upload and not the second 
        expect(result.file.fileName).to.equal(file.fileName);    
        expect(result.file.owner).to.equal(file.owner);    
        expect(result.file.fileType).to.equal(file.fileType);    
        expect(result.file.iv).to.equal(file.iv); 
    });

    // Tests: canAddFile(), fileExists() and addFile()
    it("Shouldn't add a file if the transaction executer is the file owner, and the file inputs are invalid", async function() {
        // Arrange
        const { userRegisterContract, fileRegisterContract, accessControlContract, userAnaRita, signer1 } = await loadFixture(deployContractAndSetVariables);  
        const encSymmetricKey = "encSymmetricKeyFileAnaRita";
        await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user
        let invalidFile = {
            ipfsCID: "",    // invalid ipfsCID    
            fileName: "nameFile.jpg",          
            owner: await signer1.getAddress(),             
            fileType: "image",           
            iv: "yourIv_1",  
        };

        // Act
        // Note: I wasn't able to execute the addFile() using the accessControl contracts' address so I decided to use the upload() which calls the addFile
        const tx = await accessControlContract.connect(signer1).uploadFile(signer1, invalidFile, encSymmetricKey); // This executes the add file 
        await tx.wait();
        
        // Assert
        const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
        expect(receipt.status).to.equal(1); // 1 = success

        const result = await fileRegisterContract.connect(signer1).getFileByIpfsCID(invalidFile.ipfsCID);
        expect(result.success).to.equal(false);      
        expect(result.file.ipfsCID).to.equal("");    
        expect(result.file.fileName).to.equal("");    
        expect(result.file.owner).to.equal("0x0000000000000000000000000000000000000000");    
        expect(result.file.fileType).to.equal("");    
        expect(result.file.iv).to.equal("");      
    });

    // Tests: canAddFile(), fileExists() and addFile()
    it("Shouldn't add a file if the transaction executer is the same as the user account", async function(){
        // Arrange
        const { accessControlContract, userRegisterContract, fileRegisterContract, userAnaPaula, userAnaRita, file, signer1, signer2 } = await loadFixture(deployContractAndSetVariables);        
        const encSymmetricKey = "encSymmetricKeyFileAnaRita";
        await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user
        await userRegisterContract.connect(signer2).userRegistered(userAnaPaula); // Register the user

        // Act
        // Note: I wasn't able to execute the addFile() using the accessControl contracts' address so I decided to use the upload() which calls the addFile
        const tx = await accessControlContract.connect(signer2).uploadFile(signer1, file, encSymmetricKey); // This executes the add file 
        await tx.wait();

        // Assert
        const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
        expect(receipt.status).to.equal(1); // 1 = success

        const result = await fileRegisterContract.connect(signer2).getFileByIpfsCID(file.ipfsCID);
        expect(result.success).to.equal(false);      
        expect(result.file.ipfsCID).to.equal("");    
        expect(result.file.fileName).to.equal("");    
        expect(result.file.owner).to.equal("0x0000000000000000000000000000000000000000");    
        expect(result.file.fileType).to.equal("");    
        expect(result.file.iv).to.equal("");   
    });

    it("Should get a file if the files' CID exists", async function() {
        // Arrange
        const { fileRegisterContract, userRegisterContract, accessControlContract, userAnaRita, file, signer1 } = await loadFixture(deployContractAndSetVariables);
        const encSymmetricKey = "encSymmetricKeyFileAnaRita";
        await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user
        // Note: I wasn't able to execute the addFile() using the accessControl contracts' address so I decided to use the upload() which calls the addFile
        const tx = await accessControlContract.connect(signer1).uploadFile(signer1, file, encSymmetricKey); // This executes the add file 
        await tx.wait();

        // Act
        const result = await fileRegisterContract.connect(signer1).getFileByIpfsCID(file.ipfsCID);
        
        // Assert
        expect(result.success).to.equal(true);
        expect(result.file.ipfsCID).to.equal(file.ipfsCID);
        expect(result.file.fileName).to.equal(file.fileName);
        expect(result.file.owner.toLowerCase()).to.equal(file.owner.toLowerCase());
        expect(result.file.fileType).to.equal(file.fileType);
        expect(result.file.iv).to.equal(file.iv);              
    });

    it("Shouldn't get a file if the files' CID doesn't exist", async function() {
        // Arrange
        const { fileRegisterContract, file, signer1 } = await loadFixture(deployContractAndSetVariables);   

        // Act
        const result = await fileRegisterContract.connect(signer1).getFileByIpfsCID(file.ipfsCID);
        
        // Assert
        expect(result.success).to.equal(false);
        expect(result.file.ipfsCID.toLowerCase()).to.equal('');
        expect(result.file.fileName).to.equal('');
        expect(result.file.owner).to.equal('0x0000000000000000000000000000000000000000');
        expect(result.file.fileType).to.equal('');
        expect(result.file.iv).to.equal('');              
    });
});*/