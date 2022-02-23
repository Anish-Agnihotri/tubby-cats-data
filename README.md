# Tubby Cats data

Tracks all transactions calling the `mintFromSale` function to the Tubby Cats contract. Only uses direct gas paid for calculations.

1. Pull all blocks + transactions between `14263497` and `14263538`, `index.js`, output: `blocks.json`
2. Pull all transaction receipts by hash, input: `hashes.json`, output: `receipts.json`, process: `receipts.js`
3. Analyze transactions for statistics and output cleaned data, output: `final.json`, process: `analyze.js`

## Usage

```bash
# Install dependencies
npm install

# Call files
node index.js
node receipts.js
node analyze.js
```
