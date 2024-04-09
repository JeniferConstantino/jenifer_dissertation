import {ipfs} from '../../../ipfs.jsx';
import axios from 'axios';
import { IPFS_BASE_URL } from '../../../ipfs.jsx';

class IPFSWrapper {

    // Uploads the file to IPFS 
    static async addFileToIPFS (encryptedFile) {
        const addedFile = await ipfs.add({ content: encryptedFile});
        const fileCID = addedFile.cid.toString();
        return fileCID;
    }

    // Gets a file from IPFS
    static async getFileFromIPFS (cid) {
        const response = await axios.get(`${IPFS_BASE_URL}${cid}`, { // Fetch the encrypted file content from IPFS using its CID
            responseType: 'arraybuffer',
        });
        return Buffer.from(response.data);
    }   
}

export default IPFSWrapper;