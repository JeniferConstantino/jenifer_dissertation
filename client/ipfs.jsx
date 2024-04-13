// File with IPFS configurations

import {create} from 'ipfs-http-client';

export const IPFS_BASE_URL = 'http://127.0.0.1:8082/ipfs/';

// Create an IPFS client for the local node 
export const ipfs = create({  
    host: 'localhost',
    port: 5002,
    protocol: 'http',
});

