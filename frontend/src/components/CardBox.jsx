import {
  Button,
  Flex,
  Box,
  Text,
  VStack,
  HStack,
  Icon,
  Grid,
} from "@chakra-ui/react";
import ItemCard from "./ItemCard";
import axios from "axios";
import { useState, useEffect } from "react";
import { FaHandHoldingHeart, FaLeaf, FaTree } from "react-icons/fa";

const CardBox = () => {
  const [items, setItems] = useState([]);
  const [totalEmissions, setTotalEmissions] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:3001/items");
        const listedItems = response.data.filter(
          (item) => item.status === "Listed"
        );
        setItems(response.data.reverse()); // Keep all items for display

        // Fetch emissions data only for Listed items
        const emissionsPromises = listedItems.map((item) =>
          axios
            .get(`http://localhost:3001/carbon/emission-calculator/${item.id}`)
            .then((response) => response.data)
            .catch(() => null)
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
        console.error("Error fetching items:", error);
      }
    };
    fetchData();
  }, []);

  const itemsMap = items.map(
    (item) =>
      item.status === "Listed" && (
        <ItemCard
          key={item.id}
          id={item.id}
          images={item.images}
          rental_fee={item.rental_fee}
          name={item.name}
        />
      )
  );

  // Count only Listed items
  const listedItemsCount = items.filter(
    (item) => item.status === "Listed"
  ).length;

  return (
    <VStack width="100%" spacing={8}>
      <Box
        w="full"
        maxW="600px"
        bg="blue.50"
        p={4}
        borderRadius="xl"
        border="1px"
        borderColor="green.200"
        mx="auto"
      >
        <VStack spacing={4}>
          <HStack spacing={2}>
            <Icon as={FaHandHoldingHeart} boxSize={5} color="green.500" />
            <Text fontSize="lg" fontWeight="bold" color="blue.700">
              Please Save All The Trees 😢
            </Text>
          </HStack>

          <Grid templateColumns="repeat(2, 1fr)" gap={3} w="full">
            <Box
              p={4}
              borderRadius="lg"
              bg="white"
              shadow="sm"
              border="1px"
              borderColor="green.100"
            >
              <VStack spacing={1} align="center">
                <Icon as={FaLeaf} boxSize={5} color="green.500" mb={1} />
                <Text fontSize="xs" color="green.600" fontWeight="medium">
                  Total CO₂e to be Saved
                </Text>
                <HStack spacing={1} align="baseline">
                  <Text fontSize="xl" fontWeight="bold" color="green.700">
                    {totalEmissions.toFixed(1)}
                  </Text>
                  <Text fontSize="xs" color="green.600">
                    kg
                  </Text>
                </HStack>
              </VStack>
            </Box>

            <Box
              p={4}
              borderRadius="lg"
              bg="white"
              shadow="sm"
              border="1px"
              borderColor="green.100"
            >
              <VStack spacing={1} align="center">
                <Icon as={FaTree} boxSize={5} color="green.500" mb={1} />
                <Text fontSize="xs" color="green.600" fontWeight="medium">
                  Trees to be Saved
                </Text>
                <HStack spacing={1} align="baseline">
                  <Text fontSize="xl" fontWeight="bold" color="green.700">
                    {(totalEmissions / 21).toFixed(1)}
                  </Text>
                  <Text fontSize="xs" color="green.600">
                    trees
                  </Text>
                </HStack>
              </VStack>
            </Box>
          </Grid>
        </VStack>
      </Box>

      <Flex width="100%" justifyContent="center" px={1}>
        <Flex wrap="wrap" justifyContent="center" width="100%" gap="3">
          {itemsMap}
        </Flex>
      </Flex>
    </VStack>
  );
};

export default CardBox;
