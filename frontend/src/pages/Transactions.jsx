import {
    VStack,
    Text,
    Box,
    Spinner,
    Flex,
    HStack,
    Icon,
    Grid,
    Badge,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { FaList, FaArrowUp, FaArrowDown } from "react-icons/fa";
import { connectWallet, getTransactions } from "../wallet/wallet.js";

function TransactionsPage() {
    const [user, setUser] = useState(null);
    const [account, setAccount] = useState(null);
    const [loading, setLoading] = useState(true);
    const [transactions, setTransactions] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        async function autoConnectWallet() {
            try {
                const accounts = await connectWallet();
                if (accounts && accounts.length > 0) {
                    setAccount(accounts[0]); // Set the first account
                    const txs = await getTransactions(accounts[0]); // Fetch transactions
                    setTransactions(txs);
                }
            } catch (error) {
                console.error("Auto-connect error:", error);
            }
            setLoading(false);
        }
        autoConnectWallet();
    }, []);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setUser(user);
            } else {
                navigate("/signin");
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    if (loading) {
        return (
            <Flex justify="center" align="center" h="100vh">
                <Spinner size="xl" />
            </Flex>
        );
    }

    return (
        <VStack spacing={8} py={16} px={4} maxW="600px" mx="auto" mb={16}>
            <Box
                w="full"
                bg="blue.50"
                p={4}
                borderRadius="xl"
                border="1px"
                borderColor="blue.200"
            >
                <VStack spacing={4}>
                    <HStack spacing={2}>
                        <Icon as={FaList} boxSize={5} color="blue.500" />
                        <Text fontSize="lg" fontWeight="bold" color="blue.700">
                            Your Transactions
                        </Text>
                    </HStack>
                </VStack>
            </Box>

            {transactions.length === 0 ? (
                <Text color="gray.500">No transactions found</Text>
            ) : (
                transactions.map((transaction) => {
                    const isSent = transaction.from.toLowerCase() === account?.toLowerCase();
                    const formattedAmount = (parseFloat(transaction.value) / 10 ** transaction.tokenDecimal).toFixed(2);
                    const formattedTime = new Date(transaction.timeStamp * 1000).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "numeric",
                        minute: "numeric",
                        hour12: true,
                    });

                    return (
                        <Flex
                            key={transaction.hash}
                            w="full"
                            borderWidth={1}
                            borderRadius="lg"
                            overflow="hidden"
                            p={4}
                            gap={4}
                            position="relative"
                            bg="white"
                            shadow="sm"
                        >
                            <Box flex={1} position="relative">
                                {/* Sent or Received Badge */}
                                <Badge
                                    colorScheme={isSent ? "red" : "green"}
                                    position="absolute"
                                    top={0}
                                    left={0}
                                >
                                    {isSent ? "Sent" : "Received"}
                                </Badge>

                                {/* Timestamp */}
                                <Text fontSize="sm" color="gray.500" mt={6}>
                                    {formattedTime}
                                </Text>

                                {/* Transaction Amount */}
                                <Text fontSize="xl" fontWeight="semibold" mt={2}>
                                    {isSent ? "-" : "+"}{formattedAmount} {transaction.tokenSymbol}
                                </Text>

                                {/* Transaction Partner */}
                                <Text fontSize="sm" color="gray.600" mt={1} wordBreak="break-all">
                                    {isSent ? `To: ${transaction.to}` : `From: ${transaction.from}`}
                                </Text>

                                {/* Transaction Hash */}
                                <Text fontSize="xs" color="gray.400" mt={2} wordBreak="break-all" isTruncated>
                                    Tx: {transaction.hash}
                                </Text>
                            </Box>

                            {/* Transaction Direction Icon */}
                            <Flex justify="center" align="center">
                                <Icon as={isSent ? FaArrowUp : FaArrowDown} boxSize={6} color={isSent ? "red.500" : "green.500"} />
                            </Flex>
                        </Flex>
                    );
                })
            )}
        </VStack>
    );
}

export default TransactionsPage;
