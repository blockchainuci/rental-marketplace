
// Function to log the address and amount
const serverTransaction = async (recipientAddress, amount) => {

    console.log("serverTransaction function was called!");

    try {

        serverPublicKey = process.env.SERVER_PUBLIC_KEY;
        serverPrivateKey = process.env.SERVER_PRIVATE_KEY;

        const { ethers } = require("ethers");

        const USDC_CONTRACT_ADDRESS = "0x036cbd53842c5426634e7929541ec2318f3dcf7e";
        const BASE_SEPOLIA_RPC = "https://proportionate-broken-arrow.base-sepolia.quiknode.pro/06bd360bb37ba43f360080817b16e4a33dc23b2a"

        // USDC ERC-20 ABI (minimal subset required for transfers)
        const USDC_ABI = [
            "function transfer(address to, uint256 amount) public returns (bool)",
            "function decimals() public view returns (uint8)",
        ];

        // Set up provider and wallet
        const provider = new ethers.JsonRpcProvider(BASE_SEPOLIA_RPC);
        const wallet = new ethers.Wallet(serverPrivateKey, provider);
    
        // Connect to USDC contract
        const usdcContract = new ethers.Contract(USDC_CONTRACT_ADDRESS, USDC_ABI, wallet);
    
        // Get token decimals
        const decimals = await usdcContract.decimals();
        const amountToSend = ethers.parseUnits(amount.toString(), decimals); // Convert amount to smallest unit
    
        console.log(`Sending ${amount} USDC (${amountToSend.toString()} in base units) to ${recipientAddress}...`);
    
        // Send transaction
        const tx = await usdcContract.transfer(recipientAddress, amountToSend);
        console.log("Transaction sent! Hash:", tx.hash);
    
        // Wait for confirmation
        const receipt = await tx.wait();
        console.log("Transaction confirmed! Block:", receipt.blockNumber);
    
        return receipt;
      } catch (error) {
        console.error("Error sending USDC:", error);
        throw error;
      }
};

// Export the function
module.exports = serverTransaction;
