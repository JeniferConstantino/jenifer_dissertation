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

        const loginRegisterAddress = await accessControlContract.getLoginRegister();
        const loginRegisterContract = await hre.ethers.getContractAt("LoginRegister", loginRegisterAddress);

        // sets the loginRegister address in the userRegister contract
        userRegisterContract.setLoginRegisterAddress(loginRegisterAddress);

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

        const fileAnaPaula = {
            ipfsCID: "anaPaulaIpfsCID2",        
            fileName: "anaPaulaFile1.jpg",  
            version: 0,
            prevIpfsCID: "0",        
            owner: signer2.getAddress(), // Ana Paula is the file owner             
            fileType: "image",           
            iv: "ivFileAnaPaula", 
            state: "",
            fileHash: "fileHashAnaPaula"  
        };

        let fileEdited = {
            ipfsCID: "file2CID",        
            fileName: "file2.jpg",  
            version: 1,
            prevIpfsCID: "file1CID",        
            owner: await signer1.getAddress(),             
            fileType: "image",           
            iv: "file2_iv",  
            state: "active",
            fileHash: "hashFile2"
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

        return { userRegisterContract, loginRegisterContract, fileRegisterContract, accessControlContract, userAnaRita, userAnaPaula, file, fileEdited, fileAnaPaula, file1Wrong, signer1, signer2 };
    }

    // Tests canAddFile(), fileExists() and addFile() using the uploadFile() => the other cases are tested on the AccessControl.sol
    describe("addFile", function(){
        describe("when the transaction executer is the file owner", async function(){
            describe("and the file doen't exist, and it's inputs are valid ", async function(){
                it("should add the file", async function(){
                    // Arrange
                    const { loginRegisterContract, fileRegisterContract, accessControlContract, userAnaRita, file, signer1 } = await loadFixture(deployContractAndSetVariables);        
                    const encSymmetricKey = "encSymmetricKeyFileAnaRita";
                    await loginRegisterContract.connect(signer1).registerUser(userAnaRita); // Register the user

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
                    const { loginRegisterContract, accessControlContract, fileRegisterContract, userAnaRita, file, file1Wrong, signer1 } = await loadFixture(deployContractAndSetVariables);   
                    const encSymmetricKey = "encSymmetricKeyFileAnaRita";
                    await loginRegisterContract.connect(signer1).registerUser(userAnaRita); // Register the user
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
                    const { loginRegisterContract, fileRegisterContract, accessControlContract, userAnaRita, signer1 } = await loadFixture(deployContractAndSetVariables);  
                    const encSymmetricKey = "encSymmetricKeyFileAnaRita";
                    await loginRegisterContract.connect(signer1).registerUser(userAnaRita); // Register the user
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
                const { accessControlContract, loginRegisterContract, fileRegisterContract, userAnaPaula, userAnaRita, file, signer1, signer2 } = await loadFixture(deployContractAndSetVariables);        
                const encSymmetricKey = "encSymmetricKeyFileAnaRita";
                await loginRegisterContract.connect(signer1).registerUser(userAnaRita); // Register the user
                await loginRegisterContract.connect(signer2).registerUser(userAnaPaula); // Register the user

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

    // Tests editFile() => the other cases are tested on the AccessControl.sol
    describe("editFile", function(){
        describe("when the transaction executer has edit permissions over a file and the file is in the active state", async function(){
            it("should set the file to edited state and create a new file in the active state", async function(){
                // Arrange
                const { accessControlContract, loginRegisterContract, fileRegisterContract, file, fileAnaPaula, userAnaRita, signer1 } = await loadFixture(deployContractAndSetVariables);
                await loginRegisterContract.connect(signer1).registerUser(userAnaRita); // Register the user
                const encSymmetricKey = "encSymmetricKeyFile";
                await accessControlContract.connect(signer1).uploadFile(userAnaRita.account, file, encSymmetricKey); // gives the download permissions

                // Act
                const tx = await accessControlContract.connect(signer1).editFile(file, fileAnaPaula, [userAnaRita.account], [encSymmetricKey]);
                await tx.wait();

                // Assert
                const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
                expect(receipt.status).to.equal(1); // 1 = success

                var res = await fileRegisterContract.connect(signer1).getFileState(file.ipfsCID);
                expect(res.success).to.equal(true);
                expect(res.resultString).to.equal("edited");

                res = await fileRegisterContract.connect(signer1).getFileState(fileAnaPaula.ipfsCID);
                expect(res.success).to.equal(true);
                expect(res.resultString).to.equal("active");
            });
        });
    });

    describe("getFileByIpfsCID", function(){
        describe("when the files' CID exists", async function(){
            it("should get the file in the given state", async function(){
                // Arrange
                const { fileRegisterContract, loginRegisterContract, accessControlContract, userAnaRita, file, signer1 } = await loadFixture(deployContractAndSetVariables);
                const encSymmetricKey = "encSymmetricKeyFileAnaRita";
                await loginRegisterContract.connect(signer1).registerUser(userAnaRita); // Register the user
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
                const { fileRegisterContract, loginRegisterContract, accessControlContract, userAnaRita, file, signer1 } = await loadFixture(deployContractAndSetVariables);        
                const encSymmetricKey = "encSymmetricKeyFileAnaRita";
                await loginRegisterContract.connect(signer1).registerUser(userAnaRita); // Register the user
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
                const { loginRegisterContract, fileRegisterContract, accessControlContract, userAnaRita, file, signer1 } = await loadFixture(deployContractAndSetVariables);        
                const encSymmetricKey = "encSymmetricKeyFileAnaRita";
                await loginRegisterContract.connect(signer1).registerUser(userAnaRita); // Register the user
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

    // method getIpfsCIDsByName() is already tested in the AccessControl.test by testing the userAssociatedWithFileName()
    describe("getIpfsCIDsByName", async function(){
        describe("when the transaction executer is not the AccessControl contract", async function(){
            it("should return false and an empty string array", async function(){
                // Arrange
                const { fileRegisterContract, loginRegisterContract, accessControlContract, userAnaRita, file, signer1 } = await loadFixture(deployContractAndSetVariables);        
                const encSymmetricKey = "encSymmetricKeyFileAnaRita";
                await loginRegisterContract.connect(signer1).registerUser(userAnaRita); // Register the user

                await accessControlContract.connect(signer1).uploadFile(userAnaRita.account, file, encSymmetricKey); // This executes the add file 

                // Act
                var result = await fileRegisterContract.connect(signer1).getIpfsCIDsByName(file.fileName);

                // Assert
                expect(result.success).to.equal(false);
                expect(result.resultStrings).to.deep.equal([]);
            });
        });
    });

    // method getFileHash() is already tested in the AccessControl.test 
    describe("getFileHash", async function(){
        describe("when the transaction executer is not the AccessControl contract", async function(){
            it("should return false and an empty string", async function(){
                // Arrange
                const { fileRegisterContract, loginRegisterContract, accessControlContract, userAnaRita, file, signer1 } = await loadFixture(deployContractAndSetVariables);        
                const encSymmetricKey = "encSymmetricKeyFileAnaRita";
                await loginRegisterContract.connect(signer1).registerUser(userAnaRita); // Register the user
                await accessControlContract.connect(signer1).uploadFile(userAnaRita.account, file, encSymmetricKey); // This executes the add file 

                // Act
                var result = await fileRegisterContract.connect(signer1).getFileHash(file.ipfsCID);

                // Assert
                expect(result.success).to.equal(false);
                expect(result.resultString).to.deep.equal("");
            });
        });
    });
    
    describe("getEditedFilesByIpfsCid", async function(){
        describe("when the file CID exists", async function(){
            it("should return the edited files", async function(){
                // Arrange
                const { loginRegisterContract, fileRegisterContract, accessControlContract, userAnaRita, file, fileEdited, signer1 } = await loadFixture(deployContractAndSetVariables);        
                const encSymmetricKey = "encSymmetricKeyFileAnaRita";
                await loginRegisterContract.connect(signer1).registerUser(userAnaRita); // Register the user
                await accessControlContract.connect(signer1).uploadFile(userAnaRita.account, file, encSymmetricKey); // This executes the add file 
                await accessControlContract.connect(signer1).editFile(file, fileEdited, [userAnaRita.account], [encSymmetricKey]);

                // Act
                var result = await fileRegisterContract.connect(signer1).getEditedFilesByIpfsCid(fileEdited.ipfsCID);

                // Assert
                var expectedResponse = [ // an array of objects of the files
                    ["file2CID",
                    "file2.jpg",
                    "1",
                    "file1CID",
                    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
                    "image",
                    "file2_iv",
                    "active",
                    "hashFile2"],
                    [
                    "file1CID",
                    "file1.jpg",
                    "0",
                    "0",
                    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
                    "image",
                    "file1_iv",
                    "edited",
                    "hashFile"]
                ]; 
                expect(result.success).to.equal(true);
                expect(result.files).to.deep.equal(expectedResponse);
            });
        });
    });

    describe("getFileState", async function(){
        it("should return the state of the given file", async function(){
            // Arrange
            const { fileRegisterContract, loginRegisterContract, accessControlContract, userAnaRita, file, signer1 } = await loadFixture(deployContractAndSetVariables);   
            const encSymmetricKey = "encSymmetricKeyFileAnaRita";
            await loginRegisterContract.connect(signer1).registerUser(userAnaRita); // Register the user
            await accessControlContract.connect(signer1).uploadFile(userAnaRita.account, file, encSymmetricKey); // This executes the add file 
            
            // Act
            const res = await fileRegisterContract.connect(signer1).getFileState(file.ipfsCID);

            // Assert
            expect(res.success).to.equal(true);
            expect(res.resultString).to.equal("active");
        });
    });

    describe("userIsFileOwner", async function(){
        describe("when the the user is the file owner", async function(){
            it("should return true", async function(){
                // Arrange
                const { fileRegisterContract, loginRegisterContract, accessControlContract, userAnaRita, file, signer1 } = await loadFixture(deployContractAndSetVariables);   
                const encSymmetricKey = "encSymmetricKeyFileAnaRita";
                await loginRegisterContract.connect(signer1).registerUser(userAnaRita); // Register the user
                await accessControlContract.connect(signer1).uploadFile(userAnaRita.account, file, encSymmetricKey); // This executes the add file 
                
                // Act
                const res = await fileRegisterContract.connect(signer1).userIsFileOwner(userAnaRita.account, file.ipfsCID);

                // Assert
                expect(res).to.equal(true);
            });
        });
        describe("when the user is not the file owner", async function(){
            it("should return false", async function(){
               // Arrange
               const { fileRegisterContract, accessControlContract, loginRegisterContract, userAnaRita, userAnaPaula, file, signer1 } = await loadFixture(deployContractAndSetVariables);   
               const encSymmetricKey = "encSymmetricKeyFileAnaRita";
               await loginRegisterContract.connect(signer1).registerUser(userAnaRita); // Register the user
               await accessControlContract.connect(signer1).uploadFile(userAnaRita.account, file, encSymmetricKey); // This executes the add file 
               
               // Act
               const res = await fileRegisterContract.connect(signer1).userIsFileOwner(userAnaPaula.account, file.ipfsCID);

               // Assert
               expect(res).to.equal(false);
            });
        });
    });
});