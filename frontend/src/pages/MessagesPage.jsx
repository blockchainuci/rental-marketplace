import {
    VStack,
    Text,
    Image,
    Box,
    Spinner,
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
    FaComment,
    FaPaperPlane, 
    FaInbox,
  } from "react-icons/fa";
  
  function MessagesPage() {

    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [numUnreadMessages, setNumUnreadMessages] = useState(0);
    // TO DO: Get chat data
    const [latestMessages, setLatestMessages] = useState([]);


    useEffect(() => {
        if (user?.email) {
            fetchConversations();
        }
      }, [user]);
      
      useEffect(() => {
        if (latestMessages) {
            setLoading(false);
            calculateUnreadMessages();
        } 
      }, [latestMessages]);

    const fetchConversations = async () => {
      
      try {
        const response = await axios.get(`http://localhost:3001/messages/conversations/${user.email}`);
        const sortedMessages = response.data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        setLatestMessages(sortedMessages);
      } catch (error) {
        console.error("Error fetching item:", error);
      }
    };

    const calculateUnreadMessages = () => {
        try {
            let unreadMessages = 0;
            for (const latestMessage of latestMessages) {
                console.log(latestMessage)
                if (!latestMessage.is_read && latestMessage.receiver_email == user.email) {
                    unreadMessages++;
                }
            }
            setNumUnreadMessages(unreadMessages);
        } catch (error) {
          console.error("Error calculating unread messaging data:", error);
        }
      };

    useEffect(() => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        if (user) {
          setUser(user);
        } else {
          navigate("/signin");
        }
      });
  
      return () => unsubscribe();
    }, [navigate]);


    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
          if (user) {
            setUser(user);
          } else {
            navigate("/signin");
          }
        });
    
        return () => unsubscribe();
      }, [navigate]);

    const ImpactStat = ({ icon, label, value, unit }) => (
        <Box
          p={4}
          borderRadius="lg"
          bg="white"
          shadow="sm"
          border="1px"
          borderColor="blue.100"
        >
          <VStack spacing={1} align="center">
            <Icon as={icon} boxSize={5} color="blue.500" mb={1} />
            <Text fontSize="xs" color="blue.600" fontWeight="medium">
              {label}
            </Text>
            <HStack spacing={1} align="baseline">
              <Text fontSize="xl" fontWeight="bold" color="blue.700">
                {value}
              </Text>
              {unit && (
                <Text fontSize="xs" color="blue.600">
                  {unit}
                </Text>
              )}
            </HStack>
          </VStack>
        </Box>
      );

      const handleConversationClick = (conversationId) => {
        navigate(`/chat/${conversationId}`); // Example: Navigate to chat page
      };

    if (loading) {
      return (
        <Flex justify="center" align="center" h="100vh">
          <Spinner size="xl" />
        </Flex>
      );
    }

    return (
      <VStack spacing={8} py={16} px={4} maxW="600px" mx="auto" mb={16}>
        <Box
          w="full"
          bg="blue.50"
          p={4}
          borderRadius="xl"
          border="1px"
          borderColor="blue.200"
        >
        <VStack spacing={4}>
          <HStack spacing={2}>
            <Icon as={FaComment} boxSize={5} color="blue.500" />
            <Text fontSize="lg" fontWeight="bold" color="blue.700">
              Your Conversations
            </Text>
          </HStack>

          <VStack spacing={3} w="full">
            <Grid templateColumns="repeat(2, 1fr)" gap={3} w="full">
              <ImpactStat
                icon={FaInbox}
                label="Unread Messages"
                value={numUnreadMessages}
              />

              <ImpactStat
                icon={FaPaperPlane}
                label="Conversations"
                value={latestMessages.length}
              />
            </Grid>
          </VStack>
        </VStack>
        </Box>
      {latestMessages.length === 0 ? (
        <Text color="gray.500">No conversations yet</Text>
      ) : (
        latestMessages.map((latestMessage) => (
<Flex
  key={latestMessage.conversation_id}
  w="full"
  borderWidth={1}
  borderRadius="lg"
  overflow="hidden"
  p={4}
  gap={4}
  position="relative"
  onClick={() => handleConversationClick(latestMessage.conversation_id)}
>
  <Image
    src={latestMessage.images[0]}
    alt={latestMessage.name}
    boxSize="100px"
    objectFit="cover"
    borderRadius="md"
  />

  <Box flex={1} position="relative">
    {/* Timestamp & Blue Dot */}
    <Flex justify="flex-end" align="center" position="absolute" top={0} right={0}>
      <Text fontSize="sm" color="gray.500">
        {new Date(latestMessage.timestamp).toLocaleString('en-US', { 
          month: 'numeric', 
          day: 'numeric', 
          year: 'numeric', 
          hour: 'numeric', 
          minute: 'numeric', 
          hour12: true 
        })}
      </Text>

      {/* Blue Dot (only if unread) */}
      {(!latestMessage.is_read && latestMessage.receiver_email == user.email) ? (
        <Box
          w="8px"
          h="8px"
          bg="blue.500"
          borderRadius="full"
          ml={2} // Space between timestamp and dot
        />
      ) : (
        <Box
          w="8px"
          h="8px"
          bg="transparent"
          borderRadius="full"
          ml={2}
        />
      )}
    </Flex>

    {/* Message Content */}
    <Text fontSize="xl" fontWeight="semibold" mt={4}>
      {latestMessage.name}
    </Text>
    <Text fontSize="md" color="gray.900" mt={2}>
        {latestMessage.text.length > 37 
        ? `${latestMessage.text.substring(0, 37)}...` 
        : latestMessage.text}
    </Text>
  </Box>
</Flex>

        ))
      )}
      </VStack>
    );
  }
  
  export default MessagesPage;
  




