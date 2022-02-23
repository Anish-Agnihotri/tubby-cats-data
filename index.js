// Imports
const fs = require("fs");
const { ethers } = require("ethers");

// Scraped blocks
const currBlock = 14263538;
const startBlock = 14263497;
// RPC
const rpc = ethers.providers.StaticJsonRpcProvider("http://localhost:8545");

(async () => {
  let allTransactions = [];
  // Collect all transactions
  for (let i = startBlock; i <= currBlock; i++) {
    console.log("Collecting block: #", i);
    const block = await rpc.getBlockWithTransactions(i);
    allTransactions.push(block);
  }
  // Save to blocks.json
  await fs.writeFileSync(
    "./output/blocks.json",
    JSON.stringify(allTransactions)
  );
})();
