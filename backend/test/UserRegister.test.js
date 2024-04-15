const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");

describe("UserRegister", function () {

    // Like a BeforeEach
    async function deployContractAndSetVariables() {
        const Helper = await ethers.getContractFactory("Helper");
        let helperContract = await Helper.deploy().catch(error => {
            console.error("Error deploying FileRegister: ", error);
            process.exit(1);
        });  

        const UserRegister = await ethers.getContractFactory("UserRegister");
        const userRegister = await UserRegister.deploy(helperContract.target);

        const LoginRegister = await ethers.getContractFactory("LoginRegister");
        const loginRegister = await LoginRegister.deploy(userRegister.target);

        // sets the loginRegister address in the userRegister contract
        userRegister.setLoginRegisterAddress(loginRegister.target);
        
        const [signer1, signer2] = await ethers.getSigners(); // Get the first signer 

        let userAnaRita = {
            account: await signer1.getAddress(), // address of the one executing the transaction
            userName: "ana rita",
            mnemonic: "wisdom skate describe aim code april harsh reveal board order habit van",
            publicKey: "asd"
        };

        let invalidAnaPaula = {
            account: await signer1.getAddress(), // same address as userAnaRita
            userName: "ana paula",
            mnemonic: "angry flavor wire wish struggle prepare apart say stuff lounge increase area",
            publicKey: "wer"
        };

        let invalidAnaRita = {
            account: await signer2.getAddress(), // same address as userAnaRita
            userName: "ana rita",
            mnemonic: "loyal total absurd raccoon today simple whip subway ladder frost purchase twice", 
            publicKey: "wer"
        };

        return { loginRegister, userRegister, userAnaRita, invalidAnaPaula, invalidAnaRita, signer1, signer2 };
    }

    // already tests the canRegister() method
    // userRegistered is executed by calling the loginRegister() of the contract LoginRegister contract
    describe("userRegistered", function(){
        describe("when the transaction executer is the user trying to register", function() {
            describe("and the username and address are unique", function(){
                it("should register a user", async function(){
                    // Arrange        
                    const { userRegister, loginRegister, userAnaRita, signer1 } = await loadFixture(deployContractAndSetVariables);     
                    
                    // Act
                    const tx = await loginRegister.connect(signer1).registerUser(userAnaRita);
                    await tx.wait();

                    // Assert
                    const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
                    expect(receipt.status).to.equal(1); // 1 = success
    
                    const result = await userRegister.connect(signer1).getUser(userAnaRita.account);
                    expect(result.success).to.equal(true);
                });
            });

            describe("and the address is already in use", function(){
                it ("should NOT register the user", async function(){
                    // Arrange
                    const { userRegister, loginRegister, userAnaRita, invalidAnaPaula, signer1 } = await loadFixture(deployContractAndSetVariables);   
                    const tx = await loginRegister.connect(signer1).registerUser(userAnaRita);
                    await tx.wait();
    
                    // Act
                    const tx2 = await loginRegister.connect(signer1).registerUser(invalidAnaPaula);
                    await tx2.wait();
    
                    // Assert
                    const receipt = await ethers.provider.getTransactionReceipt(tx2.hash);
                    expect(receipt.status).to.equal(1); // 1 = success
    
                    const result = await userRegister.connect(signer1).getUser(invalidAnaPaula.account);
                    expect(result.user.userName).to.equal("ana rita");  // Ana Rita because she was already registered with the address
                });
            });

            describe("and the userName is already in use", function(){
                it ("should NOT register the user", async function(){
                    // Arrange
                    const { userRegister, loginRegister, userAnaRita, invalidAnaRita, signer1, signer2 } = await loadFixture(deployContractAndSetVariables);        
                    const tx = await loginRegister.connect(signer1).registerUser(userAnaRita);
                    await tx.wait();
    
                    // Act
                    const tx2 = await loginRegister.connect(signer2).registerUser(invalidAnaRita);
                    await tx2.wait();
    
                    // Assert
                    const receipt = await ethers.provider.getTransactionReceipt(tx2.hash);
                    expect(receipt.status).to.equal(1); // 1 = success
    
                    const result = await userRegister.connect(signer2).getUser(invalidAnaRita.account);
                    expect(result.success).to.equal(false); 
                    expect(result.user.account).to.equal("0x0000000000000000000000000000000000000000");  // User not stored because the name Ana Rita already existed
                    expect(result.user.userName).to.equal("");
                });
            });
        });
        describe("when the transaction executer is not the LoginResgister contract", function(){
            it ("should NOT register the user", async function(){
                // Arrange
                const { userRegister, userAnaRita, signer2 } = await loadFixture(deployContractAndSetVariables);        

                // Act
                const tx = await userRegister.connect(signer2).userRegistered(userAnaRita);
                await tx.wait();
                
                // Assert
                const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
                expect(receipt.status).to.equal(1); // 1 = success

                const result = await userRegister.getUser(userAnaRita.account);
                expect(result.success).to.equal(false);      
                expect(result.user.account).to.equal("0x0000000000000000000000000000000000000000");  // User not stored
            });
        });
    });

    describe("getUser", function(){
        describe("when the transaction executer is not the same as the user", function(){
            it ("should NOT return the user ", async function(){
                // Arrange
                const { userRegister, loginRegister, userAnaRita, signer1, signer2 } = await loadFixture(deployContractAndSetVariables);
                const txRegister = await loginRegister.connect(signer1).registerUser(userAnaRita);
                await txRegister.wait();

                // Act
                const result = await userRegister.connect(signer2).getUser(userAnaRita.account);

                // Assert
                expect(result.success).to.equal(false);
                expect(result.user.account.toLowerCase()).to.equal("0x0000000000000000000000000000000000000000");
                expect(result.user.userName).to.equal("");
                expect(result.user.mnemonic).to.equal("");
                expect(result.user.publicKey).to.equal("");
            });
        });
        describe("when the transaction executer is the same as the user", function(){
            describe("and the user is already registered", function(){
                it("should return the user", async function(){
                    // Arrange
                    const { userRegister, loginRegister, userAnaRita, signer1 } = await loadFixture(deployContractAndSetVariables);  
                    await loginRegister.connect(signer1).registerUser(userAnaRita);

                    // Act
                    const result = await userRegister.connect(signer1).getUser(userAnaRita.account);

                    // Assert
                    expect(result.success).to.equal(true);
                    expect(result.user.account.toLowerCase()).to.equal(userAnaRita.account.toLowerCase());
                    expect(result.user.name).to.equal(userAnaRita.name);
                    expect(result.user.mnemonic).to.equal(userAnaRita.mnemonic);
                    expect(result.user.publicKey).to.equal(userAnaRita.publicKey);
                });
            }); 
            describe("and the user is not registered", function(){
                it("should NOT return the user", async function(){
                    // Arrange
                    const { userRegister, userAnaRita, signer1 } = await loadFixture(deployContractAndSetVariables);  

                    // Act
                    const result = await userRegister.connect(signer1).getUser(userAnaRita.account);

                    // Assert
                    expect(result.success).to.equal(false);
                    expect(result.user.account.toLowerCase()).to.equal("0x0000000000000000000000000000000000000000");
                    expect(result.user.userName).to.equal('');
                    expect(result.user.mnemonic).to.equal('');
                    expect(result.user.publicKey).to.equal('');
                });
            }); 
        });
    });


    describe("getUserUserName", function(){
        describe("when the user account exists", function(){
            it("should return the user name", async function(){
                // Arrange
                const { userRegister, loginRegister, userAnaRita, signer1 } = await loadFixture(deployContractAndSetVariables);    
                await loginRegister.connect(signer1).registerUser(userAnaRita);

                // Act
                const result = await userRegister.connect(signer1).getUserUserName(userAnaRita.account);

                // Assert
                expect(result.success).to.equal(true);
                expect(result.resultString).to.equal(userAnaRita.userName);
            });
        });
        describe("when the user account doesn't exist", function(){
            it ("should NOT return the user name", async function(){
                // Arrange
                const { userRegister, userAnaRita, signer1 } = await loadFixture(deployContractAndSetVariables);        
                
                // Act
                const result = await userRegister.connect(signer1).getUserUserName(userAnaRita.account);

                // Assert
                expect(result.success).to.equal(false);
                expect(result.resultString).to.equal("");
            });
        });
    });

    describe("getUserAccount", function(){
        describe("when the there is a user with the given name", function(){
            it("should return the users' accoun", async function(){
                // Arrange
                const { userRegister, loginRegister, userAnaRita, signer1, signer2 } = await loadFixture(deployContractAndSetVariables);  
                const txRegister = await loginRegister.connect(signer1).registerUser(userAnaRita);
                await txRegister.wait();

                // Act
                const result = await userRegister.connect(signer2).getUserAccount(userAnaRita.userName);

                // Assert
                expect(result.success).to.equal(true);
                expect(result.resultAddress).to.equal(userAnaRita.account);
            });
        });
        describe("when there is no user with the given name", function(){
            it ("should NOT return the users' account ", async function(){
                // Arrange
                const { userRegister, userAnaRita, signer1 } = await loadFixture(deployContractAndSetVariables);  

                // Act
                const result = await userRegister.connect(signer1).getUserAccount(userAnaRita.userName);

                // Assert
                expect(result.success).to.equal(false);
                expect(result.resultAddress).to.equal("0x0000000000000000000000000000000000000000");
            });
        });
    });

    describe("getPublicKey", function(){
        describe("when the user exist", function(){
            it("should return the public key", async function(){
                // Arrange
                const { userRegister, loginRegister, userAnaRita, signer1, signer2 } = await loadFixture(deployContractAndSetVariables);  
                const txRegister = await loginRegister.connect(signer1).registerUser(userAnaRita);
                await txRegister.wait();
        
                // Act
                const result = await userRegister.connect(signer2).getPublicKey(userAnaRita.account);
        
                // Assert
                expect(result.success).to.equal(true);
                expect(result.resultString).to.equal(userAnaRita.publicKey);
            });
        });
        describe("when the user doesn't exist", function(){
            it ("should NOT return the public key ", async function(){
                // Arrange
                const { userRegister, userAnaRita, signer1 } = await loadFixture(deployContractAndSetVariables); 
        
                // Act
                const result = await userRegister.connect(signer1).getPublicKey(userAnaRita.account);
        
                // Assert
                expect(result.success).to.equal(false);
                expect(result.resultString).to.equal("");
            });
        });
    });

    describe("verifyUserAssociatedMnemonic", function(){
        describe("when the transaction executer is NOT the same as the user", async function(){
            // Arrange
            const {userRegister, loginRegister, userAnaRita, signer1, signer2} = await loadFixture(deployContractAndSetVariables); 
            const mnemonic = userAnaRita.mnemonic;
            await loginRegister.connect(signer1).registerUser(userAnaRita);

            // Act
            const result = await userRegister.connect(signer2).verifyUserAssociatedMnemonic(mnemonic, userAnaRita.account);

            // Assert
            expect(result).to.equal(false);
        });
        describe("when the transaction executer is the same as the user", async function(){
            describe("and the mnemonic is the same as the users' mnemonic", async function(){
                it("should return true", async function(){
                    // Arrange
                    const {userRegister, loginRegister, userAnaRita, signer1} = await loadFixture(deployContractAndSetVariables); 
                    const mnemonic = userAnaRita.mnemonic;
                    await loginRegister.connect(signer1).registerUser(userAnaRita);

                    // Act
                    const result = await userRegister.connect(signer1).verifyUserAssociatedMnemonic(mnemonic, userAnaRita.account);
                    console.log("result: ", result);
                    
                    // Assert
                    expect(result).to.equal(true);
                });
            });
            describe("and the mnemonic is NOT the same as the users' mnemonic", async function(){
                it("should return false", async function(){
                    // Arrange
                    const {userRegister, loginRegister, userAnaRita, signer1} = await loadFixture(deployContractAndSetVariables); 
                    const mnemonic = "angry flavor wire wish struggle prepare apart say stuff lounge increase area";
                    await loginRegister.connect(signer1).registerUser(userAnaRita);

                    // Act
                    const result = await userRegister.connect(signer1).verifyUserAssociatedMnemonic(mnemonic, userAnaRita.account);

                    // Assert
                    expect(result).to.equal(false);
                });
            });
        });
    });

    describe("existingAddress", function(){
        describe("when the address already exists", function(){
            it("should return true", async function(){
                // Arrange
                const { userRegister, loginRegister, userAnaRita, signer1 } = await loadFixture(deployContractAndSetVariables);  
                await loginRegister.connect(signer1).registerUser(userAnaRita);

                // Act
                const result = await userRegister.connect(signer1).existingAddress(userAnaRita.account);

                // Assert
                expect(result).to.equal(true);
            });
        });
        describe("when the address doesn't exist", function(){
            it ("should return false ", async function(){
                // Arrange
                const { userRegister, signer1, userAnaRita } = await loadFixture(deployContractAndSetVariables);  

                // Act
                const result = await userRegister.connect(signer1).existingAddress(userAnaRita.account);

                // Assert
                expect(result).to.equal(false);
            });
        });
    });

    describe("existingUserName", function(){
        describe("when the user name is in use", function(){
            it("should return true", async function(){
                // Arrange
                const { userRegister, loginRegister, userAnaRita, signer1 } = await loadFixture(deployContractAndSetVariables);  
                await loginRegister.connect(signer1).registerUser(userAnaRita);

                // Act
                const result = await userRegister.connect(signer1).existingUserName(userAnaRita.userName);

                // Assert
                expect(result).to.equal(true);
            });
        });
        describe("when the user name is not in use", function(){
            it ("should return false", async function(){
                // Arrange
                const { userRegister, userAnaRita, signer1 } = await loadFixture(deployContractAndSetVariables); 

                // Act
                const result = await userRegister.connect(signer1).existingUserName(userAnaRita.userName);

                // Assert
                expect(result).to.equal(false);
            });
        });
    });
});