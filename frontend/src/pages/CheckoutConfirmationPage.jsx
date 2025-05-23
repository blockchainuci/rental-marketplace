import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  MdEmail,
  MdCalendarToday,
  MdArrowBack,
} from "react-icons/md";
import axios from "axios";
import { auth } from "../firebase";

function CheckoutConfirmationPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [lenderEmail, setLenderEmail] = useState("");
  const [showEmail, setShowEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState(null);

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
        const itemResponse = await axios.get(
          `${process.env.REACT_APP_BACKEND_HOSTNAME}/items/${id}`
        );
        setItem(itemResponse.data);

        const lenderResponse = await axios.get(
          `${process.env.REACT_APP_BACKEND_HOSTNAME}/lenders/${id}`
        );
        setLenderEmail(lenderResponse.data.email);

        // Remove the direct email sending from here since it's already handled in CheckoutPage
        setEmailSent(true);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (id && currentUserEmail) {
      fetchData();
    }
  }, [id, currentUserEmail]);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(lenderEmail);
      setShowEmail(true);
      setTimeout(() => setShowEmail(false), 2000);
    } catch (error) {
      console.error("Error copying email:", error);
    }
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
        p={8}
        borderRadius="xl"
        border="1px"
        borderColor="green.200"
        shadow="md"
      >
        <VStack spacing={6}>
          <Circle size="120px" bg="white" shadow="md">
            <Icon as={MdCheckCircle} color="green.500" boxSize="60px" />
          </Circle>

          <VStack spacing={2} textAlign="center">
            <Text fontSize="3xl" fontWeight="bold" color="green.700">
              Rental Confirmed!
            </Text>
            <Text fontSize="lg" color="green.600">
              {item?.name}
            </Text>
          </VStack>

          <Box w="full" h="1px" bg="green.200" my={2} />

          <VStack spacing={4} w="full">
            <Box
              w="full"
              bg="white"
              p={4}
              borderRadius="lg"
              border="1px"
              borderColor="green.100"
            >
              <VStack align="start" spacing={3}>
                <HStack spacing={2}>
                  <Icon as={MdCalendarToday} color="blue.500" boxSize={5} />
                  <Text fontWeight="medium" color="gray.700">
                    Rental Duration:
                  </Text>
                </HStack>
                <Text color="gray.600" pl={7}>
                  {item?.days_rented} days
                </Text>
              </VStack>
            </Box>

            {emailSent && (
              <Box w="full" bg="white" p={4} borderRadius="lg" border="1px" borderColor="green.100">
                <VStack align="start" spacing={3}>
                  <HStack spacing={2}>
                    <Icon as={MdEmail} color="green.500" boxSize={5} />
                    <Text fontWeight="medium" color="gray.700">
                      Email Notification Sent!
                    </Text>
                  </HStack>
                  <Text color="gray.600" pl={7}>
                    The lender has been notified about this rental request.
                  </Text>
                </VStack>
              </Box>
            )}

            <Box
              w="full"
              bg="white"
              p={4}
              borderRadius="lg"
              border="1px"
              borderColor="green.100"
            >
              <VStack align="start" spacing={3}>
                <HStack spacing={2}>
                  <Icon as={MdEmail} color="blue.500" boxSize={5} />
                  <Text fontWeight="medium" color="gray.700">
                    Contact Lender:
                  </Text>
                </HStack>
                <Button
                  variant="outline"
                  colorScheme="blue"
                  size="sm"
                  onClick={handleCopyEmail}
                  w="full"
                  leftIcon={<Icon as={MdEmail} />}
                >
                  {showEmail ? "Email Copied!" : "Copy Lender's Email"}
                </Button>
              </VStack>
            </Box>
          </VStack>
        </VStack>
      </Box>

      <Button
        leftIcon={<Icon as={MdArrowBack} />}
        size="lg"
        w="full"
        bg="blue.500"
        onClick={() => navigate("/")}
        shadow="md"
        _hover={{
          transform: "translateY(-2px)",
          shadow: "lg",
        }}
        transition="all 0.2s"
      >
        Back to Home
      </Button>
    </VStack>
  );
}

export default CheckoutConfirmationPage;
