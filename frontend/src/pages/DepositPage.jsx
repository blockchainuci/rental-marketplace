import { useParams } from "react-router-dom";
import { Box, Text, Button, Input, useClipboard, VStack } from "@chakra-ui/react";


const DepositPage = () => {

    const { walletAddress } = useParams();
    const { hasCopied, onCopy } = useClipboard(walletAddress);

    return(
        <Box 
      maxW={{ base: "90%", md: "50%" }} 
      mx="auto" 
      mt={10} 
      p={6} 
      borderRadius="lg" 
      bg="white" 
      boxShadow="md"
    >
      <VStack spacing={6} align="start">
        <Text fontSize="2xl" fontWeight="bold">Deposit Funds</Text>

        <Box p={4} bg="gray.100" borderRadius="md" w="full">
          <Text fontSize="md" fontWeight="medium">Accepted Currency:</Text>
          <Text fontSize="lg" fontWeight="bold" color="blue.600">USDC on BASE network</Text>
        </Box>

        <Box p={4} bg="gray.100" borderRadius="md" w="full">
          <Text fontSize="md" fontWeight="medium">Wallet Balance:</Text>
          <Text fontSize="lg" fontWeight="bold" color="green.600">$0.00</Text>
        </Box>

        <Box w="full">
          <Text fontSize="md" fontWeight="medium" mb={1}>Your Wallet Address:</Text>
          <Input value={walletAddress} isReadOnly />
          <Button mt={2} onClick={onCopy} colorScheme="blue">
            {hasCopied ? "Copied!" : "Copy Address"}
          </Button>
        </Box>
      </VStack>
    </Box>
    );
};

export default DepositPage;
