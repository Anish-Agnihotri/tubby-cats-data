// Imports
const fs = require("fs");
const { ethers } = require("ethers");

(async () => {
  let totalTxCount = 0; // Total transactions
  let tubbyTransactions = []; // All mint transactions
  let hashToReceipt = {}; // Tx hash => tx receipt map

  // Load data
  const receipts = JSON.parse(await fs.readFileSync("./output/receipts.json"));
  const data = JSON.parse(await fs.readFileSync("./output/blocks.json"));

  for (block of data) {
    for (const transaction of block.transactions) {
      // Count transaction
      totalTxCount++;

      // Log tubby cat mint transaction
      if (
        transaction.to.toLowerCase() ===
          "0xCa7cA7BcC765F77339bE2d648BA53ce9c8a262bD".toLowerCase() &&
        transaction.data.startsWith("0xf8b4d981")
      )
        tubbyTransactions.push(transaction);
    }
  }

  console.log(
    "Blocks analyzed: ",
    data.length,
    data[0].number,
    data[data.length - 1].number
  );
  console.log("Total txs: ", totalTxCount);
  console.log("Number of tubby txs: ", tubbyTransactions.length);

  // Setup hash => receipt mapping
  for (const receipt of receipts) {
    hashToReceipt[receipt.transactionHash] = receipt;
  }

  let cleanedTransactions = [];
  // Quick transaction cleaning
  for (const tx of tubbyTransactions) {
    const gasPrice = ethers.BigNumber.from(tx.gasPrice.hex);
    const gasUsed = ethers.BigNumber.from(hashToReceipt[tx.hash].gasUsed.hex);
    const gasPaid = gasPrice.mul(gasUsed);
    const gasPaidEther = Number(ethers.utils.formatEther(gasPaid));
    const numTubbysMinted = Number(tx.data.slice(-1));

    cleanedTransactions.push({
      hash: tx.hash,
      blockNumber: tx.blockNumber,
      from: tx.from,
      gasPaid: gasPaidEther,
      numTubbysMinted,
      finalCostPerTubby:
        (numTubbysMinted * 0.1 + gasPaidEther) / numTubbysMinted,
      success: hashToReceipt[tx.hash].status === 1,
    });
  }

  // Output cleaned data
  await fs.writeFileSync(
    "./output/final.json",
    JSON.stringify(cleanedTransactions)
  );

  // Highest gas spend per tubby
  // Total gas spent in successful transactions
  // Total gas spent in failed transactions
  // Lowest gas spend per tubby
  // Escalating gas prices over blocks
  let highestGasSpent = 0;
  let totalGasSuccessSpent = 0;
  let totalGasFailedSpent = 0;
  let lowestGasPerTubbyPaid = 1;
  let highestGasPerTubbyPaid = 0;
  for (const tx of cleanedTransactions) {
    if (tx.gasPaid > highestGasSpent) {
      highestGasSpent = tx.gasPaid;
    }

    if (tx.success) {
      totalGasSuccessSpent += tx.gasPaid;
    } else {
      totalGasFailedSpent += tx.gasPaid;
    }

    const perTubbyPaid = tx.gasPaid / tx.numTubbysMinted;
    if (perTubbyPaid < lowestGasPerTubbyPaid && tx.success) {
      lowestGasPerTubbyPaid = perTubbyPaid;
    }
    if (perTubbyPaid > highestGasPerTubbyPaid && tx.success) {
      highestGasPerTubbyPaid = perTubbyPaid;
    }
  }

  // Collect rudimentary statistics
  console.log("Highest gas spent in TX: ", highestGasSpent);
  console.log("Total gas success spend: ", totalGasSuccessSpent);
  console.log("Total gas failed spend: ", totalGasFailedSpent);
  console.log("Lowest gas per tubby paid: ", lowestGasPerTubbyPaid);
  console.log("Highest gas per tubby paid: ", highestGasPerTubbyPaid);
})();
