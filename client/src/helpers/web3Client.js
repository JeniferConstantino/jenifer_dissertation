import Web3 from 'web3'
import StoreFile from '../contracts/contracts/StoreFile.sol/StoreFile.json'
import StoreUser from '../contracts/contracts/StoreUser.sol/StoreUser.json'
import StoreFile_ContractAddress from '../contracts/StoreFile_ContractAddress.json'
import StoreUser_ContractAddress from '../contracts/StoreUser_ContractAddress.json'

import FileApp from './FileApp'
import UserApp from './UserApp'
import FileHandler from './fileHandler';

import React, { createContext, useContext, useCallback, useRef } from 'react';
import EncryptionHandler from './EncryptionHandler'

const Web3Context= createContext();

export const useWeb3 = () => {
    const context = useContext(Web3Context);
    if(!context){
        throw new Error('useWeb3 must be used within a Web3Provider');
    }
    return context;
}

const Web3Provider = ({children}) => {

    let selectedAccount = useRef();     // Keeps track of wallet account change
    let selectedUser = useRef(null);    // User logged in
    let storeFileContract = useRef();   // kesps the File Contract so its functions can be executed
    let storeUserContract = useRef();   // keeps the User Contract so its functions can be executed
    let provider = useRef();

    const login = useCallback(async () => {
        try {
            // Link to my Ethereum node - a "gateway" to the rest of the network 
            provider.current = window.ethereum; 

            // MetaMask is not installed
            if(typeof provider.current === 'undefined'){ 
                return "MetaMask not intsalled";
            }

            // Ask the user to connect is wallet to the website
            const accounts = await provider.current.request({ method: 'eth_requestAccounts' });

            selectedAccount.current = accounts[0];
            console.log(`Selected account is ${selectedAccount.current}`);

            // Initialize contracts
            const web3 = new Web3(provider.current) // now web3 instance can be used to make calls, transactions and much more 
            contractInitialization(StoreUser, StoreUser_ContractAddress, storeUserContract, web3);
            contractInitialization(StoreFile, StoreFile_ContractAddress, storeFileContract, web3);
            
            // Adds the user in the blockchain if he isn't already
            const userExists = await verifyIfUserExists(selectedAccount.current);
            
            if (userExists !== null) {
                selectedUser.current = userExists;
                return "Success. Initialized and Application ready.";
            } else {
                return "User doesn't exist.";
            }

        } catch (error) {
            return "Something went wrong while trying to authenticate the user. Make sure you're connected to metamask extension or ensure the contracts are deployed in the network you're in.";
        }
    }, []);

    const contractInitialization = (contract, contractAddress, contractVar, web3) => {
        contractVar.current = new web3.eth.Contract(
            contract.abi, 
            contractAddress.address
        );
    }

    // Logs Out the user - clean variables
    const logOut = () => {
        provider = null;
        storeFileContract = null;
        storeUserContract = null;
        selectedAccount = null;
        selectedUser = null;
        window.location.href = '/'; // Redirects the user to the login page
        return true
    }

    const storeFileBlockchain = (fileUpl, symmetricKey, selectedUser, fileCID, iv) => {
        return new Promise((resolve, reject) => {
            if(selectedUser === null){
                console.log("User is not logged in");
                return
            }

            // Prepares the file to be stored
            const fileName = fileUpl.name.toLowerCase();
            var fileType = FileHandler.determineFileType(fileName);
            const encryptedSymmetricKey = FileHandler.encryptSymmetricKey(symmetricKey, selectedUser.publicKey); // Encrypt the symmetric key

            let fileUploaded = new FileApp(fileName.toString(), encryptedSymmetricKey.toString('base64'), selectedUser.account, fileCID, fileType, iv.toString('base64'));
        
            storeFileContract.current.methods.set(fileUploaded)
                .send({ from: selectedUser.account })
                .then(transactionResult => {
                    resolve({ transactionResult, fileUploaded })
                })
                .catch(error => {
                    console.error("Error storing file on the blockchain:", error);
                    reject("Error storing file on the blockchain");
                });
        });
    }

    const storeUserBlockchain = async (userName) => {
        // Prepares the user to be stored
        const {privateKey, publicKey} = EncryptionHandler.generateKeyPair();
        console.log("Key Pair generated");
        var userLogged = new UserApp(selectedAccount.current, userName, publicKey, privateKey);

        // Adds the user to the blockchain
        try {
            var errorRegister = await storeUserContract.current.methods.checkRegistration(userLogged).call({from: selectedAccount.current});
            
            if (errorRegister.length === 0) { // The user can register, no error message was sent
                const receipt = await storeUserContract.current.methods.register(userLogged).send({ from: selectedAccount.current }); // from indicates the account that will be actually sending the transaction
            
                const registrationEvent  = receipt.events["RegistrationResult"];
                
                if (registrationEvent) {
                    const { success, message } = registrationEvent.returnValues;
                    if (success) {
                        selectedUser.current = userLogged;
                    } else {
                        console.log("message: ", message);
                    }
                }
            } else {
                console.log("errorRegister: ", errorRegister);
            }
            
        } catch (error) {
            console.error("Transaction error: ", error.message);
            console.log("Make sure that the user is not already authenticated in the app. And make sure that the username is unique.");
        }
    }

    const verifyIfUserExists = async (selectedAccount) => {    
        try {
            // Verifies if the user exist
            var userStored = await storeUserContract.current.methods.getUser(selectedAccount).call({from: selectedAccount.current});
            if (userStored.name === "") {
                console.log("user first time in the app");
                return null;
            } 

            console.log("user already in the app.");
            return userStored;
        } catch (error) {
            console.error("Error storing user on the blockchain:", error);
            // TODO: SEND A WARNING ON THE REQUIRE OF THE SMART CONTRACT
            throw error; 
        }
        
    }

    const getFilesUploadedBlockchain = async () => {
        if(selectedUser === null){
            console.log("User is not logged in");
            return
        }
    
        var result = await storeFileContract.current.methods.get().call({from: selectedAccount.current});
    
        // Check if the first element is an array (file details) or not
        let files = [];
        if(result.length != null){
            result.forEach(file => {
                var fileApp = new FileApp(file.fileName , file.encSymmetricKey ,file.owner, file.ipfsCID, file.fileType, file.iv);
                files.push(fileApp);
            });
        }
    
        return files;
    }

    window.ethereum.on('accountsChanged', function (accounts){
        selectedAccount.current = accounts[0];
        console.log(`Selected account changed to ${selectedAccount.current}`);
        logOut();
    });

    const value = {
        selectedUser,
        login,
        logOut,
        storeFileBlockchain,
        storeUserBlockchain,
        getFilesUploadedBlockchain,
    }

    return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>
}

export default Web3Provider;