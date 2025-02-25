
const { ethers } = require("ethers");


async function getBalance(address) {

    const provider = new ethers.JsonRpcProvider("https://proportionate-broken-arrow.base-sepolia.quiknode.pro/06bd360bb37ba43f360080817b16e4a33dc23b2a");

    const USDC_CONTRACT = "0x036cbd53842c5426634e7929541ec2318f3dcf7e";

    const ABI = ["function balanceOf(address) view returns (uint256)"];

    try {
        const contract = new ethers.Contract(USDC_CONTRACT, ABI, provider);
        const balance = await contract.balanceOf(address);
        console.log(`✅ USDC Balance of ${address}:`, ethers.formatUnits(balance, 6), "USDC");
        return ethers.formatUnits(balance, 6);
    } catch (error) {
        console.error("🚨 Error fetching USDC balance:", error);
        return null;
    }
}


export default getBalance;