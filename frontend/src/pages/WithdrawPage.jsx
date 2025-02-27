import {
    Box,
    Container,
    Text,
    Input,
    Button,
    VStack,
    Image,
    Flex,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getUserUSDCBalance } from "../wallet/wallet";
import { useBreakpointValue } from "@chakra-ui/react";

const WithdrawPage = () => {
    const { walletAddress } = useParams();
    const [balance, setBalance] = useState("0.00");
    const [recipientAddress, setRecipientAddress] = useState("");
    const [isValidAddress, setIsValidAddress] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    const containerWidth = useBreakpointValue({
        base: "95%",
        md: "container.sm",
        sm: "85%"
    });
    const paddingTop = useBreakpointValue({
        base: "16",
        md: "24"
    });
    const fontSize = useBreakpointValue({
        base: "xl",
        md: "2xl"
    });
    const buttonSize = useBreakpointValue({
        base: "md",
        md: "lg"
    });
    const imageSize = useBreakpointValue({
        base: "20px",
        md: "24px"
    })

    useEffect(() => {
        const fetchBalance = async () => {
            const usdcBalance = await getUserUSDCBalance();
            if (usdcBalance) setBalance(usdcBalance);
        };
        fetchBalance();
    }, []);

    // Add display of current wallet
    <Box p={{base: 4, md: 6}} borderRadius="lg" borderWidth={1}>
        <Text mb={2}>From Wallet</Text>
        <Text fontsize="sm" fontWeight="gray.600">
            {walletAddress}
        </Text>
    </Box>

    const validateAddress = (address) => {
        // Ethereum/Base address regex
        const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
        return ethAddressRegex.test(address);
    };

    const handleAddressChange = (e) => {
        const address = e.target.value;
        setRecipientAddress(address);

        if (!address) {
            setIsValidAddress(true);
            setErrorMessage("");
        } else if (!validateAddress(address)) {
            setIsValidAddress(false);
            setErrorMessage("Please enter a valid Base address starting with '0x' followed by 40 hexadecimal characters.");
        } else {
            setIsValidAddress(true);
            setErrorMessage("");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateAddress(recipientAddress)) {
            setErrorMessage("Invalid Base address. Please enter a valid Base address.");
            return;
        }

        if (recipientAddress.toLowerCase() === walletAddress.toLowerCase()) {
            setErrorMessage("Cannot withdraw to the same wallet address.");
            return;
        }

        // Perform withdrawal logic here
        // Maybe use the recipientAddress and balance variables for the withdrawal?
        console.log("Withdrawing from: ", walletAddress);
        console.log("Withdrawing to:", recipientAddress);
    };

    return (
        <Container maxW={containerWidth} pt={paddingTop}>
            <VStack spacing={6} align="stretch">
                <Box textAlign="center" mb={6}>
                    <Text fontSize={fontSize} fontWeight="bold" mb={2}>
                        Withdraw USDC
                    </Text>
                    <Flex align="center" justify="center" gap={2}>
                        <Image
                            src="/usdc-logo.png"
                            alt="usdc logo"
                            boxSize={imageSize}
                        />
                        <Text>Base Network</Text>
                    </Flex>
                </Box>

                <Box p={{ base: 4, md: 6 }} borderRadius="lg" borderWidth={1}>
                    <Text mb={2}>Available Balance</Text>
                    <Text fontsize={fontSize} fontWeight="bold">
                        ${balance} USDC
                    </Text>
                </Box>

                <Box position="relative">
                    <Input
                        type="text"
                        placeholder="Recipient Address (0x...)"
                        value={recipientAddress}
                        onChange={handleAddressChange}
                        size={buttonSize}
                        borderColor={!isValidAddress ? "red.500" : recipientAddress ? "green.500" : "inherit"}
                        _hover={{ borderColor: !isValidAddress ? "red.600" : recipientAddress ? "green.600" : "inherit" }}
                        _focus={{ borderColor: !isValidAddress ? "red.500" : recipientAddress ? "green.500" : "blue.500" }}
                    />
                    <Text 
                        color={!isValidAddress ? "red.500" : recipientAddress ? "green.500" : "gray.500"} 
                        fontSize="sm" 
                        mt={1}
                    >
                        {errorMessage || (recipientAddress && "Valid Base address")}
                    </Text>
                </Box>

                <Button
                    colorScheme="blue"
                    size={buttonSize}
                    onClick={handleSubmit}
                    isDisabled={!isValidAddress || !recipientAddress}
                >
                    Withdraw
                </Button>
            </VStack>
        </Container>
    );
};

export default WithdrawPage;