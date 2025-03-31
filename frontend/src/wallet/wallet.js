import { createCoinbaseWalletSDK } from '@coinbase/wallet-sdk';
import { ethers } from "ethers";

export const sdk = createCoinbaseWalletSDK({
    appName: "Zot Swap",
    appLogoUrl: "", // TO DO: change for production URL
    //appChainIds: [8453], // Base Mainnet Chain ID
    appChainIds: [84532], // Base Testnet Chain ID - Uses Base Sepolia ETH
    preference: {
        options: "smartWalletOnly",
        attribution: {
            auto: true,
        }
    },
});

// Create provider
export const provider = sdk.getProvider();

// Function to request wallet connection
export const connectWallet = async () => {
    try {
        const addresses = await provider.request({ method: 'eth_requestAccounts' });
        return addresses;
    } catch (error) {
        console.error("Wallet connection failed:", error);
        return null;
    }
};

// Function to connect wallet and return wallet object
export const getWallet = async () => {
    try {
        // Request wallet connection
        const addresses = await provider.request({ method: "eth_requestAccounts" });

        if (!addresses || addresses.length === 0) {
            throw new Error("No wallet address found.");
        }

        // Return wallet object with provider and address
        const wallet = {
            address: addresses[0],
            provider: provider,
            sdk: sdk, // Optional: return the SDK instance if needed
        };

        return wallet;
    } catch (error) {
        console.error("Wallet connection failed:", error);
        return null;
    }
};


// Function to send USDC transaction with a Paymaster (Gasless)
export const sendUSDCGasless = async (amount, to = '0xD21134fAfe0729F487d9c91cD9f9977C39FB01ED') => {
    try {
        const wallet = await getWallet();
        if (!wallet) return;

        const USDC_CONTRACT = "0x036cbd53842c5426634e7929541ec2318f3dcf7e"; // Base Sepolia USDC

        // Encode the ERC-20 `transfer` function call
        const iface = new ethers.Interface([
            "function transfer(address to, uint256 amount) public returns (bool)"
        ]);

        const amountInWei = ethers.parseUnits(amount.toString(), 6); // Convert to smallest unit
        const data = iface.encodeFunctionData("transfer", [to, amountInWei]);

        // **Fix: Added `chainId` inside the request**
        const txRequest = {
            version: "1.0",
            from: wallet.address,
            chainId: 84532, // Required for Base Sepolia
            calls: [
                {
                    to: USDC_CONTRACT,
                    data: data,
                    value: "0x0", // No ETH required for ERC-20 transfers
                }
            ]
        };

        console.log("Sending gas-free transaction:", txRequest);

        // **Send transaction using `wallet_sendCalls`**
        const response = await wallet.provider.request({
            method: "wallet_sendCalls",
            params: [txRequest], // `chainId` is now included
            capability: {
                paymasterService: "erc-7677" // Enables gas-free transactions
            }
        });

        console.log("Gas-free transaction sent! Hash:", response);
        return response; // Transaction hash
    } catch (error) {
        console.error("Error sending gas-free USDC:", error);
        return error;
    }
};


export const getUserUSDCBalance = async () => {

    const provider = new ethers.JsonRpcProvider("https://proportionate-broken-arrow.base-sepolia.quiknode.pro/06bd360bb37ba43f360080817b16e4a33dc23b2a");
    const USDC_CONTRACT = "0x036cbd53842c5426634e7929541ec2318f3dcf7e";
    const ABI = ["function balanceOf(address) view returns (uint256)"];

    try {
        // Fetch the user's connected wallet address
        const wallet = await getWallet();
        if (!wallet) throw new Error("User wallet not found.");

        const userAddress = wallet.address;

        // Fetch USDC balance
        const contract = new ethers.Contract(USDC_CONTRACT, ABI, provider);
        const balance = await contract.balanceOf(userAddress);

        // Convert balance from Wei (6 decimals) to readable USDC value
        const formattedBalance = ethers.formatUnits(balance, 6);
        console.log(`USDC Balance of ${userAddress}:`, formattedBalance, "USDC");

        return formattedBalance;
    } catch (error) {
        console.error("Error fetching USDC balance:", error);
        return null;
    }
};

export const getTransactions = async (address) => {
    try {
        // Base Sepolia Block Explorer API (BaseScan)
        const BASESCAN_API_KEY = process.env.REACT_APP_BASE_SCAN_API_KEY; // Replace with your actual API key

        // Use `tokentx` instead of `txlist` to get ERC-20 transactions (like USDC)
        const BASESCAN_API_URL = `https://api-sepolia.basescan.org/api?module=account&action=tokentx&address=${address}&sort=desc&apikey=${BASESCAN_API_KEY}`;

        // Fetch transactions from BaseScan
        const response = await fetch(BASESCAN_API_URL);
        const data = await response.json();

        if (data.status !== "1") {
            throw new Error("Failed to fetch transactions or no transactions found.");
        }

        return data.result; // Returns an array of token transactions
    } catch (error) {
        console.error("Error fetching transactions:", error);
        return null;
    }
};