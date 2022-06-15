# Link

Link is a tool for NFT Collections to be properly linked.

This is a DApp meant to help users re-link all of their collections that are not properly set up. For example, it is common that Blocto or a third party service improperly link collections, making it difficult to read more generally from the NonFungibleToken or MetadataViews standards.

## Add Your Own Collection

### Step 1
Update `./flow/cadence/scripts/check.js` to include your collection

### Step 2 
Update `./flow/cadence/transactions/link.js` to include your collection

### Step 3
Add a `.png` file of your collection logo to `./public` and name it exactly the same as the string you append to `check.js` script if the collection is linked incorrectly.

Ex. `FLOAT.png`, `Versus.png`

## 💎 Created by Emerald City DAO
Join our [Discord](https://discord.gg/emeraldcity)