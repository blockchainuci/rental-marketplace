import { createConfig, http, injected } from 'wagmi';
import { mainnet, base } from 'wagmi/chains';
import { getAccount, connect, disconnect } from '@wagmi/core';
import { useAccount } from 'wagmi';

import { ethers } from 'ethers';

// Create wagmi config with multiple connectors but don't auto-connect
export const wagmiConfig = createConfig({
  chains: [mainnet, base],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
  },
  connectors: [
    injected(), // Named for better UX
  ],
});

// Wallet state management
let walletAddress = null;
let balance = null;
let isConnected = false;

// Function to get available wallet connectors
export const getWalletConnectors = () => {
  return wagmiConfig.connectors.filter(connector => connector && connector.id && connector.name);
};

// Function to connect specific wallet and return the selected wallet
export const connectWallet = async (connector) => {
  try {
    if (!connector) {
      throw new Error('No connector specified');
    }

    console.log("Attempting to connect with connector:", connector.name);

    const result = await connect(wagmiConfig, { chainId: base.id, connector: connector });
    console.log("result: ", result )
    walletAddress = result.accounts[0];
    isConnected = true;

    console.log("Connected to wallet:", connector.name);
    return result;
  } catch (error) {
    console.error("Error connecting wallet:", error);
    throw error;
  }
};

// Function to disconnect wallet
export const disconnectWallet = async (connector) => {
    try {
      // Use the useAccount hook to get account state
     
  
      if (!connector) {
        throw new Error("No connector provided");
      }

      console.log(connector)
  
      // Validate if a wallet is connected using the values from useAccount
      if (!isConnected ) {
        console.error("No wallet connected to disconnect.");
        return false;
      }
  
      // Proceed with disconnection
      await disconnect(wagmiConfig, { chainId: base.id, connector: connector });
  
      console.log("Disconnected from wallet");
      return true;
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
      throw error;
    }
  };

// Function to get user wallet address
export const getWallet = async () => {
  const account = getAccount();
  if (!account || !account.isConnected) {
    console.error("No wallet connected to disconnect.");
    return false;
}

  return { address: account.address };
};

// Function to send USDC gasless
export const sendUSDCGasless = async (amount, to = '0xD21134fAfe0729F487d9c91cD9f9977C39FB01ED') => {
  try {
    const wallet = await getWallet();
    if (!wallet) throw new Error('No Wallet Connected');

    const USDC_CONTRACT = "0x036cbd53842c5426634e7929541ec2318f3dcf7e"; // Base Sepolia USDC
    const amountInWei = ethers.parseUnits(amount.toString(), 6);

    const iface = new ethers.Interface([
      "function transfer(address to, uint256 amount) public returns (bool)"
    ]);

    const data = iface.encodeFunctionData("transfer", [to, amountInWei]);

    const txRequest = {
      version: "1.0",
      from: wallet.address,
      chainId: 84532, // Base Sepolia
      calls: [
        {
          to: USDC_CONTRACT,
          data: data,
          value: "0x0",
        }
      ]
    };

    // Get the provider from wagmiConfig
    const provider = await wagmiConfig.getPublicClient({ chainId: 84532 });
    const response = await provider.request({
      method: "wallet_sendCalls",
      params: [txRequest],
      capability: {
        paymasterService: "erc-7677" // Enables gasless transactions
      }
    });

    console.log("Gasless transaction sent! Hash:", response);
    return response;
  } catch (error) {
    console.error("Error sending gas-free USDC:", error);
    return error;
  }
};

// Function to fetch user USDC balance
export const getUserUSDCBalance = async () => {
  try {
    const account = getAccount();
    if (!account.isConnected) throw new Error("User wallet not connected.");

    const userAddress = account.address;
    const provider = await wagmiConfig.getPublicClient({ chainId: 84532 });
    const USDC_CONTRACT = "0x036cbd53842c5426634e7929541ec2318f3dcf7e";
    const ABI = ["function balanceOf(address) view returns (uint256)"];

    const contract = new ethers.Contract(USDC_CONTRACT, ABI, provider);
    const balance = await contract.balanceOf(userAddress);

    // Convert from 6 decimals (USDC)
    const formattedBalance = ethers.formatUnits(balance, 6);
    balance = formattedBalance;
    console.log(`USDC Balance of ${userAddress}: ${formattedBalance} USDC`);

    return formattedBalance;
  } catch (error) {
    console.error("Error fetching USDC balance:", error);
    return null;
  }
};

// Function to fetch transactions from BaseScan
export const getTransactions = async (address) => {
  try {
    if (!address) throw new Error("Address is required to fetch transactions.");

    const BASESCAN_API_KEY = process.env.NEXT_PUBLIC_BASESCAN_API_KEY;
    const BASESCAN_API_URL = `https://api-sepolia.basescan.org/api?module=account&action=tokentx&address=${address}&sort=desc&apikey=${BASESCAN_API_KEY}`;

    const response = await fetch(BASESCAN_API_URL);
    if (!response.ok) throw new Error(`Failed to fetch transactions: ${response.statusText}`);

    const data = await response.json();
    if (data.status !== "1") throw new Error("No transactions found or API error.");

    return data.result;
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }
};
