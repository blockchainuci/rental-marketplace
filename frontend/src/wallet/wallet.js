import { createCoinbaseWalletSDK } from '@coinbase/wallet-sdk';

export const sdk = createCoinbaseWalletSDK({
    appName: "Zot Swap",
    appLogoUrl: "https://example.com/logo.png", // TO DO: set the logo
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
        console.log("Connected accounts:", addresses);
        return addresses;
    } catch (error) {
        console.error("Wallet connection failed:", error);
        return null;
    }
};