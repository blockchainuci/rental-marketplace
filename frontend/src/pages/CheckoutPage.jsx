import { useParams, useNavigate } from "react-router-dom";
import {
  Flex,
  Text,
  Box,
  Image,
  Input,
  VStack,
  Button,
  Spinner,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { auth } from "../firebase";
import axios from "axios";

function CheckoutPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(1);
  const [userEmail, setUserEmail] = useState(null);
  const walletAddress = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserEmail(user.email);
      } else {
        navigate("/signin");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/items/${id}`);
        setItem(response.data);
      } catch (error) {
        console.error("Error fetching item:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  if (loading) {
    return (
      <Flex justify="center" align="center" h="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (!item) {
    return <Text>Item not found</Text>;
  }

  const rentalTotal = item.rental_fee * days;
  const finalTotal = rentalTotal + item.collateral;

  const handleDaysChange = (e) => {
    const value = e.target.value;
    if (value === "") {
      setDays("");
    } else {
      const numValue = parseInt(value);
      setDays(numValue >= 1 ? numValue : 1);
    }
  };

  const handleSubmitPayment = async () => {
    try {
      // First update the item with days_rented
      await axios.put(`http://localhost:3001/items/${id}`, {
        ...item, // Spread existing item properties
        days_rented: days, // Add the new days_rented value
        status: "Awaiting Pickup",
      });

      // Then create renter record
      await axios.post("http://localhost:3001/renters", {
        item_id: parseInt(id),
        email: userEmail,
      });

      // Navigate to confirmation page
      navigate(`/checkout_confirmation/${id}`);
    } catch (error) {
      console.error("Error processing payment:", error);
      alert("Failed to process payment. Please try again.");
    }
  };

  return (
    <Flex
      direction="column"
      align="center"
      py={16}
      px={4}
      maxW="800px"
      mx="auto"
      mb={16}
    >
      {/* Item Summary Section */}
      <Flex gap={6} w="full" align="center" mb={6}>
        <Image
          src={item.images[0]}
          alt={item.name}
          boxSize="100px"
          objectFit="cover"
          borderRadius="md"
        />
        <Text fontSize="2xl" fontWeight="bold">
          {item.name}
        </Text>
      </Flex>

      {/* Rental Duration Section */}
      <VStack spacing={2} w="full" align="start" mb={4}>
        <Text fontWeight="semibold">Rental Duration</Text>
        <Input
          type="number"
          value={days}
          max={item.days_limit}
          onChange={handleDaysChange}
          placeholder="Number of days"
          w="200px"
        />
        <Text fontSize="lg" color="green.600">
          Rental Total: ${days ? rentalTotal : 0} (${item.rental_fee} ×{" "}
          {days || 0} days)
        </Text>
      </VStack>

      <Box h="1px" bg="gray.200" my={4} w="full" />

      {/* What's Next Section */}
      <VStack spacing={3} w="full" align="start">
        <Text fontSize="xl" fontWeight="bold">
          What's Next?
        </Text>
        <Text color="gray.700">
          Your payment and collateral will be given directly to the lender
          during a meetup. Once confirmed, arrange a meetup with the lender to
          collect the item. The lender will return your collateral when you
          return the item in its original condition.
        </Text>
      </VStack>

      <Box h="1px" bg="gray.200" my={4} w="full" />

      {/* Payment Summary Section */}
      <VStack spacing={3} w="full" align="start">
        <Text fontSize="xl" fontWeight="bold">
          Payment Summary
        </Text>

        <VStack spacing={1} w="full" align="start">
          <Flex justify="space-between" w="full">
            <Text>Rental Fee ({days} days)</Text>
            <Text>${rentalTotal}</Text>
          </Flex>
          <Flex justify="space-between" w="full">
            <Text>Collateral</Text>
            <Text>${item.collateral}</Text>
          </Flex>
          <Box h="1px" bg="gray.200" my={2} w="full" />
          <Flex justify="space-between" w="full">
            <Text fontWeight="bold">Total to Pay</Text>
            <Text fontWeight="bold">${finalTotal}</Text>
          </Flex>
        </VStack>
      </VStack>

      <Button
        mt={8}
        size="lg"
        w="full"
        colorScheme="green"
        onClick={handleSubmitPayment}
        isDisabled={!userEmail}
      >
        Submit Payment
      </Button>
    </Flex>
  );
}

export default CheckoutPage;
