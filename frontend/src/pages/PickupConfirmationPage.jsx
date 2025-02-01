import {
  VStack,
  Text,
  Box,
  Circle,
  Button,
  Icon,
  HStack,
} from "@chakra-ui/react";
import {
  MdCheckCircle,
  MdInventory,
  MdCelebration,
  MdContentCopy,
} from "react-icons/md";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

function PickupConfirmationPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [returnDate, setReturnDate] = useState(null);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/items/${id}`);
        setItem(response.data);

        // Calculate return date
        const today = new Date();
        const futureDate = new Date(today);
        futureDate.setDate(today.getDate() + response.data.days_rented);
        setReturnDate(futureDate);
      } catch (error) {
        console.error("Error fetching item:", error);
      }
    };

    if (id) {
      fetchItem();
    }
  }, [id]);

  const handleCopy = async () => {
    const confirmationUrl = window.location.href;

    try {
      await navigator.clipboard.writeText(confirmationUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error("Error copying to clipboard:", error);
    }
  };

  const formatDate = (date) => {
    if (!date) return "Loading...";
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <VStack
      spacing={8}
      py={16}
      px={4}
      maxW="600px"
      mx="auto"
      align="center"
      mb={16}
    >
      <Box
        w="full"
        bg="green.50"
        p={6}
        borderRadius="xl"
        border="1px"
        borderColor="green.200"
      >
        <VStack spacing={3}>
          <Circle size="100px" bg="white">
            <Icon as={MdCheckCircle} color="green.500" boxSize="60px" />
          </Circle>
          <Text fontSize="2xl" fontWeight="bold" color="green.700">
            Pick Up Confirmed!
          </Text>
          <HStack spacing={2} color="green.600">
            <Icon as={MdInventory} />
            <Text fontSize="lg">{item?.name || "Loading..."}</Text>
          </HStack>
        </VStack>
      </Box>

      <Box
        w="full"
        bg="white"
        p={8}
        borderRadius="xl"
        border="1px"
        borderColor="gray.200"
        shadow="sm"
      >
        <VStack spacing={6}>
          <Icon as={MdCelebration} boxSize="60px" color="blue.500" />

          <VStack spacing={3} textAlign="center">
            <Text fontSize="xl" fontWeight="bold" color="gray.700">
              Thank You for Using Our Service!
            </Text>
            <Text fontSize="md" color="gray.600">
              We hope you enjoy your rental. Don't forget to return the item on
              time!
            </Text>
          </VStack>

          <VStack spacing={2} w="full" pt={4}>
            <Text fontSize="sm" color="gray.500">
              Return By
            </Text>
            <Text fontSize="lg" fontWeight="semibold" color="blue.600">
              {formatDate(returnDate)}
            </Text>
            <Text fontSize="sm" color="gray.500">
              ({item?.days_rented} days rental period)
            </Text>
          </VStack>
        </VStack>
      </Box>

      <Button
        size="lg"
        w="full"
        bg="green.700"
        color="white"
        onClick={() => navigate("/")}
        borderRadius="lg"
        shadow="md"
        _hover={{
          transform: "translateY(-2px)",
          shadow: "lg",
        }}
        transition="all 0.2s"
      >
        Back to Home
      </Button>

      <Button
        size="lg"
        bg="blue.700"
        color="white"
        onClick={handleCopy}
        borderRadius="lg"
        shadow="md"
        _hover={{
          transform: "translateY(-2px)",
          shadow: "lg",
        }}
        transition="all 0.2s"
        minW="120px"
      >
        <HStack>
          <Icon as={isCopied ? MdCheckCircle : MdContentCopy} boxSize={5} />
          <Text>{isCopied ? "Copied!" : "Copy Link"}</Text>
        </HStack>
      </Button>
    </VStack>
  );
}

export default PickupConfirmationPage;
