import Web3 from 'web3'
import StoreFile from '../contracts/contracts/StoreFile.sol/StoreFile.json'
import StoreFile_ContractAddress from '../contracts/StoreFile_ContractAddress.json'

import FileApp from './FileApp'
import FileHandler from './fileHandler'

import React, { createContext, useContext, useCallback, useRef } from 'react';

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
    let storeFileContract = useRef();
    let isInitialized = useRef(false);
    let accountSelected = useRef(false);
    let provider = useRef();

    const login = useCallback(async () => {
        // Because Metamask injects itself into the browser, it's possible to access it through the window object
        provider.current = window.ethereum; // Link to my Ethereum node - a "gateway" to the rest of the network 
        let result = {};
        let messageError = "";

        if(typeof provider.current === 'undefined'){
            // MetaMask is not installed
            isInitialized.current = false;
            messageError = "MetaMask not intsalled";
            result = { success: isInitialized.current, messageError};
            return result;
        }

        // MetaMask is installed (the provider has been injected)

        // Ask the user to connect is wallet to the website
        await provider.current
        .request({ method: 'eth_requestAccounts'}) // we send this request to the provider to get access to the users' account
        .then((accounts) => {
            selectedAccount.current = accounts[0];
            console.log(`Selected account is ${selectedAccount.current}`);
            accountSelected.current = true;
        })
        .catch((err) => {
            console.log(err);
            isInitialized.current = false;
            messageError = "Make sure you're connected to MetaMask extention";
            result = { success: isInitialized.current, messageError};
            return result;  
        });

        // Generate a Key Pair
        const keyPairExists = localStorage.getItem('rsaKeyPair');
        if (!keyPairExists) {
            const {privateKey, publicKey} = FileHandler.generateKeyPair();

            // Store the key pair in the localStorage
            localStorage.setItem('rsaKeyPair', JSON.stringify({ privateKey, publicKey }));
        
            console.log("Key Pair generated");
        }


        const web3 = new Web3(provider.current) // now web3 instance can be used to make calls, transactions and much more 

        if (StoreFile_ContractAddress.address === "") {
            isInitialized.current = false;
            messageError = "Contract address not found for the current network.";
            result = { success: isInitialized.current, messageError };
            return result;
        }

        // Once instantiated we can do multiple things with the contract StoreFile
        storeFileContract.current = new web3.eth.Contract(
            StoreFile.abi, 
            StoreFile_ContractAddress.address
        );

        if(accountSelected.current){
            isInitialized.current = true;
            messageError = "success";
            result = { success: isInitialized.current, messageError};
            return result;
        } 
        
        isInitialized.current = false;
        messageError = "Make sure you're connected to MetaMask extention";
        result = { success: isInitialized.current, messageError};
        return result;
    }, []);

    // Logs Out the user
    const logOut = () => {
        // Cleans variables
        provider = null;
        storeFileContract = null;
        selectedAccount = null;
        isInitialized = false;
        // Redirects the user to the login page
        window.location.href = '/';
        accountSelected = false;
        return true
    }

    const storeFileBlockchain = async (fileUploaded) => {
        if(!isInitialized.current){
            console.log("User is not logged in");
            return
        }

        return storeFileContract.current.methods.set(fileUploaded).send({ from: selectedAccount.current }); // from indicates the account that will be actually sending the transaction
    }

    const getIPFSHashesBlockchain = async () => {
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
        isInitialized,
        storeFileContract,
        login,
        logOut,
        storeFileBlockchain,
        getIPFSHashesBlockchain,
    }

    return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>
}

export default Web3Provider;