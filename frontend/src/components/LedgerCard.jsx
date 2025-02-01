import {
  Flex,
  Image,
  Box,
  Badge,
  Text,
  HStack,
  Icon,
  VStack,
} from "@chakra-ui/react";
import { MdPerson, MdStore, MdCalendarToday } from "react-icons/md";
import { useNavigate } from "react-router-dom";

function LedgerCard({ item }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/items/${item.id}`);
  };

  return (
    <Flex
      w="full"
      borderWidth={1}
      borderRadius="lg"
      overflow="hidden"
      p={4}
      gap={4}
      direction="column"
      bg="white"
      shadow="sm"
      _hover={{
        shadow: "md",
        cursor: "pointer",
        transform: "translateY(-2px)",
      }}
      transition="all 0.2s"
      onClick={handleClick}
    >
      <Flex gap={4}>
        <Image
          src={item.images?.[0] || "placeholder-image-url"}
          alt={item.name}
          boxSize="100px"
          objectFit="cover"
          borderRadius="md"
          fallbackSrc="https://via.placeholder.com/100"
        />
        <Box flex={1}>
          <HStack justify="space-between" align="start">
            <Text fontSize="xl" fontWeight="semibold">
              {item.name}
            </Text>
            <Badge
              colorScheme={
                item.status === "Returned"
                  ? "green"
                  : item.status === "Rented"
                  ? "yellow"
                  : "gray"
              }
            >
              {item.status}
            </Badge>
          </HStack>

          <HStack spacing={4} mt={2}>
            <Text fontSize="sm" color="gray.500">
              <b>Rental: </b>
              <br />${item.rental_fee}/day
            </Text>
            <Text fontSize="sm" color="gray.500">
              <b>Duration: </b>
              <br />
              {item.days_rented} days
            </Text>
          </HStack>
        </Box>
      </Flex>

      <Box h="1px" bg="gray.200" my={2} w="full" />

      <VStack align="start" spacing={2}>
        <Flex align="center" gap={2}>
          <Icon as={MdStore} color="gray.600" />
          <Text fontWeight="medium">Lender:</Text>
          <Text color="gray.600">{item.lender_email || "N/A"}</Text>
        </Flex>
        <Flex align="center" gap={2}>
          <Icon as={MdPerson} color="gray.600" />
          <Text fontWeight="medium">Renter:</Text>
          <Text color="gray.600">{item.renter_email || "N/A"}</Text>
        </Flex>
      </VStack>
    </Flex>
  );
}

export default LedgerCard;
