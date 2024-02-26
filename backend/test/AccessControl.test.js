const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");

describe("AccessControl", function () {

    // Like a BeforeEach
    async function deployContractAndSetVariables() {
        const Helper = await ethers.getContractFactory("Helper");
        let helperContract = await Helper.deploy().catch(error => {
            console.error("Error deploying FileRegister: ", error);
            process.exit(1);
        }); 

        const FileRegister = await ethers.getContractFactory("FileRegister");
        const fileRegisterContract = await FileRegister.deploy(helperContract.target); 

        const UserRegister = await ethers.getContractFactory("UserRegister");
        const userRegisterContract = await UserRegister.deploy(helperContract.target);
        
        const AccessControl = await ethers.getContractFactory("AccessControl");
        const accessControl = await AccessControl.deploy(fileRegisterContract.target, userRegisterContract.target, helperContract.target);

        const [signer1, signer2, signer3] = await ethers.getSigners(); // Get the first signer 

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

        const userAnaLuisa = {
            account: await signer3.getAddress(),  // address of the one executing the transaction
            userName: "Ana Luisa",
            publicKey: "publicKeyAnaLuisa",
            privateKey: "privatekeyAnaLuisa"
        };

        const fileAnaRita = {
            ipfsCID: "anaRitaIpfsCID1",        
            fileName: "anaRitaFile1.jpg",          
            owner: userAnaRita.account, // Ana Rita is the file owner             
            fileType: "image",           
            iv: "ivFileAnaRita",  
        };

        const fileAnaPaula = {
            ipfsCID: "anaPaulaIpfsCID2",        
            fileName: "anaPaulaFile1.jpg",          
            owner: userAnaPaula.account, // Ana Paula is the file owner             
            fileType: "image",           
            iv: "ivFileAnaPaula",  
        };

        return { fileRegisterContract, userRegisterContract, accessControl, userAnaRita, userAnaPaula, userAnaLuisa, fileAnaRita, fileAnaPaula, signer1, signer2, signer3 };
    }

    it ("Should upload if: the transaction executer is the same as the userAccount, he is the file owner, he is not already associated with the file, the file and the user exist, and fields are valid", async function(){
        // Arrange
        const { fileRegisterContract, userRegisterContract, accessControl, userAnaRita, fileAnaRita, signer1 } = await loadFixture(deployContractAndSetVariables);
        const encSymmetricKey = "encSymmetricKeyFileAnaRita";
        userRegisterContract.connect(signer1).userRegistered(userAnaRita);
        fileRegisterContract.connect(signer1).addFile(fileAnaRita);

        // Act
        const tx = await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita.ipfsCID, encSymmetricKey);
        await tx.wait();

        // Assert
        const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
        expect(receipt.status).to.equal(1); // 1 = success

        const resEcSymmetricKey = await accessControl.connect(signer1).getEncSymmetricKeyFileUser(userAnaRita.account, fileAnaRita.ipfsCID);
        expect(resEcSymmetricKey.success).to.equal(true);       
        expect(resEcSymmetricKey.resultString).to.equal(encSymmetricKey);
        
        const resPermissions = await accessControl.getPermissionsOverFile(userAnaRita.account, fileAnaRita.ipfsCID);
        expect(resPermissions.success).to.equal(true);
        expect(resPermissions.resultStrings).to.deep.equal(["share", "download", "delete"]);
        
        const userAssociatedWithFile = await accessControl.userAssociatedWithFile(userAnaRita.account, fileAnaRita.ipfsCID);
        expect(userAssociatedWithFile).to.equal(true);
    });

    it ("Shouldn't upload if the file doesn't exist", async function(){
        // Arrange
        const { userRegisterContract, accessControl, userAnaRita, fileAnaRita, signer1 } = await loadFixture(deployContractAndSetVariables);
        const encSymmetricKey = "encSymmetricKeyFileAnaRita";
        userRegisterContract.userRegistered(userAnaRita);

        // Act
        const tx = await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita.ipfsCID, encSymmetricKey);
        await tx.wait();

        // Assert
        const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
        expect(receipt.status).to.equal(1); // 1 = success
        
        const userAssociatedWithFile = await accessControl.userAssociatedWithFile(userAnaRita.account, fileAnaRita.ipfsCID);
        expect(userAssociatedWithFile).to.equal(false);
    });

    it ("Shouldn't upload if the user doesn't exist", async function(){
        // Arrange
        const { fileRegisterContract, accessControl, userAnaRita, fileAnaRita, signer1 } = await loadFixture(deployContractAndSetVariables);
        const encSymmetricKey = "encSymmetricKeyFileAnaRita";
        fileRegisterContract.addFile(fileAnaRita);

        // Act
        const tx = await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita.ipfsCID, encSymmetricKey);
        await tx.wait();

        // Assert
        const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
        expect(receipt.status).to.equal(1); // 1 = success
        
        const userAssociatedWithFile = await accessControl.userAssociatedWithFile(userAnaRita.account, fileAnaRita.ipfsCID);
        expect(userAssociatedWithFile).to.equal(false);
    });

    it ("Shouldn't upload if the transaction executer isn't the same as the userAccount", async function(){
        // Arrange
        const { fileRegisterContract, userRegisterContract, accessControl, userAnaRita, fileAnaRita, signer2 } = await loadFixture(deployContractAndSetVariables);
        const encSymmetricKey = "encSymmetricKeyFileAnaRita";
        userRegisterContract.userRegistered(userAnaRita);
        fileRegisterContract.addFile(fileAnaRita);

        // Act
        const tx = await accessControl.connect(signer2).uploadFile(userAnaRita.account, fileAnaRita.ipfsCID, encSymmetricKey);
        await tx.wait();

        // Assert
        const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
        expect(receipt.status).to.equal(1); // 1 = success
        
        const userAssociatedWithFile = await accessControl.userAssociatedWithFile(userAnaRita.account, fileAnaRita.ipfsCID);
        expect(userAssociatedWithFile).to.equal(false);
    });

    it ("Shouldn't upload if the transaction executer isn't the file owner", async function(){
        // Arrange
        const { fileRegisterContract, userRegisterContract, accessControl, userAnaRita, fileAnaPaula, signer1 } = await loadFixture(deployContractAndSetVariables);
        const encSymmetricKey = "encSymmetricKeyFileAnaRita";
        userRegisterContract.userRegistered(userAnaRita);
        fileRegisterContract.addFile(fileAnaPaula);

        // Act
        const tx = await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaPaula.ipfsCID, encSymmetricKey);
        await tx.wait();

        // Assert
        const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
        expect(receipt.status).to.equal(1); // 1 = success
        
        const userAssociatedWithFile = await accessControl.connect(signer1).userAssociatedWithFile(userAnaRita.account, fileAnaPaula.ipfsCID);
        expect(userAssociatedWithFile).to.equal(false);
    });

    it ("Shouldn't upload if the transaction executer is already associated with the file", async function(){
        // Arrange
        const { fileRegisterContract, userRegisterContract, accessControl, userAnaRita, fileAnaRita, signer1 } = await loadFixture(deployContractAndSetVariables);
        const encSymmetricKey = "encSymmetricKeyFileAnaRita";
        const newEncSymmetricKey = "encSymmetricKeyNewFileAnaRitaUpload";
        userRegisterContract.userRegistered(userAnaRita);
        fileRegisterContract.addFile(fileAnaRita);
        await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita.ipfsCID, encSymmetricKey); // Associates with the file

        // Act
        const tx = await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita.ipfsCID, newEncSymmetricKey); // tries to execute the same action
        await tx.wait();

        // Assert
        const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
        expect(receipt.status).to.equal(1); // 1 = success
        
        const resEcSymmetricKey = await accessControl.getEncSymmetricKeyFileUser(userAnaRita.account, fileAnaRita.ipfsCID);
        expect(resEcSymmetricKey.success).to.equal(true);       
        expect(resEcSymmetricKey.resultString).to.equal(encSymmetricKey); // Encryption key keeps the same as the 1st upload

        const userAssociatedWithFile = await accessControl.userAssociatedWithFile(userAnaRita.account, fileAnaRita.ipfsCID);
        expect(userAssociatedWithFile).to.equal(true);
    });

    it ("Should share if: user to share != transaction executer, user != file owner, user not associated with the file, transaction executer has share permissions over the file, file and user exist, and valid fields", async function(){
        // Arrange
        const { fileRegisterContract, userRegisterContract, accessControl, userAnaPaula, userAnaRita, fileAnaPaula, signer2, signer1 } = await loadFixture(deployContractAndSetVariables);
        const encSymmetricKey = "encSymmetricKeyFileAnaPaula";
        await userRegisterContract.connect(signer2).userRegistered(userAnaPaula); // Register the user
        await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user
        await fileRegisterContract.connect(signer2).addFile(fileAnaPaula); // Add the file
        await accessControl.connect(signer2).uploadFile(userAnaPaula.account, fileAnaPaula.ipfsCID, encSymmetricKey); // uploads the file so the signe2 has "share" permissions

        // Act
        const tx = await accessControl.connect(signer2).shareFile(userAnaRita.account, fileAnaPaula.ipfsCID, encSymmetricKey, ["download", "delete"]);
        await tx.wait();

        // Assert
        const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
        expect(receipt.status).to.equal(1); // 1 = success

        const isUserAssociatedAfterUpload = await accessControl.connect(signer1).userAssociatedWithFile(userAnaRita.account, fileAnaPaula.ipfsCID);
        expect(isUserAssociatedAfterUpload).to.equal(true);

        const resPermissions = await accessControl.connect(signer1).getPermissionsOverFile(userAnaRita.account, fileAnaPaula.ipfsCID);
        expect(resPermissions.success).to.equal(true);
        expect(resPermissions.resultStrings).to.deep.equal(["download", "delete"]);
    });

    it ("Shouldn't share if file doesn't exist", async function(){
        // Arrange
        const { userRegisterContract, accessControl, userAnaPaula, userAnaRita, fileAnaPaula, signer2, signer1 } = await loadFixture(deployContractAndSetVariables);
        const encSymmetricKey = "encSymmetricKeyFileAnaPaula";
        await userRegisterContract.connect(signer2).userRegistered(userAnaPaula); // Register the user
        await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user
        await accessControl.connect(signer2).uploadFile(userAnaPaula.account, fileAnaPaula.ipfsCID, encSymmetricKey); // uploads the file so the signe2 has "share" permissions

        // Act
        const tx = await accessControl.connect(signer2).shareFile(userAnaRita.account, fileAnaPaula.ipfsCID, encSymmetricKey, ["download", "delete"]);
        await tx.wait();

        // Assert
        const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
        expect(receipt.status).to.equal(1); // 1 = success

        const isUserAssociatedAfterUpload = await accessControl.connect(signer1).userAssociatedWithFile(userAnaRita.account, fileAnaPaula.ipfsCID);
        expect(isUserAssociatedAfterUpload).to.equal(false);
    });

    it ("Shouldn't share if user doesn't exist", async function(){
        // Arrange
        const { fileRegisterContract, userRegisterContract, accessControl, userAnaPaula, userAnaRita, fileAnaPaula, signer2, signer1 } = await loadFixture(deployContractAndSetVariables);
        const encSymmetricKey = "encSymmetricKeyFileAnaPaula";
        await userRegisterContract.connect(signer2).userRegistered(userAnaPaula); // Register the user
        await fileRegisterContract.connect(signer2).addFile(fileAnaPaula); // Add the file
        await accessControl.connect(signer2).uploadFile(userAnaPaula.account, fileAnaPaula.ipfsCID, encSymmetricKey); // uploads the file so the signe2 has "share" permissions

        // Act
        const tx = await accessControl.connect(signer2).shareFile(userAnaRita.account, fileAnaPaula.ipfsCID, encSymmetricKey, ["download", "delete"]);
        await tx.wait();

        // Assert
        const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
        expect(receipt.status).to.equal(1); // 1 = success

        const isUserAssociatedAfterUpload = await accessControl.connect(signer1).userAssociatedWithFile(userAnaRita.account, fileAnaPaula.ipfsCID);
        expect(isUserAssociatedAfterUpload).to.equal(false);
    });

    it ("Shouldn't share if the user to share the file with is the same as the transaction executer", async function(){
        // Arrange
        const { fileRegisterContract, userRegisterContract, accessControl, userAnaPaula, userAnaRita, fileAnaRita, signer2, signer1 } = await loadFixture(deployContractAndSetVariables);
        const encSymmetricKey = "encSymmetricKeyFileAnaRita";
        await userRegisterContract.connect(signer2).userRegistered(userAnaPaula); // Register the user
        await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user
        await fileRegisterContract.connect(signer1).addFile(fileAnaRita);        // Add Ana Rita File

        await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita.ipfsCID, encSymmetricKey); // Ana Rita owner of the file
        await accessControl.connect(signer1).shareFile(userAnaPaula.account, fileAnaRita.ipfsCID, encSymmetricKey, ["download", "share"]); // Ana Rita shares the fie with Ana Paula

        // Act - userAnaPaula tries to give herself more permissions over fileAnaRita 
        const tx = await accessControl.connect(signer2).shareFile(userAnaPaula.account, fileAnaRita.ipfsCID, encSymmetricKey, ["download", "delete", "share"]);
        await tx.wait();

        // Assert
        const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
        expect(receipt.status).to.equal(1); // 1 = success

        const isUserAssociatedAfterUpload = await accessControl.connect(signer2).userAssociatedWithFile(userAnaPaula.account, fileAnaRita.ipfsCID);
        expect(isUserAssociatedAfterUpload).to.equal(true);

        const resPermissions = await accessControl.connect(signer2).getPermissionsOverFile(userAnaPaula.account, fileAnaRita.ipfsCID);
        expect(resPermissions.success).to.equal(true);
        expect(resPermissions.resultStrings).to.deep.equal(["download", "share"]); // Permission share was not added
    });

    it ("Shouldn't share if the user to share the file with is the same as the file owner", async function(){
        // Arrange
        const { fileRegisterContract, userRegisterContract, accessControl, userAnaPaula, userAnaRita, fileAnaRita, signer2, signer1 } = await loadFixture(deployContractAndSetVariables);
        const encSymmetricKey = "encSymmetricKeyFileAnaRita";
        await userRegisterContract.connect(signer2).userRegistered(userAnaPaula); // Register the user
        await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user
        await fileRegisterContract.connect(signer1).addFile(fileAnaRita);        // Add Ana Rita File

        await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita.ipfsCID, encSymmetricKey); // Ana Rita owner of the file
        await accessControl.connect(signer1).shareFile(userAnaPaula.account, fileAnaRita.ipfsCID, encSymmetricKey, ["download", "delete", "share"]); // Ana Rita shares the fie with Ana Paula

        // Act - userAnaPaula tries to take all the owners permission over the file
        const tx = await accessControl.connect(signer2).shareFile(userAnaRita.account, fileAnaRita.ipfsCID, encSymmetricKey, []);
        await tx.wait();

        // Assert
        const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
        expect(receipt.status).to.equal(1); // 1 = success

        const isUserAssociatedAfterUpload = await accessControl.connect(signer1).userAssociatedWithFile(userAnaRita.account, fileAnaRita.ipfsCID);
        expect(isUserAssociatedAfterUpload).to.equal(true);

        const resPermissions = await accessControl.connect(signer1).getPermissionsOverFile(userAnaRita.account, fileAnaRita.ipfsCID);
        expect(resPermissions.success).to.equal(true);
        expect(resPermissions.resultStrings).to.deep.equal(["share", "download", "delete"]); // Permission share was not added
    });

    it ("Shouldn't share if the user to share the file with is already associated with the file", async function(){
        // Arrange
        const { fileRegisterContract, userRegisterContract, accessControl, userAnaPaula, userAnaRita, fileAnaPaula, signer2, signer1 } = await loadFixture(deployContractAndSetVariables);
        const encSymmetricKey = "encSymmetricKeyFileAnaPaula";
        await userRegisterContract.connect(signer2).userRegistered(userAnaPaula); // Register the user
        await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user
        await fileRegisterContract.connect(signer2).addFile(fileAnaPaula); // Add the file
        await accessControl.connect(signer2).uploadFile(userAnaPaula.account, fileAnaPaula.ipfsCID, encSymmetricKey); // uploads the file so the signe2 has "share" permissions
        await accessControl.connect(signer2).shareFile(userAnaRita.account, fileAnaPaula.ipfsCID, encSymmetricKey, ["download", "delete"]);

        // Act - tries to update the file permissions by calling agian the shareFile
        const tx = await accessControl.connect(signer2).shareFile(userAnaRita.account, fileAnaPaula.ipfsCID, encSymmetricKey, ["download"]);
        await tx.wait();

        // Assert
        const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
        expect(receipt.status).to.equal(1); // 1 = success

        const isUserAssociatedAfterUpload = await accessControl.connect(signer1).userAssociatedWithFile(userAnaRita.account, fileAnaPaula.ipfsCID);
        expect(isUserAssociatedAfterUpload).to.equal(true);

        const resPermissions = await accessControl.connect(signer1).getPermissionsOverFile(userAnaRita.account, fileAnaPaula.ipfsCID);
        expect(resPermissions.success).to.equal(true);
        expect(resPermissions.resultStrings).to.deep.equal(["download", "delete"]); // No efect o the try to update the files' permissions
    });

    it ("Shouldn't share if transaction executer doesn't have share permissions over the file", async function(){
        // Arrange
        const { fileRegisterContract, userRegisterContract, accessControl, userAnaPaula, userAnaRita, userAnaLuisa, fileAnaRita, signer2, signer1, signer3 } = await loadFixture(deployContractAndSetVariables);
        const encSymmetricKey = "encSymmetricKeyFileAnaRita";
        await userRegisterContract.connect(signer2).userRegistered(userAnaPaula); // Register the user
        await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user
        await userRegisterContract.connect(signer3).userRegistered(userAnaLuisa); // Register the user
        await fileRegisterContract.connect(signer1).addFile(fileAnaRita);        // Add Ana Rita File

        await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita.ipfsCID, encSymmetricKey); // Ana Rita owner of the file
        await accessControl.connect(signer1).shareFile(userAnaPaula.account, fileAnaRita.ipfsCID, encSymmetricKey, ["download", "delete"]); // Ana Rita shares the fie with Ana Paula

        // Act - userAnaPaula tries to take all the owners permission over the file
        const tx = await accessControl.connect(signer2).shareFile(userAnaLuisa.account, fileAnaRita.ipfsCID, encSymmetricKey, ["download"]);
        await tx.wait();

        // Assert
        const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
        expect(receipt.status).to.equal(1); // 1 = success

        const isUserAssociatedAfterUpload = await accessControl.connect(signer3).userAssociatedWithFile(userAnaLuisa.account, fileAnaRita.ipfsCID);
        expect(isUserAssociatedAfterUpload).to.equal(false);
    });


    it("Should update the users' permissions if the transaction executer is not the user, has share permissions and the user is not the file owner", async function() {
        // Arrange
        const { fileRegisterContract, userRegisterContract, accessControl, userAnaPaula, userAnaRita, fileAnaRita, signer1, signer2 } = await loadFixture(deployContractAndSetVariables);
        const encSymmetricKey = "encSymmetricKeyFileAnaRita";
        await userRegisterContract.connect(signer2).userRegistered(userAnaPaula); // Register the user
        await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user
        await fileRegisterContract.connect(signer1).addFile(fileAnaRita);        // Add Ana Rita File

        await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita.ipfsCID, encSymmetricKey); // Ana Rita owner of the file
        await accessControl.connect(signer1).shareFile(userAnaPaula.account, fileAnaRita.ipfsCID, encSymmetricKey, ["download", "delete"]); // Ana Rita shares the fie with Ana Paula

        // Act
        const tx = await accessControl.connect(signer1).updateUserFilePermissions(userAnaPaula.account, fileAnaRita.ipfsCID, ["download"]);
        await tx.wait();

        // Assert
        const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
        expect(receipt.status).to.equal(1); // 1 = success

        const isUserAssociatedAfterUpload = await accessControl.connect(signer2).userAssociatedWithFile(userAnaPaula.account, fileAnaRita.ipfsCID);
        expect(isUserAssociatedAfterUpload).to.equal(true);

        const resPermissions = await accessControl.connect(signer2).getPermissionsOverFile(userAnaPaula.account, fileAnaRita.ipfsCID);
        expect(resPermissions.success).to.equal(true);
        expect(resPermissions.resultStrings).to.deep.equal(["download"]); // Permission share was not added
    });

    it("Shouldn't update the users' permissions if the transaction executer is the user", async function() {
        // Arrange
        const { fileRegisterContract, userRegisterContract, accessControl, userAnaPaula, userAnaRita, fileAnaRita, signer2, signer1 } = await loadFixture(deployContractAndSetVariables);
        const encSymmetricKey = "encSymmetricKeyFileAnaRita";
        await userRegisterContract.connect(signer2).userRegistered(userAnaPaula); // Register the user
        await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user
        await fileRegisterContract.connect(signer1).addFile(fileAnaRita);        // Add Ana Rita File

        await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita.ipfsCID, encSymmetricKey); // Ana Rita owner of the file
        await accessControl.connect(signer1).shareFile(userAnaPaula.account, fileAnaRita.ipfsCID, encSymmetricKey, ["download", "share"]); // Ana Rita shares the fie with Ana Paula

        // Act - userAnaPaula tries to update her own permissions
        const tx = await accessControl.connect(signer2).updateUserFilePermissions(userAnaPaula.account, fileAnaRita.ipfsCID, ["download", "delete", "share"]);
        await tx.wait();

        // Assert
        const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
        expect(receipt.status).to.equal(1); // 1 = success

        const isUserAssociatedAfterUpload = await accessControl.connect(signer2).userAssociatedWithFile(userAnaPaula.account, fileAnaRita.ipfsCID);
        expect(isUserAssociatedAfterUpload).to.equal(true);

        const resPermissions = await accessControl.connect(signer2).getPermissionsOverFile(userAnaPaula.account, fileAnaRita.ipfsCID);
        expect(resPermissions.success).to.equal(true);
        expect(resPermissions.resultStrings).to.deep.equal(["download", "share"]); // Permission delete was not added
    });

    it("Should't update the users' permissions if the transaction executer doesn't have share permissions", async function() {
        // Arrange
        const { fileRegisterContract, userRegisterContract, accessControl, userAnaPaula, userAnaRita, userAnaLuisa, fileAnaRita, signer2, signer1, signer3 } = await loadFixture(deployContractAndSetVariables);
        const encSymmetricKey = "encSymmetricKeyFileAnaRita";
        await userRegisterContract.connect(signer2).userRegistered(userAnaPaula); // Register the user
        await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user
        await userRegisterContract.connect(signer3).userRegistered(userAnaLuisa); // Register the user
        await fileRegisterContract.connect(signer1).addFile(fileAnaRita);        // Add Ana Rita File

        await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita.ipfsCID, encSymmetricKey); // Ana Rita owner of the file
        await accessControl.connect(signer1).shareFile(userAnaPaula.account, fileAnaRita.ipfsCID, encSymmetricKey, ["download", "delete"]); // Ana Rita shares the fie with Ana Paula
        await accessControl.connect(signer1).shareFile(userAnaLuisa.account, fileAnaRita.ipfsCID, encSymmetricKey, ["download", "share"]); // Ana Rita shares the fie with Ana Paula

        // Act - userAnaPaula tries to update permissions of another user
        const tx = await accessControl.connect(signer2).updateUserFilePermissions(userAnaLuisa.account, fileAnaRita.ipfsCID, ["download", "delete"]);
        await tx.wait();

        // Assert
        const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
        expect(receipt.status).to.equal(1); // 1 = success

        const isUserAssociatedAfterUpload = await accessControl.connect(signer3).userAssociatedWithFile(userAnaLuisa.account, fileAnaRita.ipfsCID);
        expect(isUserAssociatedAfterUpload).to.equal(true);

        const resPermissions = await accessControl.connect(signer3).getPermissionsOverFile(userAnaLuisa.account, fileAnaRita.ipfsCID);
        expect(resPermissions.success).to.equal(true);
        expect(resPermissions.resultStrings).to.deep.equal(["download", "share"]); // Permission share was not excahnged for the delete
    });

    it("Should update the users' permissions if the user is the file owner", async function() {
        // Arrange
        const { fileRegisterContract, userRegisterContract, accessControl, userAnaPaula, userAnaRita, fileAnaRita, signer2, signer1 } = await loadFixture(deployContractAndSetVariables);
        const encSymmetricKey = "encSymmetricKeyFileAnaRita";
        await userRegisterContract.connect(signer2).userRegistered(userAnaPaula); // Register the user
        await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user
        await fileRegisterContract.connect(signer1).addFile(fileAnaRita);        // Add Ana Rita File

        await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita.ipfsCID, encSymmetricKey); // Ana Rita owner of the file
        await accessControl.connect(signer1).shareFile(userAnaPaula.account, fileAnaRita.ipfsCID, encSymmetricKey, ["download", "share"]); // Ana Rita shares the fie with Ana Paula

        // Act - userAnaPaula tries to update the file owner permissions
        const tx = await accessControl.connect(signer2).updateUserFilePermissions(userAnaRita.account, fileAnaRita.ipfsCID, []);
        await tx.wait();

        // Assert
        const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
        expect(receipt.status).to.equal(1); // 1 = success

        const isUserAssociatedAfterUpload = await accessControl.connect(signer1).userAssociatedWithFile(userAnaRita.account, fileAnaRita.ipfsCID);
        expect(isUserAssociatedAfterUpload).to.equal(true);

        const resPermissions = await accessControl.connect(signer1).getPermissionsOverFile(userAnaRita.account, fileAnaRita.ipfsCID);
        expect(resPermissions.success).to.equal(true);
        expect(resPermissions.resultStrings).to.deep.equal(["share", "download", "delete"]); // Permission delete was not added
    });

    it("Should get success=true and the users' encrypted symmetric key, if the user is associated with the file and the transaction executer is the same as the user", async function() {
        // Arrange        
        const { accessControl, userRegisterContract, fileRegisterContract, fileAnaRita, userAnaRita, signer1 } = await loadFixture(deployContractAndSetVariables);
        const encSymmetricKey = "encSymmetricKeyFileAnaRita";
        await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user
        await fileRegisterContract.connect(signer1).addFile(fileAnaRita);        // Add Ana Rita File

        await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita.ipfsCID, encSymmetricKey); // Ana Rita owner of the file
        
        // Act
        const result = await accessControl.connect(signer1).getEncSymmetricKeyFileUser(userAnaRita.account, fileAnaRita.ipfsCID);

        // Assert
        expect(result.success).to.equal(true);
        expect(result.resultString).to.equal(encSymmetricKey);
    });

    it("Should get success=false and no users' encrypted symmetric key, if the user is associated with the file but the transaction executer is not the same as the user", async function() {
        // Arrange        
        const { accessControl, userRegisterContract, fileRegisterContract, userAnaRita, userAnaPaula, fileAnaRita, signer1, signer2 } = await loadFixture(deployContractAndSetVariables);
        const encSymmetricKey = "encSymmetricKeyFileAnaRita";
        await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user
        await userRegisterContract.connect(signer2).userRegistered(userAnaPaula); // Register the user
        await fileRegisterContract.connect(signer1).addFile(fileAnaRita);        // Add Ana Rita File
        
        await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita.ipfsCID, encSymmetricKey); // Ana Rita owner of the file

        // Act
        const result = await accessControl.connect(signer2).getEncSymmetricKeyFileUser(userAnaRita.account, fileAnaRita.ipfsCID);

        // Assert
        expect(result.success).to.equal(false);
        expect(result.resultString).to.equal("");
    });

    it("Should get success=false and no users' encrypted symmetric key, if the user is not associated with the file but the transaction executer is the same as the user", async function() {
        // Arrange        
        const { accessControl, userRegisterContract, fileRegisterContract, userAnaRita, userAnaPaula, fileAnaRita, signer1, signer2 } = await loadFixture(deployContractAndSetVariables);
        const encSymmetricKey = "encSymmetricKeyFileAnaRita";
        await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user
        await userRegisterContract.connect(signer2).userRegistered(userAnaPaula); // Register the user
        await fileRegisterContract.connect(signer1).addFile(fileAnaRita);        // Add Ana Rita File
        
        await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita.ipfsCID, encSymmetricKey); // Ana Rita owner of the file

        // Act
        const result = await accessControl.connect(signer2).getEncSymmetricKeyFileUser(userAnaPaula.account, fileAnaRita.ipfsCID);

        // Assert
        expect(result.success).to.equal(false);
        expect(result.resultString).to.equal("");
    });

    it("Should get success=true and the users' permission over a file, if the user is associated with the file and the transaction executer is the same as the user", async function() {
        // Arrange        
        const { accessControl, userRegisterContract, fileRegisterContract, userAnaRita, fileAnaRita, signer1 } = await loadFixture(deployContractAndSetVariables);
        const encSymmetricKey = "encSymmetricKeyFileAnaRita";
        await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user
        await fileRegisterContract.connect(signer1).addFile(fileAnaRita);        // Add Ana Rita File

        await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita.ipfsCID, encSymmetricKey); // Ana Rita owner of the file
        
        // Act
        const result = await accessControl.connect(signer1).getPermissionsOverFile(userAnaRita.account, fileAnaRita.ipfsCID);

        // Assert
        expect(result.success).to.equal(true);
        expect(result.resultStrings).to.deep.equal(["share", "download", "delete"]);
    });

    it("Should get success=false and no users' permission over a file, if the user is associated with the file, and the transaction executer isn't the same as the user", async function() {
        // Arrange        
        const { accessControl, userRegisterContract, fileRegisterContract, userAnaRita, userAnaPaula, fileAnaRita, signer1, signer2 } = await loadFixture(deployContractAndSetVariables);
        const encSymmetricKey = "encSymmetricKeyFileAnaRita";
        await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user
        await userRegisterContract.connect(signer2).userRegistered(userAnaPaula); // Register the user
        await fileRegisterContract.connect(signer1).addFile(fileAnaRita);        // Add Ana Rita File

        await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita.ipfsCID, encSymmetricKey); // Ana Rita owner of the file
        
        // Act
        const result = await accessControl.connect(signer2).getPermissionsOverFile(userAnaRita.account, fileAnaRita.ipfsCID);

        // Assert
        expect(result.success).to.equal(false);
        expect(result.resultStrings).to.deep.equal([]);
    });

    it("Should get success=false and no users' permission over a file, if the user is not associated with the file, and the transaction executer is the same as the user", async function(){
        // Arrange        
        const { accessControl, userRegisterContract, fileRegisterContract, userAnaRita, userAnaPaula, fileAnaRita, signer1, signer2 } = await loadFixture(deployContractAndSetVariables);
        const encSymmetricKey = "encSymmetricKeyFileAnaRita";
        await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user
        await userRegisterContract.connect(signer2).userRegistered(userAnaPaula); // Register the user
        await fileRegisterContract.connect(signer1).addFile(fileAnaRita);        // Add Ana Rita File

        await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita.ipfsCID, encSymmetricKey); // Ana Rita owner of the file
        
        // Act
        const result = await accessControl.connect(signer2).getPermissionsOverFile(userAnaPaula.account, fileAnaRita.ipfsCID);

        // Assert
        expect(result.success).to.equal(false);
        expect(result.resultStrings).to.deep.equal([]);
    })

    it("Should return success=true and the users' files, if the transaction executer is the same as the user", async function() {
        // Arrange        
        const { fileRegisterContract, userRegisterContract, accessControl, userAnaRita, userAnaPaula, fileAnaRita, fileAnaPaula, signer1, signer2 } = await loadFixture(deployContractAndSetVariables);
        const encSymmetricKeyAnaRita = "encSymmetricKeyFileAnaRita";
        const encSymmetricKeyAnaPaula = "encSymmetricKeyFileAnaPaula";
            
            // Adiciona os files à lista de files
        fileRegisterContract.connect(signer1).addFile(fileAnaRita);
        fileRegisterContract.connect(signer2).addFile(fileAnaPaula);

            // Adiona users à lista de users
        await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user
        await userRegisterContract.connect(signer2).userRegistered(userAnaPaula); // Register the user
    

            // User uploads files
        await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita.ipfsCID, encSymmetricKeyAnaRita); // Ana Rita owner of the file
        await accessControl.connect(signer2).uploadFile(userAnaPaula.account, fileAnaPaula.ipfsCID, encSymmetricKeyAnaPaula); // Ana Rita owner of the file

        // Act
        const result = await accessControl.connect(signer1).getUserFiles(userAnaRita.account);
        
        // Assert
        expect(result.success).to.equal(true);
        expect(result.files[0].ipfsCID).to.equal(fileAnaRita.ipfsCID);
        expect(result.files.length).to.equal(1);
    });

    it("Should return success=false and no users' files, if the transaction executer is different from the user", async function() {
        // Arrange        
        const { fileRegisterContract, userRegisterContract, accessControl, userAnaRita, userAnaPaula, fileAnaRita, fileAnaPaula, signer1, signer2 } = await loadFixture(deployContractAndSetVariables);
        const encSymmetricKeyAnaRita = "encSymmetricKeyFileAnaRita";
        const encSymmetricKeyAnaPaula = "encSymmetricKeyFileAnaPaula";
            
            // Adiciona os files à lista de files
        fileRegisterContract.connect(signer1).addFile(fileAnaRita);
        fileRegisterContract.connect(signer2).addFile(fileAnaPaula);

            // Adiona users à lista de users
        await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user
        await userRegisterContract.connect(signer2).userRegistered(userAnaPaula); // Register the user
    

            // User uploads files
        await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita.ipfsCID, encSymmetricKeyAnaRita); // Ana Rita owner of the file
        await accessControl.connect(signer2).uploadFile(userAnaPaula.account, fileAnaPaula.ipfsCID, encSymmetricKeyAnaPaula); // Ana Rita owner of the file

        // Act - trying to get the userAnaPaula files
        const result = await accessControl.connect(signer1).getUserFiles(userAnaPaula.account);
        
        // Assert
        expect(result.success).to.equal(false);
        expect(result.files.length).to.equal(0);
    });

    it("Should return true if a user has permissions over a file", async function () {
        // Arrange
        const { accessControl, userRegisterContract, fileRegisterContract, fileAnaRita, userAnaRita, signer1 } = await loadFixture(deployContractAndSetVariables);   
        const encSymmetricKey = "encSymmetricKeyFileAnaRita";
        await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user
        await fileRegisterContract.connect(signer1).addFile(fileAnaRita);        // Add Ana Rita File

        await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita.ipfsCID, encSymmetricKey); // Ana Rita owner of the file
                
        // Act 
        const result = await accessControl.connect(signer1).userHasSharePermissionOverFile(userAnaRita.account, fileAnaRita.ipfsCID);

        // Assert 
        expect(result).to.equal(true);
    });
    
    it("Should return false if a user doesn't have permissions over a file", async function () {
        // Arrange
        const { accessControl, userRegisterContract, fileRegisterContract, fileAnaRita, userAnaPaula, userAnaRita, userAnaLuisa, signer1, signer2, signer3 } = await loadFixture(deployContractAndSetVariables);   
        const encSymmetricKey = "encSymmetricKeyFileAnaRita";
        await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user
        await userRegisterContract.connect(signer2).userRegistered(userAnaPaula); // Register the user
        await userRegisterContract.connect(signer3).userRegistered(userAnaLuisa); // Register the user
        await fileRegisterContract.connect(signer1).addFile(fileAnaRita);        // Add Ana Rita File

        await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita.ipfsCID, encSymmetricKey); // Ana Rita owner of the file
        await accessControl.connect(signer1).shareFile(userAnaPaula.account, fileAnaRita.ipfsCID, encSymmetricKey, ["delete"]);
        
        // Act 
        const result = await accessControl.connect(signer1).userHasSharePermissionOverFile(userAnaPaula.account, fileAnaRita.ipfsCID);

        // Assert 
        expect(result).to.equal(false);
    });

    it("Should return true if the user is already associated with the file and the transaction executer is associated with the file", async function() {     
        // Arrange        
        const { accessControl, userRegisterContract, fileRegisterContract, userAnaRita, fileAnaRita, signer1 } = await loadFixture(deployContractAndSetVariables);
        const encSymmetricKey = "encSymmetricKeyFileAnaRita";
        await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user
        await fileRegisterContract.connect(signer1).addFile(fileAnaRita);        // Add Ana Rita File

        await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita.ipfsCID, encSymmetricKey); // Ana Rita owner of the file
        
        // Act
        const result = await accessControl.connect(signer1).userAssociatedWithFile(userAnaRita.account, fileAnaRita.ipfsCID);        

        // Assert
        expect(result).to.equal(true);
    });

    it("Should return false if the user is associated with the file and the transaction executer isn't", async function() {
        // Arrange        
        const { accessControl, userRegisterContract, fileRegisterContract, userAnaRita, userAnaPaula, fileAnaRita, signer1, signer2} = await loadFixture(deployContractAndSetVariables);
        const encSymmetricKey = "encSymmetricKeyFileAnaRita";
        await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user
        await userRegisterContract.connect(signer2).userRegistered(userAnaPaula); // Register the user
        await fileRegisterContract.connect(signer1).addFile(fileAnaRita);        // Add Ana Rita File

        await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita.ipfsCID, encSymmetricKey); // Ana Rita owner of the file
        
        // Act
        const result = await accessControl.connect(signer2).userAssociatedWithFile(userAnaRita.account, fileAnaRita.ipfsCID);        

        // Assert
        expect(result).to.equal(false);
    });

    it("Should return false if the user is not associated with the file and the transaction executer is", async function() {
        // Arrange        
        const { accessControl, userRegisterContract, fileRegisterContract, userAnaRita, userAnaPaula, fileAnaRita, signer1, signer2} = await loadFixture(deployContractAndSetVariables);
        const encSymmetricKey = "encSymmetricKeyFileAnaRita";
        await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user
        await userRegisterContract.connect(signer2).userRegistered(userAnaPaula); // Register the user
        await fileRegisterContract.connect(signer1).addFile(fileAnaRita);        // Add Ana Rita File

        await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita.ipfsCID, encSymmetricKey); // Ana Rita owner of the file
        
        // Act
        const result = await accessControl.connect(signer1).userAssociatedWithFile(userAnaPaula.account, fileAnaRita.ipfsCID);        

        // Assert
        expect(result).to.equal(false);
    });

    it("Should return true if the message sender is associated with the file", async function() {
        // Arrange        
        const { accessControl, userRegisterContract, fileRegisterContract, userAnaRita, fileAnaRita, signer1} = await loadFixture(deployContractAndSetVariables);
        const encSymmetricKey = "encSymmetricKeyFileAnaRita";
        await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user
        await fileRegisterContract.connect(signer1).addFile(fileAnaRita);        // Add Ana Rita File

        await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita.ipfsCID, encSymmetricKey); // Ana Rita owner of the file
        
        // Act
        const result = await accessControl.connect(signer1).messageSenderAssociatedToFile(fileAnaRita.ipfsCID);        

        // Assert
        expect(result).to.equal(true);
    });

    it("Should return false if the message sender is not associated with the file", async function() {
        // Arrange        
        const { accessControl, userRegisterContract, fileRegisterContract, userAnaRita, fileAnaRita, signer1, signer2} = await loadFixture(deployContractAndSetVariables);
        const encSymmetricKey = "encSymmetricKeyFileAnaRita";
        await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user
        await fileRegisterContract.connect(signer1).addFile(fileAnaRita);        // Add Ana Rita File

        await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita.ipfsCID, encSymmetricKey); // Ana Rita owner of the file

        // Act
        const result = await accessControl.connect(signer2).messageSenderAssociatedToFile(fileAnaRita.ipfsCID);        

        // Assert
        expect(result).to.equal(false);
    });

    it("Should return true if the transaction executer is different from the user and has share permissions over the file, and if the user is not the file owner and is not associated with the file", async function(){
        // Arrange
        const { accessControl, userRegisterContract, fileRegisterContract, fileAnaRita, userAnaPaula, userAnaRita, signer1, signer2 } = await loadFixture(deployContractAndSetVariables);   
        const encSymmetricKey = "encSymmetricKeyFileAnaRita";
        await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user
        await userRegisterContract.connect(signer2).userRegistered(userAnaPaula); // Register the user
        await fileRegisterContract.connect(signer1).addFile(fileAnaRita);        // Add Ana Rita File

        await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita.ipfsCID, encSymmetricKey); // Ana Rita owner of the file
        
        // Act
        const result = await accessControl.connect(signer1).elegibleToShare(userAnaPaula.account, fileAnaRita.ipfsCID);

        // Assert
        expect(result).to.equal(true);
    });

    it("Should return false if the transaction executer is the user", async function(){
        // Arrange
        const { accessControl, userRegisterContract, fileRegisterContract, fileAnaRita, userAnaPaula, userAnaRita, signer1, signer2 } = await loadFixture(deployContractAndSetVariables);   
        const encSymmetricKey = "encSymmetricKeyFileAnaRita";
        await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user
        await fileRegisterContract.connect(signer1).addFile(fileAnaRita);        // Add Ana Rita File

        await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita.ipfsCID, encSymmetricKey); // Ana Rita owner of the file
        await accessControl.connect(signer1).shareFile(userAnaPaula.account, fileAnaRita.ipfsCID, encSymmetricKey, ["delete", "share"]);
        
        // Act
        const result = await accessControl.connect(signer2).elegibleToShare(userAnaPaula.account, fileAnaRita.ipfsCID);

        // Assert
        expect(result).to.equal(false);
    });

    it("Should return false if the transaction executer doesn't have share permissions over the file", async function(){
        // Arrange
        const { accessControl, userRegisterContract, fileRegisterContract, fileAnaRita, userAnaPaula, userAnaLuisa, userAnaRita, signer1, signer2, signer3 } = await loadFixture(deployContractAndSetVariables);   
        const encSymmetricKey = "encSymmetricKeyFileAnaRita";
        await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user
        await userRegisterContract.connect(signer2).userRegistered(userAnaPaula); // Register the user
        await userRegisterContract.connect(signer3).userRegistered(userAnaLuisa); // Register the user
        await fileRegisterContract.connect(signer1).addFile(fileAnaRita);        // Add Ana Rita File

        await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita.ipfsCID, encSymmetricKey); // Ana Rita owner of the file
        await accessControl.connect(signer1).shareFile(userAnaPaula.account, fileAnaRita.ipfsCID, encSymmetricKey, ["delete"]);
        
        // Act
        const result = await accessControl.connect(signer2).elegibleToShare(userAnaLuisa.account, fileAnaRita.ipfsCID);

        // Assert
        expect(result).to.equal(false);
    });

    it("Should return false if the user account is the file owner", async function(){
        // Arrange
        const { accessControl, userRegisterContract, fileRegisterContract, fileAnaRita, userAnaPaula, userAnaRita, signer1, signer2 } = await loadFixture(deployContractAndSetVariables);   
        const encSymmetricKey = "encSymmetricKeyFileAnaRita";
        await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user
        await fileRegisterContract.connect(signer1).addFile(fileAnaRita);        // Add Ana Rita File

        await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita.ipfsCID, encSymmetricKey); // Ana Rita owner of the file
        await accessControl.connect(signer1).shareFile(userAnaPaula.account, fileAnaRita.ipfsCID, encSymmetricKey, ["delete", "share"]);
        
        // Act
        const result = await accessControl.connect(signer2).elegibleToShare(userAnaRita.account, fileAnaRita.ipfsCID);

        // Assert
        expect(result).to.equal(false);
    });

    it("Should return false if the user account is already associated with the file", async function(){
        // Arrange
        const { accessControl, userRegisterContract, fileRegisterContract, fileAnaRita, userAnaPaula, userAnaRita, signer1, signer2 } = await loadFixture(deployContractAndSetVariables);   
        const encSymmetricKey = "encSymmetricKeyFileAnaRita";
        await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user
        await userRegisterContract.connect(signer2).userRegistered(userAnaPaula); // Register the user
        await fileRegisterContract.connect(signer1).addFile(fileAnaRita);        // Add Ana Rita File

        await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita.ipfsCID, encSymmetricKey); // Ana Rita owner of the file
        await accessControl.connect(signer1).shareFile(userAnaPaula.account, fileAnaRita.ipfsCID, encSymmetricKey, ["delete", "share"]);

        // Act - userAnaPaula is already associated with the file
        const result = await accessControl.connect(signer1).elegibleToShare(userAnaPaula.account, fileAnaRita.ipfsCID);

        // Assert
        expect(result).to.equal(false);
    });

    it("Should return false if the user doesn't exist", async function(){
        // Arrange
        const { accessControl, userRegisterContract, fileRegisterContract, fileAnaRita, userAnaPaula, userAnaRita, signer1 } = await loadFixture(deployContractAndSetVariables);   
        const encSymmetricKey = "encSymmetricKeyFileAnaRita";
        await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user
        await fileRegisterContract.connect(signer1).addFile(fileAnaRita);        // Add Ana Rita File

        await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita.ipfsCID, encSymmetricKey); // Ana Rita owner of the file
        
        // Act
        const result = await accessControl.connect(signer1).elegibleToShare(userAnaPaula.account, fileAnaRita.ipfsCID);

        // Assert
        expect(result).to.equal(false);
    });

    it("Should return false if the file doesn't exist", async function(){
        // Arrange
        const { accessControl, userRegisterContract, fileAnaRita, userAnaPaula, userAnaRita, signer1, signer2 } = await loadFixture(deployContractAndSetVariables);   
        const encSymmetricKey = "encSymmetricKeyFileAnaRita";
        await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user
        await userRegisterContract.connect(signer2).userRegistered(userAnaPaula); // Register the user

        await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita.ipfsCID, encSymmetricKey); // Ana Rita owner of the file
        
        // Act
        const result = await accessControl.connect(signer1).elegibleToShare(userAnaPaula.account, fileAnaRita.ipfsCID);

        // Assert
        expect(result).to.equal(false);
    });

    it("Should return true if the transaction executer is different from the user and has share permissions, and if the user is not the file owner", async function() {
        // Arrange
        const { accessControl, userRegisterContract, fileRegisterContract, fileAnaRita, userAnaPaula, userAnaRita, signer1, signer2 } = await loadFixture(deployContractAndSetVariables);   
        const encSymmetricKey = "encSymmetricKeyFileAnaRita";
        await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user
        await userRegisterContract.connect(signer2).userRegistered(userAnaPaula); // Register the user
        await fileRegisterContract.connect(signer1).addFile(fileAnaRita);        // Add Ana Rita File

        await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita.ipfsCID, encSymmetricKey); // Ana Rita owner of the file
        
        // Act 
        const result = await accessControl.connect(signer1).elegibleToUpdPermissions(userAnaPaula.account, fileAnaRita.ipfsCID);

        // Assert 
        expect(result).to.equal(true);
    });

    it("Should return false if the transaction executer is the user", async function() {
        // Arrange
        const { accessControl, userRegisterContract, fileRegisterContract, fileAnaRita, userAnaPaula, userAnaRita, signer1, signer2 } = await loadFixture(deployContractAndSetVariables);   
        const encSymmetricKey = "encSymmetricKeyFileAnaRita";
        await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user
        await userRegisterContract.connect(signer2).userRegistered(userAnaPaula); // Register the user
        await fileRegisterContract.connect(signer1).addFile(fileAnaRita);        // Add Ana Rita File

        await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita.ipfsCID, encSymmetricKey); // Ana Rita owner of the file
        await accessControl.connect(signer1).shareFile(userAnaPaula.account, fileAnaRita.ipfsCID, encSymmetricKey, ["delete", "share"]);
        
        // Act 
        const result = await accessControl.connect(signer2).elegibleToUpdPermissions(userAnaPaula.account, fileAnaRita.ipfsCID);

        // Assert 
        expect(result).to.equal(false);
    });

    it("Should return false if the transaction executer doesn't have share permissions over the file", async function() {
        // Arrange
        const { accessControl, userRegisterContract, fileRegisterContract, fileAnaRita, userAnaPaula, userAnaRita, userAnaLuisa, signer1, signer2, signer3 } = await loadFixture(deployContractAndSetVariables);   
        const encSymmetricKey = "encSymmetricKeyFileAnaRita";
        await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user
        await userRegisterContract.connect(signer2).userRegistered(userAnaPaula); // Register the user
        await userRegisterContract.connect(signer3).userRegistered(userAnaLuisa); // Register the user
        await fileRegisterContract.connect(signer1).addFile(fileAnaRita);        // Add Ana Rita File

        await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita.ipfsCID, encSymmetricKey); // Ana Rita owner of the file
        await accessControl.connect(signer1).shareFile(userAnaPaula.account, fileAnaRita.ipfsCID, encSymmetricKey, ["delete"]);
        
        // Act 
        const result = await accessControl.connect(signer2).elegibleToUpdPermissions(userAnaLuisa.account, fileAnaRita.ipfsCID);

        // Assert 
        expect(result).to.equal(false);
    });

    it("Should return false if the user is the file owner", async function() {
        // Arrange
        const { accessControl, userRegisterContract, fileRegisterContract, fileAnaRita, userAnaPaula, userAnaRita, signer1, signer2 } = await loadFixture(deployContractAndSetVariables);   
        const encSymmetricKey = "encSymmetricKeyFileAnaRita";
        await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user
        await userRegisterContract.connect(signer2).userRegistered(userAnaPaula); // Register the user
        await fileRegisterContract.connect(signer1).addFile(fileAnaRita);        // Add Ana Rita File

        await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita.ipfsCID, encSymmetricKey); // Ana Rita owner of the file
        await accessControl.connect(signer1).shareFile(userAnaPaula.account, fileAnaRita.ipfsCID, encSymmetricKey, ["delete"]);
        
        // Act 
        const result = await accessControl.connect(signer2).elegibleToUpdPermissions(userAnaRita.account, fileAnaRita.ipfsCID);

        // Assert 
        expect(result).to.equal(false);
    });

    it("Should return true if the message sender is the same as the user, the user is the file owner and the user is not already associated with the file", async function() {
        // Arrange
        const { accessControl, userRegisterContract, fileRegisterContract, fileAnaRita, userAnaRita, signer1 } = await loadFixture(deployContractAndSetVariables);   
        await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user
        await fileRegisterContract.connect(signer1).addFile(fileAnaRita);        // Add Ana Rita File

        // Act
        const result = await accessControl.connect(signer1).elegibleToUpload(userAnaRita.account, fileAnaRita.ipfsCID);

        // Assert 
        expect(result).to.equal(true);
    });

    it("Should return false if the message sender isn't the same as the user", async function() {
        // Arrange
        const { accessControl, fileRegisterContract, fileAnaRita, userAnaRita, signer1, signer2 } = await loadFixture(deployContractAndSetVariables);   
        await fileRegisterContract.connect(signer1).addFile(fileAnaRita);        // Add Ana Rita File

        // Act
        const result = await accessControl.connect(signer2).elegibleToUpload(userAnaRita.account, fileAnaRita.ipfsCID);

        // Assert 
        expect(result).to.equal(false);
    });

    it("Should return false if the user isn't the file owner", async function() {
        // Arrange
        const { accessControl, fileRegisterContract, fileAnaRita, userAnaPaula, signer1 } = await loadFixture(deployContractAndSetVariables);   
        await fileRegisterContract.connect(signer1).addFile(fileAnaRita);        // Add Ana Rita File

        // Act
        const result = await accessControl.connect(signer1).elegibleToUpload(userAnaPaula.account, fileAnaRita.ipfsCID);

        // Assert 
        expect(result).to.equal(false);
    });

    it("Should return false if the user is already associated with the file", async function() {
        // Arrange
        const { accessControl, userRegisterContract, fileRegisterContract, fileAnaRita, userAnaRita, signer1} = await loadFixture(deployContractAndSetVariables);   
        const encSymmetricKey = "encSymmetricKeyFileAnaRita";
        await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user
        await fileRegisterContract.connect(signer1).addFile(fileAnaRita);        // Add Ana Rita File

        await accessControl.connect(signer1).uploadFile(userAnaRita.account, fileAnaRita.ipfsCID, encSymmetricKey); // Ana Rita owner of the file
    
        // Act
        const result = await accessControl.connect(signer1).elegibleToUpload(userAnaRita.account, fileAnaRita.ipfsCID);

        // Assert 
        expect(result).to.equal(false);
    });

    it("Should return false if the user doesn't exist", async function() {
        // Arrange
        const { accessControl, fileRegisterContract, fileAnaRita, userAnaRita, signer1 } = await loadFixture(deployContractAndSetVariables);   
        await fileRegisterContract.connect(signer1).addFile(fileAnaRita);        // Add Ana Rita File

        // Act
        const result = await accessControl.connect(signer1).elegibleToUpload(userAnaRita.account, fileAnaRita.ipfsCID);

        // Assert 
        expect(result).to.equal(false);
    });

    it("Should return false if the file doesn't exist", async function() {
        // Arrange
        const { accessControl, userRegisterContract, fileAnaRita, userAnaRita, signer1 } = await loadFixture(deployContractAndSetVariables);   
        await userRegisterContract.connect(signer1).userRegistered(userAnaRita); // Register the user

        // Act
        const result = await accessControl.connect(signer1).elegibleToUpload(userAnaRita.account, fileAnaRita.ipfsCID);

        // Assert 
        expect(result).to.equal(false);
    });

    it("Should return true when the account input and the file IPFS is the same as the list", async function() {
        // Arrange
        const { accessControl, userAnaRita, fileAnaRita, signer1 } = await loadFixture(deployContractAndSetVariables);
        const userHasFileList = [
            {
                userAccount: userAnaRita.account,
                ipfsCID: fileAnaRita.ipfsCID,
                encSymmetricKey: "yourEncSymmetricKey1",
                permissions: ["download", "delete", "share"]
            }
        ];

        // Act
        const result = await accessControl.connect(signer1).isKeyEqual(
            userAnaRita.account, 
            userHasFileList[0].userAccount,
            fileAnaRita.ipfsCID,
            userHasFileList[0].ipfsCID);
        
        // Assert
        expect(result).to.equal(true);
    });

    it("Should return false when the account input is not the same as the one in the list", async function() {
        // Arrange     
        const { accessControl, userAnaRita, userAnaPaula, fileAnaPaula, signer1 } = await loadFixture(deployContractAndSetVariables);   
        const userHasFileList = [
            {
                userAccount: userAnaPaula.account,
                ipfsCID: fileAnaPaula.ipfsCID,
                encSymmetricKey: "yourEncSymmetricKey1",
                permissions: ["download", "delete", "share"]
            }
        ];
        // Act
        const result = await accessControl.connect(signer1).isKeyEqual(
            userAnaRita.account, 
            userHasFileList[0].userAccount,
            fileAnaPaula.ipfsCID,
            userHasFileList[0].ipfsCID);

        // Assert
        expect(result).to.equal(false);
    });

    it("Should return false when the file IPFS input is not the same as the one in the list", async function() {
        // Arrange     
        const { accessControl, fileAnaRita, userAnaPaula, fileAnaPaula, signer1 } = await loadFixture(deployContractAndSetVariables);   
        const userHasFileList = [
            {
                userAccount: userAnaPaula.account,
                ipfsCID: fileAnaPaula.ipfsCID,
                encSymmetricKey: "yourEncSymmetricKey1",
                permissions: ["download", "delete", "share"]
            }
        ];
        // Act
        const result = await accessControl.connect(signer1).isKeyEqual(
            userAnaPaula.account, 
            userHasFileList[0].userAccount,
            fileAnaRita.ipfsCID,
            userHasFileList[0].ipfsCID);

        // Assert
        expect(result).to.equal(false);
    });
});