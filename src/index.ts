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

const getBalance = async (
  address: string,
  tokenAddress: string
): Promise<any> => {
  const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
  const [balance, decimals, symbol] = await Promise.all([
    tokenContract.balanceOf(address),
    tokenContract.decimals(),
    tokenContract.symbol(),
  ]);
  return {
    balance: ethers.formatUnits(balance, decimals),
    symbol,
  };
};

const getBalances = async (): Promise<any[]> => {
  const balancePromises = wallets.map(async (wallet: string) => {
    const balancePromise = provider.getBalance(wallet);

    const tokenBalancePromises = tokens.map((tokenAddress: string) =>
      getBalance(wallet, tokenAddress)
    );
    const [ethBalance, tokenBalances] = await Promise.all([
      balancePromise,
      Promise.all(tokenBalancePromises),
    ]);

    const tokenBalancesMap = tokenBalances.reduce(
      (acc: any, { symbol, balance }: any) => {
        acc[symbol] = balance;
        return acc;
      },
      {}
    );

    return {
      address: wallet,
      ethBalance: ethers.formatEther(ethBalance),
      tokenBalances: tokenBalancesMap,
    };
  });

  return Promise.all(balancePromises);
};

const saveToCSV = async (
  data: any[],
  symbolMap: Map<string, string>
): Promise<void> => {
  let csv = "Address,ETH Balance";

  // Add token symbol columns to the CSV header
  for (const tokenAddress of tokens) {
    const symbol = symbolMap.get(tokenAddress) || "";
    csv += `, ${symbol}`;
  }

  // Add data rows to the CSV
  for (const wallet of data) {
    csv += `\n ${wallet.address}, ${wallet.ethBalance} ETH`;

    for (const tokenAddress of tokens) {
      const balance = wallet.tokenBalances[tokenAddress] || "0";
      const symbol = symbolMap.get(tokenAddress) || "";
      csv += `, ${balance} ${symbol}`;
    }
  }

  fs.writeFileSync("balances.csv", csv, "utf-8");
  console.log("Data saved to balances.csv");
};

const getSymbolMap = async (): Promise<Map<string, string>> => {
  const provider = ethers.getDefaultProvider("mainnet");
  const symbolPromises = tokens.map((tokenAddress: string) => {
    const tokenContract = new ethers.Contract(
      tokenAddress,
      ERC20_ABI,
      provider
    );
    return tokenContract.symbol();
  });
  const symbols = await Promise.all(symbolPromises);
  const symbolMap = new Map<string, string>();
  for (let i = 0; i < tokens.length; i++) {
    symbolMap.set(tokens[i], symbols[i]);
  }
  return symbolMap;
};

const main = async () => {
  try {
    const startTime = Date.now();
    const [balances, symbolMap] = await Promise.all([
      getBalances(),
      getSymbolMap(),
    ]);
    await saveToCSV(balances, symbolMap);
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
