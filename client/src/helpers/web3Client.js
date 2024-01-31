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

    let selectedAccount = useRef();
    let selectedUser = useRef();
    let storeFileContract = useRef();
    let storeUserContract = useRef();
    let isInitialized = useRef(false);
    let accountSelected = useRef(false);
    let provider = useRef();

    const login = useCallback(async () => {

        let messageError = "";

        try {
            provider.current = window.ethereum; // Link to my Ethereum node - a "gateway" to the rest of the network 

            if(typeof provider.current === 'undefined'){
                // MetaMask is not installed
                isInitialized.current = false;
                messageError = "MetaMask not intsalled";
                return { success: isInitialized.current, messageError};
            }

            // Ask the user to connect is wallet to the website
            const accounts = await provider.current.request({ method: 'eth_requestAccounts' });

            selectedAccount.current = accounts[0];
            console.log(`Selected account is ${selectedAccount.current}`);
            accountSelected.current = true;

            // Initialize contracts
            const contractInitializationResult = contractInitialization();

            if (contractInitializationResult.messageError !== "") {
                isInitialized.current = false;
                return { success: isInitialized.current, messageError: contractInitializationResult.messageError};
            }
            
            // Adds the user in the blockchain if he isn't already
            const userExists = await verifyIfUserExists(selectedAccount.current);
            if (userExists) {
                isInitialized.current = true;
                messageError = "success. userExists: " + userExists + " Initialized and Application ready.";
                return { success: isInitialized.current, messageError};
            } else {
                isInitialized.current = false;
                messageError = "User doesn't exist.";
                return { success: isInitialized.current, messageError};
            }

        } catch (error) {
            console.log(error);
            isInitialized.current = false;
            messageError = "Make sure you're connected to MetaMask extension";
            return { success: isInitialized.current, messageError };
        }
    }, []);

    // TODO: refactor this for an eventual Factory Method (??)
    const contractInitialization = () => {
        const web3 = new Web3(provider.current) // now web3 instance can be used to make calls, transactions and much more 
        let messageError = "";

        if (StoreFile_ContractAddress.address === "") {
            isInitialized.current = false;
            messageError = "StoreFile Contract address not found for the current network.";
            return { success: isInitialized.current, messageError };
        }

        if (StoreUser_ContractAddress.address === "") {
            isInitialized.current = false;
            messageError = "StoreUser Contract address not found for the current network.";
            return { success: isInitialized.current, messageError };
        }

        // Once instantiated we can do multiple things with the contract
        storeFileContract.current = new web3.eth.Contract(
            StoreFile.abi, 
            StoreFile_ContractAddress.address
        );

        storeUserContract.current = new web3.eth.Contract(
            StoreUser.abi, 
            StoreUser_ContractAddress.address
        );

        return { success: isInitialized.current, messageError };
    }

    // Logs Out the user
    const logOut = () => {
        // Cleans variables
        provider = null;
        storeFileContract = null;
        storeUserContract = null;
        selectedAccount = null;
        isInitialized = false;
        // Redirects the user to the login page
        window.location.href = '/';
        accountSelected = false;
        return true
    }

    const storeFileBlockchain = (fileUpl, symmetricKey, selectedAccount, fileCID) => {
        return new Promise((resolve, reject) => {
            if(!isInitialized.current){
                console.log("User is not logged in");
                return
            }

            // Prepares the file to be stored
            const fileName = fileUpl.name.toLowerCase();
            var fileType = FileHandler.determineFileType(fileName);
            const encryptedSymmetricKey = FileHandler.encryptSymmetricKey(symmetricKey); // Encrypt the symmetric key
            let fileUploaded = new FileApp(fileName.toString(), encryptedSymmetricKey.toString(), selectedAccount, fileCID, fileType);
        
            storeFileContract.current.methods.set(fileUploaded)
                .send({ from: selectedAccount })
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
            const transactionReceipt = await storeUserContract.current.methods.login(userLogged).send({ from: selectedAccount.current }); // from indicates the account that will be actually sending the transaction
            console.log("Transaction Receipt:", transactionReceipt);
    
            selectedUser.current = userLogged;
            isInitialized.current = true;
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
                return false;
            } 
            console.log("user already in the app.");
            selectedUser.current = userStored;

            return true;
        } catch (error) {
            console.error("Error storing user on the blockchain:", error);
            // TODO: SEND A WARNING ON THE REQUIRE OF THE SMART CONTRACT
            throw error; 
        }
        
    }

    const getFilesUploadedBlockchain = async () => {
        if(!isInitialized.current){
            console.log("User is not logged in");
            return
        }
    
        var result = await storeFileContract.current.methods.get().call({from: selectedAccount.current});
    
        // Check if the first element is an array (file details) or not
        let files = [];
        if(result.length != null){
            result.forEach(file => {
                var fileApp = new FileApp(file.fileName , file.encSymmetricKey ,file.owner, file.ipfsCID, file.fileType);
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
        selectedAccount,
        selectedUser,
        isInitialized,
        storeFileContract,
        storeUserContract,
        login,
        logOut,
        storeFileBlockchain,
        storeUserBlockchain,
        getFilesUploadedBlockchain,
    }

    return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>
}

export default Web3Provider;