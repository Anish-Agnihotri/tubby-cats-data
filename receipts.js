// Imports
const fs = require("fs");
const { ethers } = require("ethers");

// RPC
const rpc = new ethers.providers.StaticJsonRpcProvider("http://localhost:8545");

(async () => {
  // Load tx hashes
  let hashes = JSON.parse(await fs.readFileSync("./output/hashes.json"));

  let receipts = [];
  // Collect all transaction receipts
  for (let i = 0; i < hashes.length; i++) {
    console.log("Pulling hash: ", i);
    const tx = await rpc.getTransactionReceipt(hashes[i]);
    receipts.push(tx);
  }

  // Output transaction receipts
  await fs.writeFileSync("./output/receipts.json", JSON.stringify(receipts));
})();
