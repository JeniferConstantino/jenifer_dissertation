import {ipfs} from '../../../ipfs';
import EncryptionManager from './EncryptionManager';
import axios from 'axios';
import { IPFS_BASE_URL } from '../../../ipfs';

class IPFSManager {

    // Uploads the file to IPFS 
    static async addFileToIPFS (fileAsBuffer) {
        // Encrypts uploaded file using symmetric encryption
        const symmetricKey = EncryptionManager.generateSymmetricKey(); 
        const {encryptedFile, iv} = await EncryptionManager.encryptFileWithSymmetricKey(fileAsBuffer, symmetricKey);
        // Adds to IPFS
        const addedFile = await ipfs.add({ content: encryptedFile});
        const fileCID = addedFile.cid.toString();
        return {fileCID, symmetricKey, iv};
    }

    // Gets a file from IPFS
    static async getFileFromIPFS (cid) {
        const response = await axios.get(`${IPFS_BASE_URL}${cid}`, { // Fetch the encrypted file content from IPFS using its CID
            responseType: 'arraybuffer',
        });
        return Buffer.from(response.data);
    }
    
}

export default IPFSManager;