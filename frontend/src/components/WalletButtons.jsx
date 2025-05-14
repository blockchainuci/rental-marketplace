import { useState, useEffect, useRef } from "react";
import {
  Button,
  Flex,
  Text,
  VStack,
  Box,
  useDisclosure
} from "@chakra-ui/react";
import {
  MdWallet,
  MdUpload,
  MdDownload,
  MdList,
  MdLogout
} from "react-icons/md";
import MenuButton from "./ui/menu-button";
import { useNavigate } from "react-router-dom";
import { WalletModal } from './WalletModal';
import {
  isWalletConnected,
  disconnectWallet,
  getUserUSDCBalance,
  getWallet
} from "../wallet/wallet-service";

function WalletButtons() {
  const [account, setAccount] = useState(null);
  const [usdcBaseBalance, setUsdcBaseBalance] = useState(0.0);
  const [loading, setLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  const walletTypeRef = useRef(null);

  // Check wallet connection on component mount
  useEffect(() => {
    const checkWalletConnection = async () => {
      setLoading(true);
      try {
        const wallet = await getWallet();
        
        if (wallet) {
          setAccount(wallet.address);
          walletTypeRef.current = wallet.walletType;
          
          // Check if wallet needs reconnection
          if (wallet.needsReconnect) {
            console.log("Wallet connection needs to be restored");
            // You can show a notification or auto-trigger reconnection here
            // For example:
            
            toast({
              title: "Wallet connection needs to be restored",
              description: "Please reconnect your wallet",
              status: "warning",
              duration: 5000,
              isClosable: true,
              action: (
                <Button colorScheme="blue" size="sm" onClick={onOpen}>
                  Reconnect
                </Button>
              ),
            });
            
          }
        } else {
          setAccount(null);
          walletTypeRef.current = null;
        }
      } catch (error) {
        console.error("Error checking wallet connection:", error);
        setAccount(null);
        walletTypeRef.current = null;
      } finally {
        setLoading(false);
      }
    };
    
    checkWalletConnection();
  }, []);

  // Fetch USDC balance when wallet is connected
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

  const handleConnect = async (result, walletType) => {
    if (result && result.address) {
      setAccount(result.address);
      walletTypeRef.current = walletType;
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      await disconnectWallet();
      setAccount(null);
      walletTypeRef.current = null;
    } catch (error) {
      console.error("Failed to disconnect wallet:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async () => {
    // Gather necessary data to send in the redirect
    const referrer = "ZotSwap";
    const referrerLogo = "https://imgs.search.brave.com/NYtQTVlK3r7MVMoIqA85T_Hkxwygl-IYyEYn6FwNveE/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly91cGxv/YWQud2lraW1lZGlh/Lm9yZy93aWtpcGVk/aWEvY29tbW9ucy80/LzQ0L1JlY3ljbGUw/MDEuc3Zn"; // Optional, link to your logo
    const callbackUrl = window.location.origin; // Current origin for callback
    const inputCurrency = "USD";
    const toToken = "USDC";
    const recipientAddress = account;
    
    //coinbase onramp?
    // Dynamically construct the ZKP2P URL with query parameters
    const zkp2pUrl = `https://zkp2p.xyz/swap?referrer=${encodeURIComponent(referrer)}
    &callbackUrl=${encodeURIComponent(callbackUrl)}
    &inputCurrency=${encodeURIComponent(inputCurrency)}
    &toToken=${encodeURIComponent(toToken)}
    &recipientAddress=${encodeURIComponent(recipientAddress)}`
    // Redirect user to the ZKP2P platform
    window.location.href = "https://zkp2p.xyz/swap?tab=buy";
  };

  return (
    <Flex direction="column" align="center" mt={4}>
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
          <Box textAlign="center" mt={1} mb={4}>
            <Text fontSize="sm" color="gray.500">
              {walletTypeRef.current === 'coinbaseSmart' ? 'Coinbase Smart Wallet' : 'External Wallet'}
            </Text>
          </Box>
          <VStack spacing={4} width="90%" maxWidth="300px">
            <MenuButton icon={MdDownload} label="Deposit" onClick={handleDeposit} />
            <MenuButton icon={MdUpload} label="Withdraw" onClick={() => navigate("/withdraw")} />
            <MenuButton icon={MdList} label="Transactions" onClick={() => navigate("/transactions")} />
            <Button 
              leftIcon={<MdLogout />} 
              onClick={handleDisconnect} 
              isLoading={loading && !account} 
              colorScheme="red" 
              variant="outline"
              width="100%"
            >
              Disconnect Wallet
            </Button>
          </VStack>
        </>
      ) : (
        <Button 
          onClick={onOpen} 
          isLoading={loading} 
          leftIcon={<MdWallet />} 
          size="lg" 
          colorScheme="teal"
          width="80%"
          maxWidth="300px"
        >
          Connect Wallet
        </Button>
      )}
      
      <WalletModal 
        isOpen={isOpen} 
        onClose={onClose} 
        connecting={loading} 
        onConnect={handleConnect} 
      />
    </Flex>
  );
}

export default WalletButtons;