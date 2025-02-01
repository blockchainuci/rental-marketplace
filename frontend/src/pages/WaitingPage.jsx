import {
  VStack,
  Text,
  Icon,
  Button,
  Spinner,
  Box,
  HStack,
} from "@chakra-ui/react";
import { MdHourglassEmpty, MdInventory } from "react-icons/md";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

function WaitingPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({
    lender: {},
    renter: {},
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/items/${id}`);
        setItem(response.data);
        setLoading(false);

        // Start polling for status changes
        const intervalId = setInterval(async () => {
          try {
            // Fetch both lender and renter status
            const [lenderResponse, renterResponse] = await Promise.all([
              axios.get(`http://localhost:3001/lenders/${id}`),
              axios.get(`http://localhost:3001/renters/${id}`),
            ]);

            const newStatus = {
              lender: lenderResponse.data,
              renter: renterResponse.data,
            };

            setStatus(newStatus);
            console.log(newStatus);

            // Check if both parties confirmed pickup
            if (
              newStatus.lender.is_picked_up &&
              newStatus.renter.is_picked_up
            ) {
              clearInterval(intervalId);
              navigate(`/pickup-confirmation/${id}`);
            }
            // Check if both parties confirmed return
            else if (
              newStatus.lender.is_returned &&
              newStatus.renter.is_returned
            ) {
              clearInterval(intervalId);
              navigate(`/pickup-confirmation/${id}`);
            }
          } catch (error) {
            console.error("Error fetching status:", error);
          }
        }, 3000); // Poll every 3 seconds

        // Cleanup interval on component unmount
        return () => clearInterval(intervalId);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id, navigate]);

  if (loading) {
    return (
      <VStack spacing={8} py={32} px={4}>
        <Spinner size="xl" color="blue.500" thickness="4px" />
      </VStack>
    );
  }

  return (
    <VStack spacing={8} py={16} px={4} maxW="600px" mx="auto" align="center">
      <Box
        w="full"
        bg="green.50"
        p={6}
        borderRadius="xl"
        border="1px"
        borderColor="green.200"
      >
        <VStack spacing={3}>
          <Text fontSize="2xl" fontWeight="bold" color="green.700">
            Waiting for
          </Text>
          <Text fontSize="2xl" fontWeight="bold" color="green.700">
            {item?.status === "Rented" ? "Return" : "Pick Up"}
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
          <Icon
            as={MdHourglassEmpty}
            boxSize="100px"
            color="blue.500"
            animation="spin 2s linear infinite"
          />

          <VStack spacing={2} textAlign="center">
            <Text fontSize="2xl" fontWeight="bold" color="gray.700">
              Waiting for Confirmation
            </Text>
            <Text fontSize="lg" color="gray.600">
              Please wait while both parties confirm the{" "}
              {item?.status === "Rented" ? "return" : "pickup"}
            </Text>
          </VStack>

          <VStack spacing={2} pt={4}>
            <Text color="gray.600">
              Lender:{" "}
              {(
                item?.status === "Rented"
                  ? status.lender.is_returned
                  : status.lender.is_picked_up
              )
                ? "✅ Confirmed"
                : "⏳ Waiting"}
            </Text>
            <Text color="gray.600">
              Renter:{" "}
              {(
                item?.status === "Rented"
                  ? status.renter.is_returned
                  : status.renter.is_picked_up
              )
                ? "✅ Confirmed"
                : "⏳ Waiting"}
            </Text>
          </VStack>
        </VStack>
      </Box>
    </VStack>
  );
}

export default WaitingPage;

// Add this CSS to your global styles or component
const styles = `
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
`;
