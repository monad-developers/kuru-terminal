// test-client.ts

import fetch from 'node-fetch';

// Configuration
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3000/';

// Sample event data structure that matches what your server expects
const sampleEventData = {
    "data": [
      [
        [],
        [],
        [
          {
            "address": "0x88b8e2161dedc77ef4ab7585569d2415a1c1055d",
            "blockHash": "0x4082887592c341f9035b0e400c555f0ec75badacc2d5fda0f4de112ab60b19f5",
            "blockNumber": "0x60c7de",
            "blockTimestamp": "0x67c8b848",
            "data": "0x0000000000000000000000000000000000000000000000000000000000007d8f",
            "logIndex": "0x0",
            "removed": false,
            "topics": [
              "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
              "0x0000000000000000000000001f60a5db7d24172d658ecbcd4e92f08b1ecd484a",
              "0x000000000000000000000000c6d20f1162cc9edc24718e4a29f515fe5777f2ac"
            ],
            "transactionHash": "0xde80da0809359d14b407e34eb180edccbb660ed60c0ef4d1893df12a7e09e0c6",
            "transactionIndex": "0x2"
          },
          {
            "address": "0x05c4c16f7aaf68efca9b32f5e6ae260fa2c26b2c",
            "blockHash": "0x4082887592c341f9035b0e400c555f0ec75badacc2d5fda0f4de112ab60b19f5",
            "blockNumber": "0x60c7de",
            "blockTimestamp": "0x67c8b848",
            "data": "0x",
            "logIndex": "0x1",
            "removed": false,
            "topics": [
              "0xf0b31d740b667a737245095e56b9ff5365c1c3fe3ac91ccd443fc0b115f65358",
              "0x00000000000000000000000088b8e2161dedc77ef4ab7585569d2415a1c1055d",
              "0x0000000000000000000000000000000000000000000000000000000000007d8f"
            ],
            "transactionHash": "0xde80da0809359d14b407e34eb180edccbb660ed60c0ef4d1893df12a7e09e0c6",
            "transactionIndex": "0x2"
          },
          {
            "address": "0x88b8e2161dedc77ef4ab7585569d2415a1c1055d",
            "blockHash": "0x4082887592c341f9035b0e400c555f0ec75badacc2d5fda0f4de112ab60b19f5",
            "blockNumber": "0x60c7de",
            "blockTimestamp": "0x67c8b848",
            "data": "0x0000000000000000000000000000000000000000000000000000000001467d83",
            "logIndex": "0x2",
            "removed": false,
            "topics": [
              "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
              "0x0000000000000000000000001f60a5db7d24172d658ecbcd4e92f08b1ecd484a",
              "0x00000000000000000000000005c4c16f7aaf68efca9b32f5e6ae260fa2c26b2c"
            ],
          }
        ]
      ]
    ]
}

async function testServerConnection() {
  console.log(`Testing connection to server at: ${SERVER_URL}`);
  
  try {
    const response = await fetch(SERVER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sampleEventData),
    });

    if (response.ok) {
      const responseText = await response.text();
      console.log('Server response status:', response.status);
      console.log('Server response:', responseText);
      console.log('✅ Connection successful!');
    } else {
      console.error('❌ Server returned error status:', response.status);
      console.error('Error details:', await response.text());
    }
  } catch (error) {
    console.error('❌ Failed to connect to server:');
    console.error(error);
    console.log('\nPossible reasons:');
    console.log('1. Server is not running');
    console.log('2. Server URL is incorrect');
    console.log('3. Network/firewall is blocking the connection');
    console.log('4. Server is not publicly accessible');
  }
}

// Run the test
testServerConnection();