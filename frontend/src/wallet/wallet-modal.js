import {
    Button,
    VStack,
    Text,
    Box,
    Image,
    Flex
  } from '@chakra-ui/react';
  import { useState } from 'react';
  import { MdClose } from "react-icons/md";
  import { FaEthereum } from "react-icons/fa";
  
  // Import your wallet connection functions
  import { 
    getWalletConnectors, 
    connectWallet,
    connectCoinbaseSmartWallet
  } from '../wallet/wallet-service';
  
  // Wallet type images
  const walletImages = {
    metaMask: "https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg",
    coinbaseWallet: "https://avatars.githubusercontent.com/u/18060234",
    coinbaseSmartWallet: "https://avatars.githubusercontent.com/u/18060234", // Same logo but will be handled differently
    walletConnect: "https://avatars.githubusercontent.com/u/37784886",
    injected: "https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" // Default for injected wallets
  };
  
  // Descriptions for wallets
  const walletDescriptions = {
    injected: 'Connect using browser extension',
    coinbaseWallet: 'Connect using Coinbase Wallet',
    walletConnect: 'Connect using WalletConnect'
  };
  
  export function WalletModal({ isOpen, onClose, connecting, onConnect }) {
    const [isConnecting, setIsConnecting] = useState(false);
    const [connectionType, setConnectionType] = useState('');
    
    // Get third-party wallet connectors from wagmi
    const thirdPartyConnectors = getWalletConnectors();
    
    const handleConnectWallet = async (connector, isCoinbaseSmartWallet = false) => {
      if (!connector && !isCoinbaseSmartWallet) {
        console.error("No connector selected");
        return;
      }
      
      setIsConnecting(true);
      setConnectionType(isCoinbaseSmartWallet ? 'coinbaseSmartWallet' : connector.id || connector.name);
      
      try {
        let result;
        
        if (isCoinbaseSmartWallet) {
          // Use Coinbase Smart Wallet SDK
          result = await connectCoinbaseSmartWallet();
        } else {
          // Use wagmi for third-party wallets
          result = await connectWallet(connector);
        }
        
        // Inform parent component about the connected wallet
        onConnect(result, isCoinbaseSmartWallet ? 'coinbaseSmart' : 'thirdParty');
        
        // Close modal after successful connection
        onClose();
      } catch (error) {
        console.error("Failed to connect wallet:", error);
      } finally {
        setIsConnecting(false);
      }
    };
  
    // If modal is not open, don't render anything
    if (!isOpen) return null;
  
    return (
      <Box
        position="fixed"
        top="0"
        left="0"
        width="100vw"
        height="100vh"
        backgroundColor="rgba(0, 0, 0, 0.5)"
        display="flex"
        justifyContent="center"
        alignItems="center"
        zIndex={50}
        onClick={onClose}
      >
        <Box
          backgroundColor="white"
          borderRadius="xl"
          boxShadow="xl"
          maxWidth="90%"
          width={{ base: "90%", md: "400px" }}
          onClick={(e) => e.stopPropagation()}
          overflow="hidden"
        >
          <Box p={4} display="flex" justifyContent="space-between" alignItems="center" borderBottom="1px" borderColor="gray.100">
            <Text fontSize="xl" fontWeight="bold">Connect Your Wallet</Text>
            <Button
              aria-label="Close modal"
              onClick={onClose}
              size="sm"
              variant="ghost"
              borderRadius="full"
            >
              <MdClose />
            </Button>
          </Box>
          
          <Box py={4} px={6}>
            {/* Coinbase Smart Wallet Option (Highlighted) */}
            <Box mb={4}>
              <Text fontSize="md" fontWeight="medium" mb={2} color="gray.700">Recommended</Text>
              <Button
                onClick={() => handleConnectWallet(null, true)}
                isLoading={isConnecting && connectionType === 'coinbaseSmartWallet'}
                loadingText="Connecting..."
                height="70px"
                width="100%"
                variant="solid"
                colorScheme="blue"
                borderRadius="lg"
                _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
                transition="all 0.2s"
              >
                <Flex width="100%" alignItems="center">
                  <Image 
                    src={walletImages.coinbaseSmartWallet} 
                    alt="Coinbase Smart Wallet" 
                    boxSize="32px" 
                    mr={3} 
                  />
                  <Box textAlign="left">
                    <Text fontWeight="bold">Coinbase Smart Wallet</Text>
                    <Text fontSize="xs">No gas fees, no wallet downloads</Text>
                  </Box>
                </Flex>
              </Button>
            </Box>
            
            {/* Border instead of Divider */}
            <Box borderTop="1px" borderColor="gray.200" my={4} />
            
            {/* Third-Party Wallet Options */}
            <Text fontSize="md" fontWeight="medium" mb={2} color="gray.700">Other Wallets</Text>
            <VStack spacing={3} align="stretch">
              {thirdPartyConnectors.map((connector) => {
                // Get appropriate image and description
                const walletId = connector.id.toLowerCase();
                // Try to use the icon directly from the connector if available
                const description = walletDescriptions[walletId] || walletDescriptions.injected;
                
                return (
                  <Button
                    key={connector.id}
                    onClick={() => handleConnectWallet(connector)}
                    isLoading={isConnecting && connectionType === connector.id}
                    loadingText="Connecting..."
                    height="60px"
                    variant="outline"
                    borderRadius="lg"
                    _hover={{ bg: "gray.50" }}
                  >
                    <Flex width="100%" alignItems="center">
                      {connector.icon ? (
                        // If connector has an icon property, use it directly
                        <Box as="img" src={connector.icon} alt={connector.name} boxSize="24px" mr={3} />
                      ) : connector.icons ? (
                        // Some connectors may have an 'icons' property instead
                        <Box as="img" src={connector.icons[0]} alt={connector.name} boxSize="24px" mr={3} />
                      ) : (
                        // Fallback to our predefined images
                        <Image 
                          src={walletImages[walletId] || walletImages.injected} 
                          alt={connector.name} 
                          boxSize="24px" 
                          mr={3} 
                        />
                      )}
                      <Box textAlign="left">
                        <Text fontWeight="bold">{connector.name}</Text>
                        <Text fontSize="xs" color="gray.500">{description}</Text>
                      </Box>
                    </Flex>
                  </Button>
                );
              })}
            </VStack>
          </Box>
          
          <Box p={4} borderTop="1px" borderColor="gray.100" bg="gray.50">
            <Text fontSize="xs" textAlign="center" color="gray.500">
              By connecting a wallet, you agree to our Terms of Service and Privacy Policy
            </Text>
          </Box>
        </Box>
      </Box>
    );
  }