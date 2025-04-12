import { useState, useEffect, useCallback, useRef } from "react";
import {
    connectWallet,
    disconnectWallet,
    getWalletConnectors,
    getUserUSDCBalance
} from "../wallet/multi-wallet.js";
import { getAccount } from '@wagmi/core';
import { wagmiConfig } from '../wallet/multi-wallet.js';
import {
    Button,
    Flex,
    Text,
    VStack
} from "@chakra-ui/react";
import {
    MdWallet,
    MdUpload,
    MdDownload,
    MdList,
    MdLogout
} from "react-icons/md";
import MenuButton from "./ui/menu-button";
import { WalletModal } from '../wallet/wallet-modal.js';
import { useNavigate } from "react-router-dom";

function WalletButton() {
    const [account, setAccount] = useState(null);
    const [usdcBaseBalance, setUsdcBaseBalance] = useState(0.0);
    const [availableConnectors, setAvailableConnectors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false); // Replaced useDisclosure
    const navigate = useNavigate();
    const [isRequestPending, setIsRequestPending] = useState(false);

    // Use ref for activeConnector to avoid issues with asynchronous state updates
    const activeConnector = useRef(null);
    const handleDeposit = async () => {
        // Gather necessary data to send in the redirect
        const referrer = "UCI rentalplace"; // Replace with your app name
        const referrerLogo = "https://example.com/your-app-logo.svg"; // Optional, link to your logo
        const callbackUrl = "http://localhost:3000/"; // Replace with your callback URL
        const inputCurrency = "USD"; // Currency to swap from, defaults to user's local currency or USD
        const toToken = "USDC"; // Token to swap to, e.g., USDC
        const recipientAddress = getAccount(wagmiConfig).address; // Replace with the recipient's address (your wallet)
    
        // Dynamically construct the ZKP2P URL with query parameters
        const zkp2pUrl = `https://zkp2p.xyz/swap?referrer=${encodeURIComponent(referrer)}&referrerLogo=${encodeURIComponent(referrerLogo)}&callbackUrl=${encodeURIComponent(callbackUrl)}&inputCurrency=${encodeURIComponent(inputCurrency)}&toToken=${encodeURIComponent(toToken)}&recipientAddress=${encodeURIComponent(recipientAddress)}`;
    
        // Redirect user to the ZKP2P platform
        window.location.href = zkp2pUrl;
      };

    useEffect(() => {
        setAvailableConnectors(getWalletConnectors());
        const currentAccount = getAccount(wagmiConfig);
    
        // Check if account exists and is connected
        if (currentAccount && currentAccount.isConnected && currentAccount.address) {
            setAccount(currentAccount.address);
            activeConnector.current = currentAccount.connector; // Set the active connector here
        } else {
            setAccount(null); // Handle the case where account is not connected
            activeConnector.current = null; // Reset active connector
        }
    }, []);

    useEffect(() => {
        const fetchBalance = async () => {
            if (!account) return setUsdcBaseBalance(0.0);
            setLoading(true);
            try {
                const balance = await getUserUSDCBalance();
                setUsdcBaseBalance(balance ? parseFloat(balance) : 0.0);
            } catch (error) {
                console.error("Error fetching balance:", error);
                setUsdcBaseBalance(0.0);
            } finally {
                setLoading(false);
            }
        };
        fetchBalance();
    }, [account]);

    const handleConnect = useCallback(async (connector) => {
        setLoading(true);
        setIsOpen(false);
        try {
            await connectWallet(connector);
            console.log(connector);
            activeConnector.current = connector; // Set the active connector when connected

            const updatedAccount = getAccount(wagmiConfig);
            if (updatedAccount && updatedAccount.isConnected) {
                setAccount(updatedAccount.address); // Ensure account is set correctly
            } else {
                setAccount(null); // In case account is still not available
            }
        } catch (error) {
            console.error("Failed to connect wallet:", error);
            setAccount(null); // Reset account state on failure
        } finally {
            setLoading(false);
        }
    }, []);

    const handleDisconnect = useCallback(async () => {
        console.log('active connector: ', activeConnector.current);
        setLoading(true);
        if (!activeConnector.current) {
            console.error("No connector provided!");
            setLoading(false);
            return;
        }
        try {
            await disconnectWallet(activeConnector.current);
            setAccount(null);
        } catch (error) {
            console.error("Failed to disconnect wallet:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    return (
        <Flex direction="column" align="center" mt={account ? "7vh" : "10vh"}>
            {account ? (
                <>
                    <Flex align="center" gap={2}>
                        <MdWallet size={24} />
                        <Text title={account}>{account.replace(/^(.{5}).*(.{4})$/, "$1...$2")}</Text>
                    </Flex>
                    <Text fontSize="2xl" fontWeight="bold" mt={1}>
                        ${usdcBaseBalance.toFixed(2)}
                        <Text as="span" fontSize="md" fontWeight="normal" color="gray.500" ml={1}>USDC</Text>
                    </Text>
                    <VStack spacing={4} mt={6} width="80%" maxWidth="300px">
                        <MenuButton icon={MdDownload} label="Deposit" onClick={() => handleDeposit()} />
                        <MenuButton icon={MdUpload} label="Withdraw" onClick={() => navigate("/withdraw")} />
                        <MenuButton icon={MdList} label="Transactions" onClick={() => navigate("/transactions")} />
                        <Button leftIcon={<MdLogout />} onClick={handleDisconnect} isLoading={loading} colorScheme="red" variant="outline">
                            Disconnect
                        </Button>
                    </VStack>
                </>
            ) : (
                <Button onClick={() => setIsOpen(true)} isLoading={loading} leftIcon={<MdWallet />} size="lg" colorScheme="teal">
                    Connect Wallet
                </Button>
            )}
            <WalletModal isOpen={isOpen} onClose={() => setIsOpen(false)} connecting={loading} onConnect={handleConnect} />
        </Flex>
    );
}

export default WalletButton;
