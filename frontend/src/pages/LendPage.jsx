import {
  VStack,
  Text,
  Image,
  Box,
  Button,
  Badge,
  Flex,
  HStack,
  Icon,
  Grid,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import axios from "axios";
import {
  FaHandHoldingHeart,
  FaBoxOpen,
  FaLeaf,
  FaTree,
  FaEye,
} from "react-icons/fa";

function LendPage() {
  const [items, setItems] = useState([]);
  const [userEmail, setUserEmail] = useState(null);
  const [totalEmissions, setTotalEmissions] = useState(0);
  const navigate = useNavigate();

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
    const fetchData = async () => {
      if (!userEmail) return;

      try {
        const response = await axios.get(
          `http://localhost:3001/lenders/email/${userEmail}`
        );
        setItems(response.data);

        // Fetch emissions data for each item and filter out failed requests
        const emissionsPromises = response.data.map(
          (item) =>
            axios
              .get(
                `http://localhost:3001/carbon/emission-calculator/${item.id}`
              )
              .then((response) => response.data)
              .catch(() => null) // Return null for failed requests
        );

        const emissionsResponses = await Promise.all(emissionsPromises);
        const validEmissions = emissionsResponses.filter(
          (response) => response !== null
        );

        const totalSaved = validEmissions.reduce(
          (sum, data) => sum + data.total_emissions_kg,
          0
        );
        setTotalEmissions(totalSaved);
      } catch (error) {
        if (error.response?.status !== 404) {
          console.error("Error fetching data:", error);
        }
        setItems([]);
      }
    };

    fetchData();
  }, [userEmail]);

  const handlePickupConfirmation = async (itemId) => {
    try {
      await axios.put(`http://localhost:3001/lenders/${itemId}`, {
        is_picked_up: true,
        is_returned: false,
      });

      // Navigate to waiting page
      navigate(`/waiting/${itemId}`);
    } catch (error) {
      console.error("Error updating pickup status:", error);
      alert("Failed to update pickup status. Please try again.");
    }
  };

  const handleReturnConfirmation = async (itemId) => {
    try {
      await axios.put(`http://localhost:3001/lenders/${itemId}`, {
        is_picked_up: true,
        is_returned: true,
      });

      // Navigate to waiting page
      navigate(`/waiting/${itemId}`);
    } catch (error) {
      console.error("Error updating return status:", error);
      alert("Failed to update return status. Please try again.");
    }
  };

  const getStatusButton = (status, itemId, itemName) => {
    switch (status) {
      case "Awaiting Pickup":
        return (
          <Button
            mt={2}
            bg="green.700"
            size="sm"
            onClick={() => handlePickupConfirmation(itemId)}
          >
            Confirm Item is picked up
          </Button>
        );
      case "Renting":
        return (
          <Button
            colorScheme="green"
            size="sm"
            bg="green.700"
            mt={2}
            onClick={() => handleReturnConfirmation(itemId)}
          >
            Confirm Return
          </Button>
        );
      default:
        return null;
    }
  };

  const ImpactStat = ({ icon, label, value, unit }) => (
    <Box
      p={4}
      borderRadius="lg"
      bg="white"
      shadow="sm"
      border="1px"
      borderColor="green.100"
    >
      <VStack spacing={1} align="center">
        <Icon as={icon} boxSize={5} color="green.500" mb={1} />
        <Text fontSize="xs" color="green.600" fontWeight="medium">
          {label}
        </Text>
        <HStack spacing={1} align="baseline">
          <Text fontSize="xl" fontWeight="bold" color="green.700">
            {value}
          </Text>
          {unit && (
            <Text fontSize="xs" color="green.600">
              {unit}
            </Text>
          )}
        </HStack>
      </VStack>
    </Box>
  );

  return (
    <VStack spacing={8} py={16} px={4} maxW="600px" mx="auto" mb={16}>
      <Box
        w="full"
        bg="green.50"
        p={4}
        borderRadius="xl"
        border="1px"
        borderColor="green.200"
      >
        <VStack spacing={4}>
          <HStack spacing={2}>
            <Icon as={FaHandHoldingHeart} boxSize={5} color="green.500" />
            <Text fontSize="lg" fontWeight="bold" color="green.700">
              Your Environmental Impact
            </Text>
          </HStack>

          <VStack spacing={3} w="full">
            <Grid templateColumns="repeat(2, 1fr)" gap={3} w="full">
              <ImpactStat
                icon={FaBoxOpen}
                label="Items Listed"
                value={items.length}
              />

              <ImpactStat
                icon={FaLeaf}
                label="CO₂e Saved"
                value={totalEmissions.toFixed(1)}
                unit="kg"
              />
            </Grid>

            <Box w="full">
              <ImpactStat
                icon={FaTree}
                label="Trees Equivalent"
                value={(totalEmissions / 21).toFixed(1)}
                unit="trees"
              />
            </Box>
          </VStack>
        </VStack>
      </Box>

      {items.length === 0 ? (
        <Text color="gray.500">No items listed yet</Text>
      ) : (
        items.map((item) => (
          <Flex
            key={item.id}
            w="full"
            borderWidth={1}
            borderRadius="lg"
            overflow="hidden"
            p={4}
            gap={4}
          >
            <Image
              src={item.images[0]}
              alt={item.name}
              boxSize="100px"
              objectFit="cover"
              borderRadius="md"
            />
            <Box flex={1}>
              <Text fontSize="xl" fontWeight="semibold">
                {item.name}
              </Text>
              <Badge
                colorScheme={
                  item.is_picked_up
                    ? item.is_returned
                      ? "green"
                      : "yellow"
                    : "blue"
                }
              >
                {item.status}
              </Badge>
              <Text fontSize="sm" color="gray.500" mt={2}>
                ${item.rental_fee}/day
              </Text>

              {getStatusButton(item.status, item.id, item.name)}

              <HStack spacing={2} mt={3}>
                <Button
                  size="sm"
                  leftIcon={<FaEye />}
                  variant="outline"
                  colorScheme="blue"
                  onClick={() => navigate(`/items/${item.id}`)}
                >
                  View Item
                </Button>
              </HStack>
            </Box>
          </Flex>
        ))
      )}
    </VStack>
  );
}

export default LendPage;
