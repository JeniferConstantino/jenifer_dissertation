import Web3 from 'web3'
import StoreFile from '../contracts/contracts/StoreFile.sol/StoreFile.json'
import StoreUser from '../contracts/contracts/StoreUser.sol/StoreUser.json'
import StoreFile_ContractAddress from '../contracts/StoreFile_ContractAddress.json'
import StoreUser_ContractAddress from '../contracts/StoreUser_ContractAddress.json'

import UserApp from './UserApp'

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

    const setup = useCallback(async () => {
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

        } catch (error) {
            return "Something went wrong while trying to authenticate the user. Make sure you're connected to metamask extension or ensure the contracts are deployed in the network you're in.";
        }
    }, []);

    const verifyIfUserExists = async () => {    
        try {
            // Verifies if the user exist
            var userStored = await storeUserContract.current.methods.getUser(selectedAccount.current).call({from: selectedAccount.current});
            
            if (userStored.name === "") {
                console.log("user first time in the app");
                return null;
            } 

            console.log("user already in the app.");
            selectedUser.current = userStored;
            return userStored;
        } catch (error) {
            console.error("Error storing user on the blockchain:", error);
            // TODO: SEND A WARNING ON THE REQUIRE OF THE SMART CONTRACT
            throw error; 
        }   
    }

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

    window.ethereum.on('accountsChanged', function (accounts){
        selectedAccount.current = accounts[0];
        console.log(`Selected account changed to ${selectedAccount.current}`);
        logOut();
    });

    const value = {
        selectedUser,
        storeFileContract,
        verifyIfUserExists,
        setup,
        logOut,
        storeUserBlockchain,
    }

    return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>
}

export default Web3Provider;