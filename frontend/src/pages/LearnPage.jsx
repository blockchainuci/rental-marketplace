import {
  VStack,
  Text,
  Box,
  Icon,
  HStack,
  Grid,
  GridItem,
  Link,
} from "@chakra-ui/react";
import {
  FaLeaf,
  FaTree,
  FaBox,
  FaTruck,
  FaLightbulb,
  FaRecycle,
  FaCalculator,
  FaExternalLinkAlt,
} from "react-icons/fa";

function LearnPage() {
  const Section = ({ icon, title, description, emoji, sourceLink }) => (
    <Box
      w="full"
      bg="white"
      p={6}
      borderRadius="xl"
      border="1px"
      borderColor="green.200"
      shadow="sm"
    >
      <VStack align="start" spacing={3}>
        <HStack spacing={3} width="full" justify="space-between">
          <HStack spacing={3}>
            <Icon as={icon} boxSize={6} color="green.500" />
            <Text fontSize="xl" fontWeight="bold" color="green.700">
              {title} {emoji}
            </Text>
          </HStack>
          {sourceLink && (
            <Link href={sourceLink} isExternal color="blue.500">
              <Icon as={FaExternalLinkAlt} boxSize={4} />
            </Link>
          )}
        </HStack>
        <Text color="gray.600" fontSize="md">
          {description}
        </Text>
      </VStack>
    </Box>
  );

  const TableHeader = ({ children }) => (
    <Box bg="green.50" p={3} fontWeight="bold" color="gray.700">
      {children}
    </Box>
  );

  const TableCell = ({ children, isNumeric }) => (
    <Box p={3} textAlign={isNumeric ? "right" : "left"} color="gray.600">
      {children}
    </Box>
  );

  return (
    <VStack spacing={8} py={16} px={1} maxW="800px" mx="auto" mb={16}>
      <Box
        w="full"
        bg="green.50"
        p={6}
        borderRadius="xl"
        border="1px"
        borderColor="green.200"
      >
        <VStack spacing={3} align="center">
          <Text fontSize="3xl" fontWeight="bold" color="green.700">
            Carbon Calculator: How It Works 🔬
          </Text>
          <Text fontSize="md" color="green.600">
            A detailed look at our emission calculations
          </Text>
        </VStack>
      </Box>

      <Section
        icon={FaCalculator}
        title="The Formula"
        emoji="📊"
        description="Total Emissions = Material Emissions + Transport Emissions + Usage Emissions"
        sourceLink="https://css.umich.edu/publications/factsheets/sustainability-indicators/carbon-footprint-factsheet"
      />

      <Section
        icon={FaBox}
        title="Material Emissions"
        emoji="🏭"
        description="Material Emissions = Item Weight (kg) × Material Emission Factor"
      />

      <Box
        w="full"
        p={6}
        bg="white"
        borderRadius="xl"
        border="1px"
        borderColor="green.200"
      >
        <Text fontSize="lg" fontWeight="bold" color="green.700" mb={4}>
          Material Emission Factors (kg CO₂e per kg) 📋
        </Text>
        <Grid templateColumns="1fr 100px 1fr" gap={1} bg="gray.100">
          <TableHeader>Material</TableHeader>
          <TableHeader>CO₂e/kg</TableHeader>
          <TableHeader>Common Uses</TableHeader>

          <TableCell>Leather</TableCell>
          <TableCell isNumeric>13.8</TableCell>
          <TableCell>Bags, furniture</TableCell>

          <TableCell>Nylon</TableCell>
          <TableCell isNumeric>9.0</TableCell>
          <TableCell>Sports equipment</TableCell>

          <TableCell>Aluminum</TableCell>
          <TableCell isNumeric>8.24</TableCell>
          <TableCell>Electronics, tools</TableCell>

          <TableCell>PVC</TableCell>
          <TableCell isNumeric>6.1</TableCell>
          <TableCell>Pipes, flooring</TableCell>

          <TableCell>Plastic</TableCell>
          <TableCell isNumeric>6.0</TableCell>
          <TableCell>Containers, toys</TableCell>

          <TableCell>Polyester</TableCell>
          <TableCell isNumeric>5.5</TableCell>
          <TableCell>Clothing, furniture</TableCell>

          <TableCell>Wool</TableCell>
          <TableCell isNumeric>3.6</TableCell>
          <TableCell>Clothing</TableCell>

          <TableCell>Foam</TableCell>
          <TableCell isNumeric>3.5</TableCell>
          <TableCell>Furniture, packaging</TableCell>
        </Grid>
      </Box>

      <Section
        icon={FaTruck}
        title="Transport Emissions"
        emoji="🚛"
        description="Transport Emissions = Item Weight (kg) × Distance (km) × Transport Mode Factor"
      />

      <Box
        w="full"
        p={6}
        bg="white"
        borderRadius="xl"
        border="1px"
        borderColor="green.200"
      >
        <Text fontSize="lg" fontWeight="bold" color="green.700" mb={4}>
          Transport Emission Factors (kg CO₂e per km per kg) 🚢
        </Text>
        <Grid templateColumns="1fr 100px 1fr" gap={1} bg="gray.100">
          <TableHeader>Mode</TableHeader>
          <TableHeader>CO₂e/km/kg</TableHeader>
          <TableHeader>Usage</TableHeader>

          <TableCell>Air</TableCell>
          <TableCell isNumeric>0.50</TableCell>
          <TableCell>International shipping</TableCell>

          <TableCell>Road</TableCell>
          <TableCell isNumeric>0.15</TableCell>
          <TableCell>Local delivery</TableCell>

          <TableCell>Sea</TableCell>
          <TableCell isNumeric>0.02</TableCell>
          <TableCell>Ocean freight</TableCell>
        </Grid>
      </Box>

      <Section
        icon={FaLightbulb}
        title="Usage Emissions"
        emoji="⚡"
        description="Usage Emissions = Energy Use (kWh/year) × Lifetime (years) × Energy Factor (0.5 kg CO₂e/kWh)"
      />

      <Section
        icon={FaTree}
        title="Trees Equivalent"
        emoji="🌳"
        description="Trees Equivalent = Total Emissions ÷ 21 (One tree absorbs approximately 21 kg of CO₂ per year)"
      />

      <Box
        w="full"
        bg="green.50"
        p={6}
        borderRadius="xl"
        border="1px"
        borderColor="green.200"
      >
        <VStack spacing={3} align="center">
          <Text fontSize="xl" fontWeight="bold" color="green.700">
            Example Calculation 🧮
          </Text>
          <Text color="green.600" textAlign="center">
            For a 2kg leather bag transported 1000km by road, used for 3 years
            with 5 kWh/year:
            {"\n\n"}
            Material: 2 kg × 13.8 = 27.6 kg CO₂e
            {"\n"}
            Transport: 2 kg × 1000 km × 0.15 = 300 kg CO₂e
            {"\n"}
            Usage: 5 kWh × 3 years × 0.5 = 7.5 kg CO₂e
            {"\n"}
            Total: 335.1 kg CO₂e
            {"\n"}
            Trees: 335.1 ÷ 21 = 16 trees for one year
          </Text>
        </VStack>
      </Box>
    </VStack>
  );
}

export default LearnPage;
