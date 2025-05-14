// wallet/wallet-service.js
import { createConfig, http, injected } from 'wagmi';
import {base } from 'wagmi/chains';
import { getAccount, connect, disconnect } from '@wagmi/core';
import { createCoinbaseWalletSDK } from '@coinbase/wallet-sdk';
import { ethers } from 'ethers';
import { defineChain } from 'viem';

// COINBASE SMART WALLET SDK SETUP
export const coinbaseSDK = createCoinbaseWalletSDK({
  appName: "Zot Swap",
  appLogoUrl: "",
  appChainIds: [84532], // Base Sepolia Testnet Chain ID
  preference: {
    options: "smartWalletOnly",
    attribution: {
      auto: true,
    }
  },
});

export const baseSepolia = defineChain({
  id: 84532,
  name: 'Base Sepolia',
  network: 'base-sepolia',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://sepolia.base.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'BaseScan',
      url: 'https://sepolia.basescan.org',
    },
  },
});

// Create Coinbase provider
export const coinbaseProvider = coinbaseSDK.getProvider();

// WAGMI SETUP FOR THIRD-PARTY WALLETS
export const wagmiConfig = createConfig({
  chains: [ baseSepolia],
  transports: {
    [baseSepolia.id]: http(),
  },
  connectors: [
    injected(), // Named for better UX
    // Add more connectors if needed
  ],
});

// WALLET STATE MANAGEMENT
let currentWalletType = null; // 'coinbaseSmart' or 'thirdParty'
let walletAddress = null;
let walletConnector = null;

// UNIFIED API FUNCTIONS

// Get available third-party wallet connectors
export const getWalletConnectors = () => {
  return wagmiConfig.connectors.filter(connector => connector && connector.id && connector.name);
};

// Connect to Coinbase Smart Wallet
export const connectCoinbaseSmartWallet = async () => {
  try {
    const addresses = await coinbaseProvider.request({ method: 'eth_requestAccounts' });
    
    if (!addresses || addresses.length === 0) {
      throw new Error("No wallet address found.");
    }
    
    currentWalletType = 'coinbaseSmart';
    walletAddress = addresses[0];
    
    console.log("Connected to Coinbase Smart Wallet:", walletAddress);
    
    return {
      address: walletAddress,
      walletType: currentWalletType,
    };
  } catch (error) {
    console.error("Error connecting Coinbase Smart Wallet:", error);
    throw error;
  }
};

// Connect to third-party wallet using wagmi
export const connectWallet = async (connector) => {
  try {
    if (!connector) {
      throw new Error('No connector specified');
    }

    console.log("Attempting to connect with connector:", connector.name);

    const result = await connect(wagmiConfig, { chainId: baseSepolia.id, connector: connector });
    
    currentWalletType = 'thirdParty';
    walletAddress = result.accounts[0];
    walletConnector = connector;

    console.log("Connected to wallet:", connector.name);
    
    return {
      address: walletAddress,
      walletType: currentWalletType,
      connector: walletConnector,
    };
  } catch (error) {
    console.error("Error connecting wallet:", error);
    throw error;
  }
};

// Disconnect wallet (handles both wallet types)
export const disconnectWallet = async () => {
  try {
    if (currentWalletType === 'coinbaseSmart') {
      currentWalletType = null;
      walletAddress = null;
      console.log("Disconnected from Coinbase Smart Wallet");
      return true;
    } else if (currentWalletType === 'thirdParty' && walletConnector) {
      // For third-party wallets
      await disconnect(wagmiConfig, { chainId: base.id, connector: walletConnector });
      currentWalletType = null;
      walletAddress = null;
      walletConnector = null;
      console.log("Disconnected from third-party wallet");
      return true;
    } else {
      console.error("No wallet connected to disconnect.");
      return false;
    }
  } catch (error) {
    console.error("Error disconnecting wallet:", error);
    throw error;
  }
};

// Get current wallet info
export const getWallet = async () => {
  if (currentWalletType === 'coinbaseSmart') {
    // For Coinbase Smart Wallet
    try {
      const addresses = await coinbaseProvider.request({ method: "eth_accounts" });
      
      if (!addresses || addresses.length === 0) {
        throw new Error("No Coinbase wallet address found.");
      }
      
      return {
        address: addresses[0],
        walletType: 'coinbaseSmart',
        provider: coinbaseProvider,
      };
    } catch (error) {
      console.error("Error getting Coinbase wallet:", error);
      return null;
    }
  } else if (currentWalletType === 'thirdParty') {
    // For third-party wallets
    const account = getAccount(wagmiConfig);
    
    if (!account || !account.isConnected) {
      return null;
    }
    
    return { 
      address: account.address,
      walletType: 'thirdParty',
      connector: walletConnector,
    };
  }
  
  return null; // No wallet connected
};

// Check if wallet is connected
export const isWalletConnected = async () => {
  if (currentWalletType === 'coinbaseSmart') {
    try {
      const addresses = await coinbaseProvider.request({ method: "eth_accounts" });
      return addresses && addresses.length > 0;
    } catch {
      return false;
    }
  } else if (currentWalletType === 'thirdParty') {
    const account = getAccount(wagmiConfig);
    return account && account.isConnected;
  }
  
  return false;
};

// Get user's USDC balance (works with both wallet types)
export const getUserUSDCBalance = async () => {
  try {
    const wallet = await getWallet();
    if (!wallet) throw new Error("User wallet not connected.");

    const userAddress = wallet.address;
    const USDC_CONTRACT = "0x036cbd53842c5426634e7929541ec2318f3dcf7e"; // Base Sepolia USDC
    const ABI = ["function balanceOf(address) view returns (uint256)"];
    
    let provider;
    
    if (wallet.walletType === 'coinbaseSmart') {
      provider = new ethers.BrowserProvider(coinbaseProvider);
    } else {
      // For third-party wallets, use a general provider
      provider = new ethers.JsonRpcProvider("https://proportionate-broken-arrow.base-sepolia.quiknode.pro/06bd360bb37ba43f360080817b16e4a33dc23b2a");
    }

    const contract = new ethers.Contract(USDC_CONTRACT, ABI, provider);
    const balance = await contract.balanceOf(userAddress);

    // Convert from 6 decimals (USDC)
    const formattedBalance = ethers.formatUnits(balance, 6);
    console.log(`USDC Balance of ${userAddress}: ${formattedBalance} USDC`);

    return formattedBalance;
  } catch (error) {
    console.error("Error fetching USDC balance:", error);
    return "0.00";
  }
};

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

    let response;
    
    if (wallet.walletType === 'coinbaseSmart') {
      // Use Coinbase provider
      response = await coinbaseProvider.request({
        method: "wallet_sendCalls",
        params: [txRequest],
        capability: {
          paymasterService: "erc-7677" // Enables gasless transactions
        }
      });
    } else {
      // For third-party wallets
      const provider = await wagmiConfig.getPublicClient({ chainId: 84532 });
      response = await provider.request({
        method: "wallet_sendCalls",
        params: [txRequest],
        capability: {
          paymasterService: "erc-7677" // Enables gasless transactions
        }
      });
    }

    console.log("Gasless transaction sent! Hash:", response);
    return response;
  } catch (error) {
    console.error("Error sending gas-free USDC:", error);
    throw error;
  }
};

// Function to fetch transactions from BaseScan
export const getTransactions = async () => {
  try {
    const wallet = await getWallet();
    if (!wallet) throw new Error("Wallet not connected");
    
    const address = wallet.address;
    
    const BASESCAN_API_KEY = process.env.REACT_APP_BASE_SCAN_API_KEY;
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