import {  
  Button, 
  Flex, 
  Text, 
  Box,
  useDisclosure,
  VStack,
  IconButton
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { 
  useState, 
  useEffect,
  useRef,
  useCallback
} from "react";
import { 
  MdLogout, 
  MdPerson,
  MdClose,
  MdBook,
  MdWallet,
  MdDownload,
  MdUpload,
  MdList
} from "react-icons/md";
import MenuButton from "./ui/menu-button";
import { WalletModal } from '../wallet/wallet-modal';
import {
  connectWallet,
  disconnectWallet,
  getWalletConnectors,
  getUserUSDCBalance,
  getWallet,
  isWalletConnected
} from "../wallet/wallet-service";

const NavBarMenu = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  
  // Wallet states
  const [account, setAccount] = useState(null);
  const [usdcBaseBalance, setUsdcBaseBalance] = useState(0.0);
  const [loading, setLoading] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  
  // Use ref for wallet type to avoid issues with asynchronous state updates
  const walletTypeRef = useRef(null);

  // Firebase auth listener
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  // Check wallet connection on mount
  useEffect(() => {
    const checkWalletConnection = async () => {
      setLoading(true);
      try {
        const isConnected = await isWalletConnected();
        
        if (isConnected) {
          const wallet = await getWallet();
          if (wallet) {
            setAccount(wallet.address);
            walletTypeRef.current = wallet.walletType;
          } else {
            setAccount(null);
            walletTypeRef.current = null;
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

  // USDC balance fetching
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

  const formatEmail = (email) => {
    if (!email) return "";
    const username = email.replace(/@.*/, "");
    if (username.length > 9) {
      return `${username.substring(0, 6)}...`;
    }
    return username;
  };

  const handleSignOut = async () => {
    try {
      setIsOpen(false);
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleMenuClick = () => {
    try {
      setIsOpen(!isOpen);
    } catch (error) {
      console.error("Error with menu", error);
    }
  };

  const handleLearnClick = () => {
    try {
      setIsOpen(false);
      navigate("/learn");
    } catch (error) {
      console.error("Error with learn button", error);
    }
  };

  const handleConnectWallet = () => {
    setIsWalletModalOpen(true);
  };

  const handleConnect = useCallback(async (result, walletType) => {
    if (result && result.address) {
      setAccount(result.address);
      walletTypeRef.current = walletType;
    }
  }, []);

  const handleDisconnect = useCallback(async () => {
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
  }, []);

  const handleDeposit = async () => {
    // Gather necessary data to send in the redirect
    const referrer = "ZotSwap"; // Your app name
    const referrerLogo = "https://imgs.search.brave.com/NYtQTVlK3r7MVMoIqA85T_Hkxwygl-IYyEYn6FwNveE/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly91cGxv/YWQud2lraW1lZGlh/Lm9yZy93aWtpcGVk/aWEvY29tbW9ucy80/LzQ0L1JlY3ljbGUw/MDEuc3Zn"; // Your logo
    const callbackUrl = window.location.origin; // Current origin for callback
    const inputCurrency = "USD"; // Currency to swap from
    const toToken = "USDC"; // Token to swap to
    const recipientAddress = account; 
    
    const zkp2pUrl = `https://zkp2p.xyz/swap?referrer=${encodeURIComponent(referrer)}&referrerLogo=${encodeURIComponent(referrerLogo)}&callbackUrl=${encodeURIComponent(callbackUrl)}&inputCurrency=${encodeURIComponent(inputCurrency)}&toToken=${encodeURIComponent(toToken)}&recipientAddress=${encodeURIComponent(recipientAddress)}`;
    
    console.log("Redirecting to:", zkp2pUrl); 
    
    window.location.href = zkp2pUrl;
  };

  const IconButton = ({
    icon,
    label,
    onClick,
    colorScheme = "white",
    color = "black",
    variant = "ghost",
    iconSize = 8
  }) => (
    <Button
      onClick={onClick}
      bg={colorScheme}
      variant={variant}
      border="none"
      borderRadius="xl"
      size="lg"
      color={color}
      _hover={{ bg: `${colorScheme}.50` }}
    >
      <Box as={icon} boxSize={iconSize} mr={2} />
      {label}
    </Button>
  );

  if (!user) {
    return null;
  }

  return (
    <>
      {/* Button to toggle the menu */}
      <MenuButton icon={MdPerson} label={formatEmail(user.email)} onClick={handleMenuClick} />

      {/* Overlay that closes the menu when clicked */}
      {isOpen && (
        <Box
          position="fixed"
          top="0"
          left="0"
          width="100vw"
          height="100vh"
          zIndex={10}
          onClick={handleMenuClick}
        />
      )}

      {/* Sliding Menu */}
      <Box
        position="fixed"
        top="0"
        right="0"
        height="100vh"
        width={{base: "80vw", md: "44vw"}}
        bg="white"
        boxShadow="xl"
        transition="transform 0.3s ease-in-out"
        transform={isOpen ? "translateX(0)" : "translateX(100%)"}
        zIndex={20}
        overflowY="auto"
      >
        {/* Header with close button */}
        <Flex justify="flex-end" p={4}>
          <Button
            onClick={handleMenuClick}
            bg="white"
            variant="ghost"
            border="none"
            borderRadius="xl"
            size="lg"
            color="black"
            _hover={{ bg: "gray.50" }}
          >
            <Box as={MdClose} boxSize={8} />
          </Button>
        </Flex>

        <Box p={4}>
          {/* User info */}
          <Flex 
            align="center" 
            gap={2}
            justifyContent="center"
            mb={4}>  
            <MdPerson size={24} /> 
            <Text fontSize="lg" fontWeight="medium">{formatEmail(user.email)}</Text>
          </Flex>
          
          <Box borderBottom="1px" borderColor="gray.200" my={4} />

          {/* Wallet section */}
          {account ? (
            <Flex direction="column" align="center" mt={4} mb={6}>
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
            </Flex>
          ) : (
            <Flex justify="center" my={6}>
              <Button 
                onClick={handleConnectWallet} 
                isLoading={loading} 
                leftIcon={<MdWallet />} 
                size="lg" 
                colorScheme="teal"
                width="80%"
              >
                Connect Wallet
              </Button>
            </Flex>
          )}

          <Box borderBottom="1px" borderColor="gray.200" my={4} />

          {/* Navigation buttons */}
          <VStack spacing={4} mt={4}>
            <MenuButton icon={MdBook} label="Learn" onClick={handleLearnClick} />
            <MenuButton icon={MdLogout} label="Sign Out" onClick={handleSignOut} />
          </VStack>
        </Box>
      </Box>

      {/* Wallet connection modal */}
      <WalletModal 
        isOpen={isWalletModalOpen} 
        onClose={() => setIsWalletModalOpen(false)} 
        connecting={loading} 
        onConnect={handleConnect} 
      />
    </>
  );
};

export default NavBarMenu;