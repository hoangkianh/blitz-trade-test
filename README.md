# blitz-trade-test

## Description

This project contains a JavaScript/TypeScript script that allows you to query the ERC20 and ETH balance of multiple wallets and tokens on the Ethereum mainnet. It calculates the total balance of each token and saves the data into a CSV file.

## Prerequisites

To run this project, you need to have the following software installed on your system:

- Node.js (version 14 or higher)
- npm (Node Package Manager) or yarn

## Installation

1. Clone the repository to your local machine: `git clone <repository_url>`
2. Navigate to the project directory: `cd blitz-trade-test`
3. Install the project dependencies: `npm install` or `yarn install`

## Usage

To run the script and query the ERC20 and ETH balances, follow these steps:

1. Open a terminal or command prompt.
2. Navigate to the project directory: `cd blitz-trade-test`
3. Run the script: `npm run start` or `yarn start`
4. Wait for the script to complete the balance queries and CSV file generation. **The execution time for 50 wallets is expected to be around 2-3 seconds**.

5. Once the script finishes, you will find a `balances.csv` file in the project directory. This file contains the balances of each wallet and the total balance of each token.

## CSV File Format

The generated CSV file (`balances.csv`) has the following format:

```
Wallet Address,ETH Balance,Token1 Balance,Token2 Balance,...
0xWalletAddress1,ETH Balance,Token1 Balance,Token2 Balance,...
0xWalletAddress2,ETH Balance,Token1 Balance,Token2 Balance,...
...
```

That's it! You can now use this script to query ERC20 and ETH balances and save the results into a CSV file. If you have any questions or need further assistance, feel free to reach out.
