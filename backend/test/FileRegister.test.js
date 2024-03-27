const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
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
            version: 0,
            prevIpfsCID: "0",        
            owner: await signer1.getAddress(),             
            fileType: "image",           
            iv: "file1_iv",  
            state: "",
            fileHash: "hashFile"
        };

        let file1Wrong = {
            ipfsCID: "file1CID",        
            fileName: "file1Wrong.jpg",   
            version: 0,
            prevIpfsCID: "0",       
            owner: await signer1.getAddress(),             
            fileType: "image",           
            iv: "file1Wrong_iv",
            state: "active",
            fileHash: "hashFile"  
        };

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

        return { userRegisterContract, fileRegisterContract, accessControlContract, userAnaRita, userAnaPaula, file, file1Wrong, signer1, signer2 };
    }


    // Tests canAddFile(), fileExists() and addFile() using the uploadFile() => the other cases are tested on the AccessControl.sol
    describe("addFile", function(){
        describe("when the transaction executer is the file owner", async function(){
            describe("and the file doen't exist, and it's inputs are valid ", async function(){
                it("should add the file", async function(){
                    // Arrange
                    const { userRegisterContract, fileRegisterContract, accessControlContract, userAnaRita, file, signer1 } = await loadFixture(deployContractAndSetVariables);        
                    const encSymmetricKey = "encSymmetricKeyFileAnaRita";
                    await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user

                    // Act
                    // Note: I wasn't able to execute the addFile() using the accessControl contracts' address so I decided to use the upload() which calls the addFile
                    const tx = await accessControlContract.connect(signer1).uploadFile(userAnaRita.account, file, encSymmetricKey); // This executes the add file 
                    await tx.wait();
                    
                    // Assert
                    const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
                    expect(receipt.status).to.equal(1); // 1 = success

                    const result = await fileRegisterContract.connect(signer1).getFileByIpfsCID(file.ipfsCID, "active");
                    expect(result.success).to.equal(true);      
                    expect(result.file.ipfsCID).to.equal(file.ipfsCID);    
                    expect(result.file.fileName).to.equal(file.fileName);    
                    expect(result.file.version).to.equal(file.version);    
                    expect(result.file.prevIpfsCID).to.equal(file.prevIpfsCID);    
                    expect(result.file.owner).to.equal(file.owner);    
                    expect(result.file.fileType).to.equal(file.fileType);    
                    expect(result.file.iv).to.equal(file.iv);  
                    expect(result.file.state).to.equal("active");  
                    expect(result.file.fileHash).to.equal(file.fileHash);  
                });
            });
            describe("and the file already exists, and file inputs are valid", async function(){
                it("shouldn't add the file", async function(){
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

                    const result = await fileRegisterContract.connect(signer1).getFileByIpfsCID(file1Wrong.ipfsCID, "active"); 
                    expect(result.success).to.equal(true);      
                    expect(result.file.ipfsCID).to.equal(file.ipfsCID);    // Keeps the data of the first upload and not the second
                    expect(result.file.fileName).to.equal(file.fileName);    
                    expect(result.file.version).to.equal(file.version);    
                    expect(result.file.prevIpfsCID).to.equal(file.prevIpfsCID);    
                    expect(result.file.owner).to.equal(file.owner);    
                    expect(result.file.fileType).to.equal(file.fileType);    
                    expect(result.file.iv).to.equal(file.iv);  
                    expect(result.file.state).to.equal("active");  
                    expect(result.file.fileHash).to.equal(file.fileHash);  
                });
            });
            describe("and the file inputs are invalid, and the file doesn't exist", async function(){
                it("shouldn't add the file", async function(){
                    // Arrange
                    const { userRegisterContract, fileRegisterContract, accessControlContract, userAnaRita, signer1 } = await loadFixture(deployContractAndSetVariables);  
                    const encSymmetricKey = "encSymmetricKeyFileAnaRita";
                    await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user
                    let invalidFile = {
                        ipfsCID: "file1CID",        
                        fileName: "file1Wrong.jpg",   
                        version: 0,
                        prevIpfsCID: "0",       
                        owner: await signer1.getAddress(),             
                        fileType: "image",           
                        iv: "file1Wrong_iv",
                        state: "active",        // trying to upload a file in the active state
                        fileHash: "hashFile"  
                    };

                    // Act
                    // Note: I wasn't able to execute the addFile() using the accessControl contracts' address so I decided to use the upload() which calls the addFile
                    const tx = await accessControlContract.connect(signer1).uploadFile(signer1, invalidFile, encSymmetricKey); // This executes the add file 
                    await tx.wait();
                    
                    // Assert
                    const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
                    expect(receipt.status).to.equal(1); // 1 = success

                    const result = await fileRegisterContract.connect(signer1).getFileByIpfsCID(invalidFile.ipfsCID, "active");
                    expect(result.success).to.equal(false);  
                    expect(result.file.ipfsCID).to.equal("");
                    expect(result.file.fileName).to.equal("");    
                    expect(result.file.version).to.equal(0);    
                    expect(result.file.prevIpfsCID).to.equal("");    
                    expect(result.file.owner).to.equal("0x0000000000000000000000000000000000000000");    
                    expect(result.file.fileType).to.equal("");    
                    expect(result.file.iv).to.equal("");  
                    expect(result.file.state).to.equal("");  
                    expect(result.file.fileHash).to.equal("");  
                });
            });
        });
        describe("when the transaction executer is not the same as the file owner", async function(){
            it("should not add the file", async function(){
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

                const result = await fileRegisterContract.connect(signer2).getFileByIpfsCID(file.ipfsCID, "active");
                expect(result.success).to.equal(false);      
                expect(result.file.ipfsCID).to.equal("");
                expect(result.file.fileName).to.equal("");    
                expect(result.file.version).to.equal(0);    
                expect(result.file.prevIpfsCID).to.equal("");    
                expect(result.file.owner).to.equal("0x0000000000000000000000000000000000000000");    
                expect(result.file.fileType).to.equal("");    
                expect(result.file.iv).to.equal("");  
                expect(result.file.state).to.equal("");  
                expect(result.file.fileHash).to.equal("");  
            });
        });
    });

    describe("getFileByIpfsCID", function(){
        describe("when the files' CID exists", async function(){
            it("should get the file in the given state", async function(){
                // Arrange
                const { fileRegisterContract, userRegisterContract, accessControlContract, userAnaRita, file, signer1 } = await loadFixture(deployContractAndSetVariables);
                const encSymmetricKey = "encSymmetricKeyFileAnaRita";
                await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user
                // Note: I wasn't able to execute the addFile() using the accessControl contracts' address so I decided to use the upload() which calls the addFile
                const tx = await accessControlContract.connect(signer1).uploadFile(signer1, file, encSymmetricKey); // This executes the add file 
                await tx.wait();

                // Act
                const result = await fileRegisterContract.connect(signer1).getFileByIpfsCID(file.ipfsCID, "active");
                
                // Assert
                expect(result.success).to.equal(true);
                expect(result.file.ipfsCID).to.equal(file.ipfsCID);    // Keeps the data of the first upload and not the second
                expect(result.file.fileName).to.equal(file.fileName);    
                expect(result.file.version).to.equal(file.version);    
                expect(result.file.prevIpfsCID).to.equal(file.prevIpfsCID);    
                expect(result.file.owner).to.equal(file.owner);    
                expect(result.file.fileType).to.equal(file.fileType);    
                expect(result.file.iv).to.equal(file.iv);  
                expect(result.file.state).to.equal("active");  
                expect(result.file.fileHash).to.equal(file.fileHash);             
            });
        });
        describe("when the files' CID doesn't exist", async function(){
            it("should NOT get the file in the given state", async function(){
                // Arrange
                const { fileRegisterContract, file, signer1 } = await loadFixture(deployContractAndSetVariables);   

                // Act
                const result = await fileRegisterContract.connect(signer1).getFileByIpfsCID(file.ipfsCID, "active");
                
                // Assert
                expect(result.success).to.equal(false);
                expect(result.file.ipfsCID).to.equal("");
                expect(result.file.fileName).to.equal("");    
                expect(result.file.version).to.equal(0);    
                expect(result.file.prevIpfsCID).to.equal("");    
                expect(result.file.owner).to.equal("0x0000000000000000000000000000000000000000");    
                expect(result.file.fileType).to.equal("");    
                expect(result.file.iv).to.equal("");  
                expect(result.file.state).to.equal("");  
                expect(result.file.fileHash).to.equal("");      
            });
        });
    });

    describe("deactivateFile", function(){
        describe("when the transaction executer is the accessControlAddress", async function(){
            it("should deactivate the file", async function(){
                // Arrange
                const { userRegisterContract, fileRegisterContract, accessControlContract, userAnaRita, file, signer1 } = await loadFixture(deployContractAndSetVariables);        
                const encSymmetricKey = "encSymmetricKeyFileAnaRita";
                await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user
                const ty = await accessControlContract.connect(signer1).uploadFile(userAnaRita.account, file, encSymmetricKey); // This executes the add file 
                await ty.wait();

                // Act
                const tx = await accessControlContract.connect(signer1).deactivateFile(signer1, file.ipfsCID);
                await tx.wait();

                // Assert
                const result = await fileRegisterContract.connect(signer1).getFileState(file.ipfsCID);
                expect(result.success).to.equal(true);
                expect(result.resultString).to.equal("deactive");
            });
        });
        describe("when the transaction executer is not the accessControlAddress", async function(){
            it("should not deactivate the file", async function(){
                // Arrange
                const { userRegisterContract, fileRegisterContract, accessControlContract, userAnaRita, file, signer1 } = await loadFixture(deployContractAndSetVariables);        
                const encSymmetricKey = "encSymmetricKeyFileAnaRita";
                await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user
                const ty = await accessControlContract.connect(signer1).uploadFile(userAnaRita.account, file, encSymmetricKey); // This executes the add file 
                await ty.wait();

                // Act
                const tx = await fileRegisterContract.connect(signer1).deactivateFile(file.ipfsCID);
                await tx.wait();

                // Assert
                const result = await fileRegisterContract.connect(signer1).getFileState(file.ipfsCID);
                expect(result.success).to.equal(true);
                expect(result.resultString).to.equal("active");
            });
        });
    });
});