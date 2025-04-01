import {
    Button,
    VStack,
    Text,
    Box,
    IconButton,
} from '@chakra-ui/react';
import { getWalletConnectors, connectWallet } from '../wallet/multi-wallet';
import { FaEthereum } from "react-icons/fa";
import { SiCoinbase, SiBrave, SiOpera } from "react-icons/si";
import { MdClose } from "react-icons/md";

// Mapping of connector IDs to icons and descriptions (you might need to extend this)
const CONNECTOR_ICONS = {
    injected: FaEthereum, // Default for injected wallets (MetaMask, Brave, etc.)
    coinbaseWallet: SiCoinbase,
    braveWallet: SiBrave,
    operaWallet: SiOpera,
    // Add more mappings as needed
};

const CONNECTOR_DESCRIPTIONS = {
    injected: 'Connect using your browser wallet extension',
    coinbaseWallet: 'Connect using Coinbase Wallet extension',
    braveWallet: 'Connect using Brave browser wallet',
    operaWallet: 'Connect using Opera browser wallet',
    // Add more descriptions as needed
};

export function WalletModal({ isOpen, onClose, connecting, onConnect }) {
    const connectors = getWalletConnectors();
    const handleConnectWallet = async (connector) => {
        if (!connector) {
            console.error("No connector selected");
            return; // Guard against invalid connectors
        }
    
        try {
            // Inform parent component (or modal) about the selected connector
            onConnect(connector);
    
            // Proceed to connect wallet with the selected connector
            await connectWallet(connector);
    
            // Close the modal or UI component after successful connection
            onClose();
        } catch (error) {
            // Log any errors encountered during the connection process
            console.error("Failed to connect wallet:", error);
        }
    };

    return (
        <Box
            position="fixed"
            top="0"
            left="-100"
            width="100vw"
            height="100vh"
            backgroundColor="rgba(0, 0, 0, 0.5)"
            display={isOpen ? "flex" : "none"} // Ensure modal is hidden when isOpen is false
            justifyContent="center"
            alignItems="center"
            zIndex={50}
            onClick={onClose}
        >

            <Box
                backgroundColor="white"
                borderRadius="md"
                boxShadow="md"
                maxWidth="90%"
                width={{ base: "90%", md: "400px" }}
                onClick={(e) => e.stopPropagation()}
            >
                <Box p={4} display="flex" justifyContent="space-between" alignItems="center">
                    <Text fontSize="xl" fontWeight="bold">Connect Your Wallet</Text>
                    <IconButton
                        aria-label="Close modal"
                        icon={<MdClose />}
                        onClick={onClose}
                        size="sm"
                        borderRadius="full"
                    />
                </Box>
                <Box  pb={6}>
                    <VStack spacing={4} align="stretch">
                        {connectors.map((connector) => {
                            const Icon = connector.icon || FaEthereum;
                            const description = CONNECTOR_DESCRIPTIONS[connector.id] || CONNECTOR_DESCRIPTIONS.injected;

                            return (
                                        <Button
            key={connector.id}
            onClick={() => handleConnectWallet(connector)} // Make sure connector is passed correctly here
            isLoading={connecting}
            height="60px"
            variant="outline"
            leftIcon={<img src={connector.icon} size={24} />}
            _hover={{ bg: "gray.50" }}
        >
            <Box textAlign="left">
                <Text fontWeight="bold">{connector.name}</Text>
                <Text fontSize="xs" color="gray.500">{description}</Text>
            </Box>
        </Button>
                            );
                        })}
                    </VStack>
                </Box>
            </Box>
        </Box>
    );
}
