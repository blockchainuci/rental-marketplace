import { useState, useEffect } from "react";
import { VStack, Box, Text, Icon, Grid, HStack } from "@chakra-ui/react";
import { FaHandHoldingHeart, FaLeaf, FaTree } from "react-icons/fa";
import axios from "axios";
import LedgerCard from "../components/LedgerCard";

function LedgerPage() {
  const [items, setItems] = useState([]);
  const [totalEmissions, setTotalEmissions] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:3001/items/ledger");
        // Filter out items with status "Listed"
        const filteredItems = response.data.filter(
          (item) => item.status !== "Listed"
        );
        setItems(filteredItems);

        // Fetch emissions data for filtered items
        const emissionsPromises = filteredItems.map((item) =>
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

  return (
    <VStack width="100%" spacing={8} py={16} mb={16}>
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
              UCI Students' Environmental Impact
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
                  Total CO₂e Saved
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
                  Trees Saved
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

      <VStack spacing={8} px={4} maxW="600px" mx="auto">
        {items.length === 0 ? (
          <Text color="gray.500">No rental history yet</Text>
        ) : (
          items.map((item) => <LedgerCard key={item.id} item={item} />)
        )}
      </VStack>
    </VStack>
  );
}

export default LedgerPage;
