import { useParams, useNavigate } from "react-router-dom";
import {
  Flex,
  Text,
  Image,
  Spinner,
  Box,
  Input,
  Button,
  VStack,
  HStack,
} from "@chakra-ui/react";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
//import { io } from "socket.io-client";


/* Sample Data */
const chatRoom = {
  id: "room123",
  users: ["lender@example.com", "borrower@example.com"],
  messages: [],
};

/* Sample Data */
const sampleMessages = [
  {
    id: 1,
    sender: "lender@example.com",
    content: "Hello! How can I assist you?",
    timestamp: "2025-02-04T10:30:00Z",
  },
  {
    id: 2,
    sender: "borrower@example.com",
    content: "Hi! I have a few questions about the item.",
    timestamp: "2025-02-04T10:31:00Z",
  },
  {
    id: 3,
    sender: "lender@example.com",
    content: "Of course! Feel free to ask.",
    timestamp: "2025-02-04T10:32:00Z",
  },
];

function ChatPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState(sampleMessages);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState(null);
  const userEmail = "borrower@example.com"; // Assume logged-in user
  const messagesEndRef = useRef(null);

  // TO DO: implement sockets with backend
  // const socket = io("http://localhost:3001"); // Replace with server URL

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/items/${id}`);
        setItem(response.data);
      } catch (error) {
        console.error("Error fetching item:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  useEffect(() => {
    // TO DO: implement sockets with backend
    /*
    socket.on("receiveMessage", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });
    return () => {
      socket.off("receiveMessage");
    };
    */
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;

    const message = {
      id: messages.length + 1,
      sender: userEmail,
      content: newMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages([...messages, message]);
    setNewMessage("");
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" h="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <Flex direction="column" h="100vh" overflow="hidden">
      {/* Fixed Header */}
      <Box w="full" p={4} borderBottom="1px solid #ccc" position="fixed" top={0} left={0} right={0} bg="white" zIndex={1}>
        <Flex gap={4} w="full" align="center">
          <Image src={item.images[0]} alt={item.name} boxSize="50px" objectFit="cover" borderRadius="md" />
          <Text fontSize="xl" fontWeight="bold">Chat with Lender</Text>
        </Flex>
      </Box>

      {/* Chat Messages - Fills Remaining Space */}
      <Flex direction="column" flex="1" w="full" overflowY="auto" p={4} mt="80px">
        <VStack w="full" spacing={4} align="stretch">
          {messages.map((msg) => (
            <Flex key={msg.id} justify={msg.sender === userEmail ? "flex-end" : "flex-start"} w="full">
              <Box p={3} borderRadius="md" bg={msg.sender === userEmail ? "blue.500" : "gray.200"} color={msg.sender === userEmail ? "white" : "black"}>
                <Text fontSize="sm">{msg.content}</Text>
                <Text fontSize="xs" color={msg.sender === userEmail ? "gray.300" : "gray.500"}>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
              </Box>
            </Flex>
          ))}
          <div ref={messagesEndRef} />
        </VStack>

        <Box w="full" p={4} borderTop="1px solid #ccc" bg="white" mb={16}>
        <HStack w="full">
          <Input placeholder="Type your message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
          <Button colorScheme="blue" onClick={handleSendMessage}>Send</Button>
        </HStack>
      </Box>

      </Flex>



    </Flex>
  );
}

export default ChatPage;
