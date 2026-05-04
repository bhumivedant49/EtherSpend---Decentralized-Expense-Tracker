# EtherSpend - Decentralized Expense Tracker

A blockchain-based expense tracker built with React, Solidity, and Ethereum.

## How it's Made

1.  **Smart Contract (Solidity)**:
    -   Located in `/contracts/ExpenseTracker.sol`.
    -   Stores expenses in a mapping linked to the user's wallet address.
    -   Functions: `addExpense`, `getExpenses`, `getTotalExpenses`.
2.  **Frontend (React + Ethers.js)**:
    -   Uses `ethers.js` to interact with the Ethereum blockchain.
    -   MetaMask handles wallet connection and transaction signing.
    -   Tailwind CSS for a modern, dark-themed UI.
3.  **Blockchain**:
    -   Designed for the **Ethereum Sepolia Test Network**.

## How to Run It

### 1. Deploy the Smart Contract
1.  Go to [Remix IDE](https://remix.ethereum.org/).
2.  Create a new file `ExpenseTracker.sol` and paste the content from `/contracts/ExpenseTracker.sol`.
3.  Go to the **Solidity Compiler** tab and click **Compile ExpenseTracker.sol**.
4.  Go to the **Deploy & Run Transactions** tab:
    -   Environment: Select **Injected Provider - MetaMask**.
    -   Ensure your MetaMask is on the **Sepolia Test Network**.
    -   Click **Deploy**.
5.  Once deployed, copy the **Contract Address**.

### 2. Configure the App
1.  Open `src/App.tsx`.
2.  Find the constant `CONTRACT_ADDRESS` (around line 24).
3.  Replace the placeholder with your copied contract address.

### 3. Start the Application
1.  The app should already be running in the preview.
2.  Connect your MetaMask wallet.
3.  Start adding expenses!

## How it Works

-   **Connection**: When you click "Connect Wallet", the app requests access to your MetaMask account.
-   **Adding Expenses**: When you add an expense, a transaction is sent to the smart contract. You'll need to confirm this in MetaMask (requires Sepolia ETH).
-   **Fetching Data**: The app calls the `getExpenses` function on the contract to retrieve all logs associated with your specific wallet address.
-   **Privacy**: Since data is stored on-chain, it's immutable. Only your wallet can see your specific expense list (though the contract data is technically public on the ledger).
