const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");

describe("Helper", function () {

    async function deployContractAndSetVariables() {
        const Helper = await ethers.getContractFactory("Helper");
        let helperContract = await Helper.deploy().catch(error => {
            console.error("Error deploying FileRegister: ", error);
            process.exit(1);
        });  

        const [signer1, signer2] = await ethers.getSigners(); // Get the first signer 

        let userAnaRita = {
            account: await signer1.getAddress(), // address of the one executing the transaction
            userName: "Ana Rita",
            mnemonic: "wisdom skate describe aim code april harsh reveal board order habit van",
            publicKey: "asd"
        };
        const fileAnaRita = {
            ipfsCID: "anaRitaIpfsCID1",        
            fileName: "anaRitaFile1.jpg",    
            version: 0,
            prevIpfsCID: 0,      
            owner: userAnaRita.account, // Ana Rita is the file owner             
            fileType: "image",           
            iv: "ivFileAnaRita",
            state: "active",
            fileHash: "hashFileAnaRita"  
        };

        const userAnaPaula = {
            account: await signer2.getAddress(),  // address of the one executing the transaction
            userName: "ana paula",
            mnemonic: "angry flavor wire wish struggle prepare apart say stuff lounge increase area",
            publicKey: "publicKeyAnaPaula"
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

        return { helperContract, userAnaRita, userAnaPaula, fileAnaRita, fileAnaPaula, signer1, signer2 };
    }


    describe("validUserFields", function(){
        describe("when users' fiels are valid and transaction executer is the same as the user", function(){
            it("should return true", async function(){
                // Arrange
                const { helperContract, signer1, userAnaRita } = await loadFixture(deployContractAndSetVariables); 

                // Act
                const result = await helperContract.connect(signer1).validUserFields(userAnaRita);

                // Assert
                expect(result).to.equal(true);
            });
        });
        describe("when users' fiels are invalid and transaction executer is the same as the user", function(){
            it ("should return false", async function(){
                // Arrange
                const { helperContract, signer2 } = await loadFixture(deployContractAndSetVariables); 
                let invalidUser = {
                    account: await signer2.getAddress(),
                    userName: "", // invalid userName
                    mnemonic: "wisdom skate describe aim code april harsh reveal board order habit van",
                    publicKey: "wer"
                };

                // Act
                const result = await helperContract.connect(signer2).validUserFields(invalidUser);

                // Assert
                expect(result).to.equal(false);
            });
        });
    });

    describe("fileParamValid", function(){
        describe("when file parameters are valid", function(){
            it("should return true", async function(){
                // Arrange
                const { helperContract, signer1, fileAnaRita } = await loadFixture(deployContractAndSetVariables); 

                // Act
                const result = await helperContract.connect(signer1).fileParamValid(fileAnaRita);

                // Assert
                expect(result).to.equal(true);
            });
        });
        describe("when file parameters are invalid", function(){
            it ("should return false", async function(){
                // Arrange
                const { helperContract, signer1 } = await loadFixture(deployContractAndSetVariables); 
                let invalidFile = {
                    ipfsCID: "",    // invalid ipfsCID    
                    fileName: "nameFile.jpg", 
                    version: 0,
                    prevIpfsCID: 0,      
                    owner: await signer1.getAddress(),             
                    fileType: "image",           
                    iv: "yourIv_1",  
                    state: "active",
                    fileHash: "hashFileAnaRita"  
                };

                // Act
                const result = await helperContract.connect(signer1).fileParamValid(invalidFile);

                // Assert
                expect(result).to.equal(false);
            });
        });
    });

    describe("verifyValidFields", function(){
        describe("when userHasFile fields are valid", function(){
            it("should return true", async function(){
                // Arrange
                const { helperContract, fileAnaRita, userAnaRita, signer1} = await loadFixture(deployContractAndSetVariables);

                // Act
                const result = await helperContract.connect(signer1).verifyValidFields(userAnaRita.account, fileAnaRita.ipfsCID, ["delete"], "")

                // Assert
                expect(result).to.equal(true);
            });
        });
        describe("when userHasFile fields are invalid", function(){
            it ("should return false", async function(){
                // Arrange
                const { helperContract, fileAnaRita, userAnaRita, signer1} = await loadFixture(deployContractAndSetVariables);  
                
                // Act
                const result = await helperContract.connect(signer1).verifyValidFields(userAnaRita.account, fileAnaRita.ipfsCID, [], "")

                // Assert
                expect(result).to.equal(false);
            });
        });
    });




    describe("stringArrayToString", function(){
        describe("when permissions have content", function(){
            it("should convert a string array into a string with comma-separated values", async function(){
                // Arrange
                const { helperContract} = await loadFixture(deployContractAndSetVariables);   
                const permissions = ["read", "write", "execute"];
            
                // Act
                const result = await helperContract.stringArrayToString(permissions);
            
                // Assert
                expect(result.success).to.equal(true);
                expect(result.resultString).to.equal("read, write, execute");
                expect(result.message).to.equal("");
            });
        });
        describe("when permissions are empty", function(){
            it ("should return an empty string", async function(){
                // Arrange
                const { helperContract} = await loadFixture(deployContractAndSetVariables);   
                const permissions = [];

                // Act
                const result = await helperContract.stringArrayToString(permissions);

                // Assert
                expect(result.success).to.equal(true);
                expect(result.resultString).to.equal("");
                expect(result.message).to.equal("");
            });
        });
    });

    describe("validPermissions", function(){
        describe("when a given set of permissions are valid", function(){
            it("should return true", async function(){
                // Arrange
                const { helperContract} = await loadFixture(deployContractAndSetVariables);   
                const permissions = ["download", "edit", "info"];

                // Act
                const result = await helperContract.validPermissions(permissions);

                // Assert
                expect(result).to.equal(true);
            });
        });
        describe("when a given set of permissions are invalid", function(){
            it ("should return false", async function(){
                // Arrange
                const { helperContract} = await loadFixture(deployContractAndSetVariables);   
                const permissions = ["create", "edit", "info"];
        
                // Act
                const result = await helperContract.validPermissions(permissions);
        
                // Assert
                expect(result).to.equal(false);
            });
        });
    });



    describe("toLower", function(){
        describe("when receiving uppercase letters", function(){
            it("should convert to lower case", async function(){
                // Arrange
                const { helperContract} = await loadFixture(deployContractAndSetVariables);   
                const input = "HELLO";
                const expectedOutput = "hello";

                // Act
                const result = await helperContract.toLower(input);

                // Assert
                expect(result).to.equal(expectedOutput);
            });
        });
        describe("when receiving lowercase letters", function(){
            it ("should leave them unchanged", async function(){
                // Arrange
                const { helperContract} = await loadFixture(deployContractAndSetVariables);   
                const input = "hello";
                const expectedOutput = "hello";

                // Act
                const result = await helperContract.toLower(input);

                // Assert
                expect(result).to.equal(expectedOutput);
            });
        });
        describe("when receiving special characters", function(){
            it ("should leave them unchaged", async function(){
                // Arrange
                const { helperContract} = await loadFixture(deployContractAndSetVariables);   
                const input = "Hello World!";
                const expectedOutput = "hello world!";

                // Act
                const result = await helperContract.toLower(input);

                // Assert
                expect(result).to.equal(expectedOutput);
            });
        });
        describe("when receiving an empty string", function(){
            it ("should return an empty string", async function(){
                // Arrange
                const { helperContract} = await loadFixture(deployContractAndSetVariables);   
                const input = "";
                const expectedOutput = "";

                // Act
                const result = await helperContract.toLower(input);

                // Assert
                expect(result).to.equal(expectedOutput);
            });
        });
    });

    describe("isKeyEqual", async function(){
        describe("when the account input and the file IPFS are the same as the list", async function(){
            it("should return true", async function(){
                // Arrange
                const { helperContract, userAnaRita, fileAnaRita, signer1 } = await loadFixture(deployContractAndSetVariables);
                const userHasFileList = [
                    {
                        userAccount: userAnaRita.account,
                        ipfsCID: fileAnaRita.ipfsCID,
                        encSymmetricKey: "yourEncSymmetricKey1",
                        permissions: ["download", "delete", "share"]
                    }
                ];

                // Act
                const result = await helperContract.connect(signer1).isKeyEqual(
                    userAnaRita.account, 
                    userHasFileList[0].userAccount,
                    fileAnaRita.ipfsCID,
                    userHasFileList[0].ipfsCID);
                
                // Assert
                expect(result).to.equal(true);
            });
        });
        describe("when the account input is not the same as the one in the list", async function(){
            it("should return false", async function(){
                // Arrange     
                const { helperContract, userAnaRita, userAnaPaula, fileAnaPaula, signer1 } = await loadFixture(deployContractAndSetVariables);   
                const userHasFileList = [
                    {
                        userAccount: userAnaPaula.account,
                        ipfsCID: fileAnaPaula.ipfsCID,
                        encSymmetricKey: "yourEncSymmetricKey1",
                        permissions: ["download", "delete", "share"]
                    }
                ];
                // Act
                const result = await helperContract.connect(signer1).isKeyEqual(
                    userAnaRita.account, 
                    userHasFileList[0].userAccount,
                    fileAnaPaula.ipfsCID,
                    userHasFileList[0].ipfsCID);

                // Assert
                expect(result).to.equal(false);
            });
        });
        describe("when the file IPFS input is not the same as the one in the list", async function(){
            it("should return false", async function(){
                // Arrange     
                const { helperContract, fileAnaRita, userAnaPaula, fileAnaPaula, signer1 } = await loadFixture(deployContractAndSetVariables);   
                const userHasFileList = [
                    {
                        userAccount: userAnaPaula.account,
                        ipfsCID: fileAnaPaula.ipfsCID,
                        encSymmetricKey: "yourEncSymmetricKey1",
                        permissions: ["download", "delete", "share"]
                    }
                ];
                // Act
                const result = await helperContract.connect(signer1).isKeyEqual(
                    userAnaPaula.account, 
                    userHasFileList[0].userAccount,
                    fileAnaRita.ipfsCID,
                    userHasFileList[0].ipfsCID);

                // Assert
                expect(result).to.equal(false); 
            });
        });
    });
});