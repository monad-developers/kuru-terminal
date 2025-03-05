// qn-stream-hook/index.ts

import express from 'express';
import bodyParser from 'body-parser';
import { ethers } from 'ethers';
import http from 'http';
import os from 'os';

// Define the expected structure of the request body
interface EventRequestBody {
    data: any[]; // Adjust the type according to your actual data structure
}

const app = express();
const PORT = 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Function to get public IP address
async function getPublicIpAddress(): Promise<string> {
    return new Promise((resolve, reject) => {
      // Using a public API to get the IP address
      const options = {
        hostname: 'api.ipify.org',
        port: 80,
        path: '/',
        method: 'GET'
      };
  
      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          resolve(data.trim());
        });
      });
  
      req.on('error', (e) => {
        console.error(`Error fetching public IP: ${e.message}`);
        // Fallback to local network interfaces
        const networkInterfaces = os.networkInterfaces();
        for (const name of Object.keys(networkInterfaces)) {
          for (const net of networkInterfaces[name] || []) {
            // Skip internal and non-IPv4 addresses
            if (!net.internal && net.family === 'IPv4') {
              resolve(net.address);
              return;
            }
          }
        }
        reject('Could not determine IP address');
      });
  
      req.end();
    });
  }

// Kuru Trade event ABI
const kuruTradeEventABI = [
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint40",
                "name": "orderId",
                "type": "uint40"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "makerAddress",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "bool",
                "name": "isBuy",
                "type": "bool"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "price",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint96",
                "name": "updatedSize",
                "type": "uint96"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "takerAddress",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "txOrigin",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint96",
                "name": "filledSize",
                "type": "uint96"
            }
        ],
        "name": "Trade",
        "type": "event"
    }
];

// Create a contract instance (replace with your contract address)
const contractAddress = '0x0000000000000000000000000000000000000000';
const contract = new ethers.Contract(contractAddress, kuruTradeEventABI);

// Endpoint to receive messages
app.post('/', async (req, res) => {
    var ip = req.ip
        || req.connection.remoteAddress
        || req.socket.remoteAddress;

    console.log(ip);
    const { data } = req.body as EventRequestBody;
    for (const blockLogs of data) {
        for (const txLogs of blockLogs) {
            for (const log of txLogs) {
                const eventSignature = log.topics[0]; // Get the event signature from the topics
                const isKuruTradeEvent = eventSignature === contract.interface.getEvent('Trade')?.topicHash; // Check if it matches KuruTrade

                if (isKuruTradeEvent) {
                    const decodedData = contract.interface.decodeEventLog('Trade', log.data, log.topics);
                    console.log(decodedData);
                } else {
                    console.log('Not a Kuru Trade event:', log);
                }
            }
        }
    }

    res.status(200).send('Events processed');
});

// Start the server
app.listen(PORT, '0.0.0.0', async () => {
    console.log(`Server is running on port ${PORT} and bound to all interfaces (0.0.0.0)`);
  
    try {
        const publicIp = await getPublicIpAddress();
        console.log(`Public IP address: ${publicIp}`);
        console.log(`Server is accessible at: http://${publicIp}:${PORT}`);
    } catch (error) {
        console.error('Failed to get public IP address:', error);
    }
});