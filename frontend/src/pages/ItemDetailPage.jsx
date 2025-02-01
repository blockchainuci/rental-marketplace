import {
  Flex,
  Text,
  Button,
  Box,
  Spinner,
  Grid,
  Icon,
  VStack,
  HStack,
  Badge,
  Progress,
} from "@chakra-ui/react";
import ImageCarousel from "../components/ImageCarousel";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useState, useEffect } from "react";
import {
  MdCategory,
  MdRecycling,
  MdPublic,
  MdLocalShipping,
  MdBolt,
  MdTimer,
  MdInventory,
  MdEmail,
} from "react-icons/md";
import { GiWeight } from "react-icons/gi";
import { FaLeaf } from "react-icons/fa";
import { MdShoppingCart } from "react-icons/md";
import { auth } from "../firebase";

function ItemDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [carbonData, setCarbonData] = useState(null);
  const [emissionsData, setEmissionsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEmail, setShowEmail] = useState(false);
  const [lenderEmail, setLenderEmail] = useState("");
  const [currentUserEmail, setCurrentUserEmail] = useState(null);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUserEmail(user.email);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemResponse, carbonResponse, emissionsResponse] =
          await Promise.all([
            axios.get(`http://localhost:3001/items/${id}`),
            axios.get(`http://localhost:3001/carbon/item/${id}`),
            axios.get(`http://localhost:3001/carbon/emission-calculator/${id}`),
          ]);
        setItem(itemResponse.data);

        // Fetch lender email and check if current user is the owner
        const lenderResponse = await axios.get(
          `http://localhost:3001/lenders/${id}`
        );
        setLenderEmail(lenderResponse.data.email);
        setIsOwner(lenderResponse.data.email === currentUserEmail);

        // Parse material_composition from string to array
        const carbonDataWithParsedMaterials = {
          ...carbonResponse.data,
          material_composition: carbonResponse.data.material_composition
            .replace(/[{"}]/g, "") // Remove {, }, and " characters
            .split(",") // Split into array by comma
            .map((material) => material.trim()), // Remove any whitespace
        };

        setCarbonData(carbonDataWithParsedMaterials);
        setEmissionsData(emissionsResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id && currentUserEmail) {
      fetchData();
    }
  }, [id, currentUserEmail]);

  const InfoCard = ({ icon, title, value, unit }) => {
    // Color mapping for different card types
    const getColorScheme = (title) => {
      switch (title.toLowerCase()) {
        case "category":
          return { bg: "blue.50", icon: "blue.500", border: "blue.200" };
        case "weight":
          return { bg: "purple.50", icon: "purple.500", border: "purple.200" };
        case "origin":
          return { bg: "green.50", icon: "green.500", border: "green.200" };
        case "transportation":
          return { bg: "orange.50", icon: "orange.500", border: "orange.200" };
        case "energy usage":
          return { bg: "yellow.50", icon: "yellow.600", border: "yellow.200" };
        case "lifetime":
          return { bg: "cyan.50", icon: "cyan.500", border: "cyan.200" };
        case "disposal method":
          return { bg: "teal.50", icon: "teal.500", border: "teal.200" };
        case "materials":
          return { bg: "pink.50", icon: "pink.500", border: "pink.200" };
        default:
          return { bg: "gray.50", icon: "gray.500", border: "gray.200" };
      }
    };

    const colors = getColorScheme(title);

    return (
      <Box
        p={4}
        borderRadius="lg"
        border="1px"
        borderColor={colors.border}
        bg={colors.bg}
        _hover={{
          shadow: "md",
          transform: "translateY(-2px)",
          borderColor: colors.icon,
        }}
        transition="all 0.2s"
      >
        <VStack spacing={2} align="start">
          <HStack spacing={2}>
            <Icon as={icon} boxSize={5} color={colors.icon} />
            <Text fontSize="sm" color="gray.700" fontWeight="medium">
              {title}
            </Text>
          </HStack>
          <Text fontSize="lg" fontWeight="bold" color="gray.800">
            {value} {unit}
          </Text>
        </VStack>
      </Box>
    );
  };

  const handleEmailClick = () => {
    if (lenderEmail) {
      setShowEmail(true);
      const subject = `Question about ${item.name}`;
      const body = `Hi, I'm interested in renting your ${item.name}.`;
      const mailtoLink = `mailto:${lenderEmail}?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(body)}`;
      window.open(mailtoLink, "_blank");
    }
  };

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

  return (
    <Flex direction="column" align="center" py={16} w="full" mb={10}>
      {/* Left side - Images */}
      <Flex>
        <ImageCarousel images={item.images} />
      </Flex>

      {/* Right side - Item details */}
      <Flex direction="column" w="full" px={3}>
        <Text fontSize="3xl" fontWeight="bold">
          {item.name}
        </Text>

        <Flex direction="column">
          <Text fontSize="3xl" color="green.600" fontWeight="semibold">
            ${item.rental_fee} per day
          </Text>
          <Text fontSize="md" color="gray.600">
            + ${item.collateral} collateral
          </Text>
        </Flex>

        <Flex justifyContent={"center"} gap={2} mt={4}>
          <Button
            size="xl"
            borderRadius={"lg"}
            w="50%"
            bg="green.500"
            onClick={() => navigate(`/checkout/${id}`)}
            _hover={{ bg: "green.600" }}
            isDisabled={isOwner}
            title={isOwner ? "You cannot rent your own item" : ""}
          >
            <HStack spacing={2}>
              <Icon as={MdShoppingCart} boxSize={5} />
              <Text>{isOwner ? "Your Item" : "Rent Now"}</Text>
            </HStack>
          </Button>
          <Button
            size="xl"
            borderRadius={"lg"}
            w="50%"
            bg="blue.500"
            onClick={handleEmailClick}
            _hover={{ bg: "blue.600" }}
            isDisabled={isOwner}
            title={isOwner ? "This is your item" : ""}
          >
            <HStack spacing={2}>
              <Icon as={MdEmail} boxSize={5} />
              <Text>
                {isOwner
                  ? "Your Item"
                  : showEmail && lenderEmail
                  ? lenderEmail
                  : "Message Lender"}
              </Text>
            </HStack>
          </Button>
        </Flex>

        <Box h="2px" bg="gray.200" my={4} />

        <Text fontSize="xl" fontWeight="bold" mb={2}>
          Description
        </Text>
        <Text fontSize="md" color="blue.600">
          📅 Days limit: {item.days_limit}
        </Text>
        <Text fontSize="md" color="gray.700" mt={2} mb={9}>
          {item.description}
        </Text>

        {/* New Environmental Impact Section */}
        <Text fontSize="xl" fontWeight="bold" mb={4}>
          Environmental Impact
        </Text>

        {carbonData && emissionsData && (
          <Grid templateColumns={"repeat(2, 1fr)"} gap={4} mb={8}>
            <InfoCard
              icon={MdCategory}
              title="Category"
              value={carbonData.category}
            />

            <InfoCard
              icon={GiWeight}
              title="Weight"
              value={carbonData.estimated_weight_kg}
              unit="kg"
            />

            <InfoCard
              icon={MdPublic}
              title="Origin"
              value={carbonData.country_of_origin}
            />

            <InfoCard
              icon={MdLocalShipping}
              title="Transportation"
              value={`${carbonData.transportation_distance_km} km by ${carbonData.transport_mode}`}
            />

            <InfoCard
              icon={MdBolt}
              title="Energy Usage"
              value={carbonData.usage_energy_kwh_per_year}
              unit="kWh/year"
            />

            <InfoCard
              icon={MdTimer}
              title="Lifetime"
              value={carbonData.lifetime_years}
              unit="years"
            />

            <InfoCard
              icon={MdRecycling}
              title="Disposal Method"
              value={carbonData.disposal_method}
            />

            <Box
              p={4}
              borderRadius="lg"
              border="1px"
              borderColor="pink.200"
              bg="pink.50"
              _hover={{
                shadow: "md",
                transform: "translateY(-2px)",
                borderColor: "pink.500",
              }}
              transition="all 0.2s"
            >
              <VStack align="start" spacing={2}>
                <HStack>
                  <Icon as={MdInventory} boxSize={5} color="pink.500" />
                  <Text fontSize="sm" color="gray.700" fontWeight="medium">
                    Materials
                  </Text>
                </HStack>
                <Flex gap={2} flexWrap="wrap">
                  {carbonData.material_composition.map((material, index) => (
                    <Badge
                      key={index}
                      bg="blue.500"
                      color="white"
                      borderRadius="full"
                      px={2}
                      py={1}
                    >
                      {material}
                    </Badge>
                  ))}
                </Flex>
              </VStack>
            </Box>
          </Grid>
        )}

        {carbonData && emissionsData && (
          <>
            <Text fontSize="xl" fontWeight="bold" mb={4} mt={8}>
              Carbon Footprint Analysis
            </Text>
            <Box
              p={4}
              borderRadius="xl"
              bg="green.50"
              border="1px"
              borderColor="green.200"
              mb={8}
            >
              <VStack spacing={6} align="stretch">
                <VStack align="start" spacing={1} mb={2}>
                  <HStack spacing={2}>
                    <Icon as={FaLeaf} boxSize={5} color="green.500" />
                    <Text fontSize="md" fontWeight="bold" color="green.700">
                      Total Carbon Emissions
                    </Text>
                  </HStack>
                  <Text
                    fontSize="2xl"
                    fontWeight="bold"
                    color="green.700"
                    pl={7}
                  >
                    {emissionsData.total_emissions_kg} kg CO₂e
                  </Text>
                </VStack>

                <Grid templateColumns={{ base: "1fr" }} gap={4}>
                  <Box>
                    <HStack justify="space-between" mb={1}>
                      <Text fontSize="sm" fontWeight="medium" color="blue.700">
                        Materials
                      </Text>
                      <HStack spacing={1}>
                        <Text fontSize="sm" color="blue.600" fontWeight="bold">
                          {(
                            (emissionsData.breakdown.material_emissions_kg /
                              emissionsData.total_emissions_kg) *
                            100
                          ).toFixed(1)}
                          %
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          ({emissionsData.breakdown.material_emissions_kg} kg
                          CO₂e)
                        </Text>
                      </HStack>
                    </HStack>
                    <Box
                      w={`${
                        (emissionsData.breakdown.material_emissions_kg /
                          emissionsData.total_emissions_kg) *
                        100
                      }%`}
                      h="8px"
                      bg="blue.400"
                      borderRadius="full"
                    />
                  </Box>

                  <Box>
                    <HStack justify="space-between" mb={1}>
                      <Text
                        fontSize="sm"
                        fontWeight="medium"
                        color="orange.700"
                      >
                        Transportation
                      </Text>
                      <HStack spacing={1}>
                        <Text
                          fontSize="sm"
                          color="orange.600"
                          fontWeight="bold"
                        >
                          {(
                            (emissionsData.breakdown.transport_emissions_kg /
                              emissionsData.total_emissions_kg) *
                            100
                          ).toFixed(1)}
                          %
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          ({emissionsData.breakdown.transport_emissions_kg} kg
                          CO₂e)
                        </Text>
                      </HStack>
                    </HStack>
                    <Box
                      w={`${
                        (emissionsData.breakdown.transport_emissions_kg /
                          emissionsData.total_emissions_kg) *
                        100
                      }%`}
                      h="8px"
                      bg="orange.400"
                      borderRadius="full"
                    />
                  </Box>

                  <Box>
                    <HStack justify="space-between" mb={1}>
                      <Text
                        fontSize="sm"
                        fontWeight="medium"
                        color="purple.700"
                      >
                        Usage
                      </Text>
                      <HStack spacing={1}>
                        <Text
                          fontSize="sm"
                          color="purple.600"
                          fontWeight="bold"
                        >
                          {(
                            (emissionsData.breakdown.usage_emissions_kg /
                              emissionsData.total_emissions_kg) *
                            100
                          ).toFixed(1)}
                          %
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          ({emissionsData.breakdown.usage_emissions_kg} kg CO₂e)
                        </Text>
                      </HStack>
                    </HStack>
                    <Box
                      w={`${
                        (emissionsData.breakdown.usage_emissions_kg /
                          emissionsData.total_emissions_kg) *
                        100
                      }%`}
                      h="8px"
                      bg="purple.400"
                      borderRadius="full"
                    />
                  </Box>
                </Grid>
              </VStack>
            </Box>
          </>
        )}
      </Flex>
    </Flex>
  );
}

export default ItemDetailPage;
