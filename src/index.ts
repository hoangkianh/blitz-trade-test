import { ethers, Contract } from "ethers";
import fs from "fs";
import * as dotenv from "dotenv";
import ERC20_ABI from "../abi/erc20.json" assert { type: "json" };
import data from "../data/input.json" assert { type: "json" };

dotenv.config();

const WS_RPC = process.env.WS_RPC;

if (!WS_RPC) {
  console.log("WS_RPC is not defined");
  process.exit(1);
}

const provider = new ethers.WebSocketProvider(WS_RPC);
const { tokens, wallets } = data;

const getBalances = async (): Promise<any[]> => {
  const balances: any[] = [];

  for (const address of wallets) {
    console.log(`Address: ${address}`);
    const walletBalance = await provider.getBalance(address);
    const walletBalanceEth = ethers.formatEther(walletBalance);
    const tokenBalances: { [symbol: string]: string } = {};
    for (const tokenAddress of tokens) {
      const tokenContract: Contract = new ethers.Contract(
        tokenAddress,
        ERC20_ABI,
        provider
      );
      const balance = await tokenContract.balanceOf(address);
      const decimals = await tokenContract.decimals();
      const symbol = await tokenContract.symbol();

      const formattedBalance = ethers.formatUnits(balance, decimals);
      tokenBalances[symbol] = formattedBalance;
    }

    balances.push({
      address: address,
      ethBalance: walletBalanceEth,
      tokenBalances,
    });
  }
  console.log("getBalances done");

  return balances;
};

const saveToCSV = async (data: any[]): Promise<void> => {
  let csv = "Address,ETH Balance";

  // Extract unique token symbols
  const symbols = Array.from(new Set(tokens.map((token: any) => token.symbol)));

  // Add token balance columns to the CSV header
  for (const symbol of symbols) {
    csv += `, ${symbol}`;
  }

  // Add data rows to the CSV
  for (const wallet of data) {
    csv += `\n ${wallet.address}, ${wallet.ethBalance} ETH`;

    for (const symbol of symbols) {
      const balance = wallet.tokenBalances[symbol] || "0";
      csv += `, ${balance}`;
    }
  }

  fs.writeFileSync("balances.csv", csv, "utf-8");
  console.log("Data saved to balances.csv");
};

const main = async () => {
  try {
    const startTime = Date.now();
    const balances = await getBalances();
    await saveToCSV(balances);
    const endTime = Date.now();
    const executionTime = endTime - startTime;
    console.log(`Execution time: ${executionTime}ms`);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    process.exit(0);
  }
};

main();
