import { useParams } from "react-router-dom";
import { Box, Text, Image, HStack, Button, Input, useClipboard, VStack } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { getUserUSDCBalance, getWallet } from "../wallet/wallet";  // Updated import
import { useBreakpointValue } from "@chakra-ui/react";


const DepositPage = () => {
    const { walletAddress = ""} = useParams();
    //const [setWalletAddress] = useState("");
    const [balance, setBalance] = useState("0.00");
    const fontSize = useBreakpointValue({
      base: "xl",
      md: "2xl"
  });
  
    useEffect(() => {
      const initializeWallet = async () => {
          const wallet = await getWallet();  // Using getWallet instead
          if (wallet) {
              //setWalletAddress(wallet);
              const usdcBalance = await getUserUSDCBalance(wallet);
              if (usdcBalance) setBalance(usdcBalance);
          }
      };
      
      initializeWallet();
  }, []);

  useEffect(() => {
      const fetchBalance = async () => {
          const usdcBalance = await getUserUSDCBalance();
          if (usdcBalance) setBalance(usdcBalance);
      };
      fetchBalance();
  }, []);

    const handleCopy = () => {
        navigator.clipboard.writeText(walletAddress)
        .then(() => alert("Copied!"))
        .catch(err => console.error("Copy failed", err));
    };

    return(
        <Box 
      maxW={{ base: "90%", md: "50%" }} 
      mx="auto" 
      mt={10} 
      p={6} 
      borderRadius="lg" 
      bg="white" 
      //boxShadow="md"
    >
      <VStack spacing={6} align="center">
        <Text fontSize="2xl" fontWeight="bold">Deposit USDC</Text>

          <HStack>
            <Image src="https://cryptologos.cc/logos/usd-coin-usdc-logo.png" 
                alt="USDC Logo" 
                boxSize="30px" 
                mr={2} 
            />
            <Text fontSize="lg" color="black.600">Base Network</Text>
            </HStack>
        
        <Box w="full">
          <Box p={{ base: 4, md: 6 }} borderRadius="lg" borderWidth={1}>
            <Text mb={2}>Available Balance</Text>
            <Text fontsize={fontSize} fontWeight="bold">
              ${balance} USDC
            </Text>
        </Box>
          <Text fontSize="md" fontWeight="medium" mb={1}>Your Wallet Address:</Text>
          <Input value={walletAddress} isReadOnly />
          <Button mt={2} onClick={handleCopy} colorScheme="blue">
            Copy Address
          </Button>
        </Box>
      </VStack>
    </Box>
    );
};

export default DepositPage;
