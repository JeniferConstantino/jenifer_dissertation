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

    describe("logsInUser", function(){
        describe("when the user is not logged in", function(){
            it("should set the user log status to true and start the session time", async function(){
                // Arrange       
                const { loginRegister, signer1 } = await loadFixture(deployContractAndSetVariables);    
                
                // Act
                const tx = await loginRegister.connect(signer1).logsInUser();
                await tx.wait();

                // Assert
                const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
                expect(receipt.status).to.equal(1); // 1 = success

                const userLogged = await loginRegister.connect(signer1).userLoggedIn(signer1);
                expect(userLogged).to.equal(true);
                const timeOutNotReached = await loginRegister.connect(signer1).noTimeOut(signer1);
                expect(timeOutNotReached).to.equal(true);
            });
        });
        describe("when the user is already logged in", function(){
            it ("should keep the user logged in and continue with the session time", async function(){
                // Arrange       
                const { loginRegister, signer1 } = await loadFixture(deployContractAndSetVariables);    
                await loginRegister.connect(signer1).logsInUser();

                // Act
                const tx = await loginRegister.connect(signer1).logsInUser();
                await tx.wait();

                // Assert
                const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
                expect(receipt.status).to.equal(1); // 1 = success

                const userLogged = await loginRegister.connect(signer1).userLoggedIn(signer1);
                expect(userLogged).to.equal(true);
                const timeOutNotReached = await loginRegister.connect(signer1).noTimeOut(signer1);
                expect(timeOutNotReached).to.equal(true);
            });
        });
    });

    // the "should store the user in the blockchain" is already tested in the class UserRegister.test.js 
    describe("registerUser", function(){
        describe("when a user is provided", function(){
            it("should set the logged status to true and start the session time", async function(){
                // Arrange       
                const { loginRegister, signer1, userAnaRita} = await loadFixture(deployContractAndSetVariables);    
                
                // Act
                const tx = await loginRegister.connect(signer1).registerUser(userAnaRita);
                await tx.wait();

                // Assert
                const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
                expect(receipt.status).to.equal(1); // 1 = success

                const userLogged = await loginRegister.connect(signer1).userLoggedIn(signer1);
                expect(userLogged).to.equal(true);
                const timeOutNotReached = await loginRegister.connect(signer1).noTimeOut(signer1);
                expect(timeOutNotReached).to.equal(true);
            });
        });
    });

    describe("logOutUser", function(){
        describe("when the user is logged in", function(){
            it("should set the users' logged state to false", async function(){
                // Arrange       
                const { loginRegister, signer1} = await loadFixture(deployContractAndSetVariables);    
                await loginRegister.connect(signer1).logsInUser();

                // Act
                const tx = await loginRegister.connect(signer1).logOutUser();
                await tx.wait();

                // Assert
                const userLogged = await loginRegister.connect(signer1).userLoggedIn(signer1);
                expect(userLogged).to.equal(false);
            });
        });
        describe("when the user is not logged in", function(){
            it("should maintain the users' logged state", async function(){
                // Arrange       
                const { loginRegister, signer1} = await loadFixture(deployContractAndSetVariables);    

                // Act
                const tx = await loginRegister.connect(signer1).logOutUser();
                await tx.wait();

                // Assert
                const userLogged = await loginRegister.connect(signer1).userLoggedIn(signer1);
                expect(userLogged).to.equal(false);
            });
        });
    });

    describe("userLoggedIn", function(){
        describe("when the user is logged", function(){
            it("should return true", async function(){
                // Arrange       
                const { loginRegister, signer1} = await loadFixture(deployContractAndSetVariables);    
                await loginRegister.connect(signer1).logsInUser();
                
                // Act
                const res = await loginRegister.connect(signer1).userLoggedIn(signer1);

                // Assert
                expect(res).to.equal(true);
            });
        });
        describe("when the user is not logged in", function(){
            it("should return false", async function(){
                // Arrange       
                const { loginRegister, signer1} = await loadFixture(deployContractAndSetVariables);    
                
                // Act
                const res = await loginRegister.connect(signer1).userLoggedIn(signer1);

                // Assert
                expect(res).to.equal(false);
            });
        });
    });

    describe("noTimeOut", function(){
        describe("when a session timeout hasn't been reached", function(){
            it("should return true", async function(){
                // Arrange       
                const { loginRegister, signer1} = await loadFixture(deployContractAndSetVariables);    
                await loginRegister.connect(signer1).logsInUser(); // starts counting time of the user

                // Act
                const res = await loginRegister.connect(signer1).noTimeOut(signer1);

                // Assert
                expect(res).to.equal(true);
            });
        });
        describe("when a session timeout has been reached", function(){
            it("should return false", async function(){
                // Arrange       
                const { loginRegister, signer1} = await loadFixture(deployContractAndSetVariables);    
                await loginRegister.connect(signer1).logsInUser();
                const TIMEOUT_LIMIT = await loginRegister.connect(signer1).getTimeOutLimit();
                    // Advance block timestamp by TIMEOUT_LIMIT seconds
                await network.provider.send("evm_increaseTime", [Number(TIMEOUT_LIMIT) + 6]); // evm_increaseTime allows to increase the timestamp of the current block by a specified number of seconds
                await network.provider.send("evm_mine");  // forces the block to be mined. Used with the evm_increaseTime to finalized the block with the uppdated timestamp

                // Act
                const res = await loginRegister.connect(signer1).noTimeOut(signer1);

                // Assert
                expect(res).to.equal(false);
            });
        });
    }); 
});