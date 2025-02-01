import { Flex, Image, Text, Box, Icon, HStack, VStack } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { FaLeaf, FaTree } from "react-icons/fa";
import { useState, useEffect } from "react";
import axios from "axios";

const ItemCard = ({ id, images, rental_fee, name }) => {
  const navigate = useNavigate();
  const [emissionsData, setEmissionsData] = useState(null);

  useEffect(() => {
    const fetchEmissions = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/carbon/emission-calculator/${id}`
        );
        setEmissionsData(response.data);
      } catch (error) {
        console.error("Error fetching emissions:", error);
      }
    };
    fetchEmissions();
  }, [id]);

  return (
    <Box
      bg="white"
      borderRadius="2xl"
      boxShadow="lg"
      overflow="hidden"
      w={172}
      key={id}
      onClick={() => navigate(`/items/${id}`)}
      cursor="pointer"
    >
      <Image mx="auto" h="150px" objectFit="cover" src={images[0]} alt={name} />
      <Box p={4}>
        <Text
          fontSize="lg"
          fontWeight="bold"
          mb={2}
          overflow="hidden"
          textOverflow="ellipsis"
          whiteSpace="nowrap"
          h={6}
        >
          {name}
        </Text>
        <Flex justify="space-between" align="center" mb={2}>
          <Text fontSize="xl" fontWeight="bold" color="green.600">
            ${rental_fee} per day
          </Text>
        </Flex>
        {emissionsData && (
          <VStack spacing={1} align="stretch">
            <HStack spacing={1} color="gray.600">
              <Icon as={FaLeaf} color="green.500" />
              <Text fontSize="sm">
                {emissionsData.total_emissions_kg} kg CO₂e
              </Text>
            </HStack>
            <HStack spacing={1} color="gray.600">
              <Icon as={FaTree} color="green.700" />
              <Text fontSize="sm">
                {(emissionsData.total_emissions_kg / 21).toFixed(1)} trees
              </Text>
            </HStack>
          </VStack>
        )}
      </Box>
    </Box>
  );
};

export default ItemCard;
