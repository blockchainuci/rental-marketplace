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
import { auth } from "../firebase";
import { getBearerToken } from "../contexts/AuthContext";
//import { io } from "socket.io-client";


function ChatPage() {
  const { conversation_id } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [conversation, setConversation] = useState(null);
  const [user, setUser] = useState(null);
  const [receiverEmail, setReceiverEmail] = useState(null);
  const messagesEndRef = useRef(null);
  const [borrowerID, setBorrowerID] = useState(null);
  const [lenderID, setLenderID] = useState(null);
  const [sendButtonDisabled, setSendButtonDisabled] = useState(false);

  const HOT_BUTTON_MESSAGE = "Hi! Is the item still available for rent?"
  // TO DO: implement sockets with backend
  // const socket = io("http://localhost:3001"); // Replace with server URL

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
    if (conversation) {
      if (conversation.lender_email == user.email) {
        setReceiverEmail(conversation.renter_email)
      } else {
        setReceiverEmail(conversation.lender_email)
      }
      setLoading(false);
    }
  }, [conversation]);


  useEffect(() => {
    if (messages.length > 0) {
      // check if user has any unread messages and set them to read
      updateChatMessages();
    }
  }, [messages]);


  useEffect(() => {
    if (user?.email) {
      fetchMessages();
      fetchItemAndConversation();
    }
  }, [user]);


  const fetchMessages = async () => {

    // Case other user is the lender
    try {
      const response = await axios.get(`http://localhost:3001/messages/${user.email}/conversation/${conversation_id}`);
      setMessages(response.data)
    } catch (error) {
      console.error("Error fetching message:", error);
    }
  };

  const fetchItemAndConversation = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/conversations/${conversation_id}`);
      setConversation(response.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching conversation:", error);
    }
  };

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

  const handleSendMessage = async () => {
    if (newMessage.trim() === "") return;

    setSendButtonDisabled(true);
    updateUI();
    await updateDB();
    setSendButtonDisabled(false);
  };

  const handleHotButtonClick = () => {
    setNewMessage(HOT_BUTTON_MESSAGE);
  };

  useEffect(() => {
    // send the hot button message when it's clicked
    if (newMessage === HOT_BUTTON_MESSAGE) {
      handleSendMessage(); 
    }
  }, [newMessage]);

  const updateUI = () => {
    const message = {
      text: newMessage,
      timestamp: new Date().toISOString(),
      item_id: conversation.item_id,
      sender_email: user.email,
      receiver_email: receiverEmail,
      is_read: false
    };

    setMessages([...messages, message]);
    setNewMessage("");
  }

  const updateChatMessages = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/messages/update_unread/${conversation_id}/${user.email}`);
    } catch (error) {
      console.error("Error fetching item:", error);
    }
  }

  const updateDB = async () => {
    try {
      setLoading(true);

      // Validate required fields
      if (!user) {
        alert("Please sign in to send a message");
        return;
      }
      if (
        !newMessage
      ) {
        alert("Please enter some text");
        return;
      }
      const token = await getBearerToken();
      // Create item in database with email
      if (!receiverEmail) {
        alert("Error getting receiver data")
        return;
      }
      const response = await axios.post(`http://localhost:3001/messages`, {
        conversation_id: conversation_id,
        text: newMessage,
        timestamp: new Date().toISOString(),
        item_id: conversation.item_id,
        sender_email: user.email,
        receiver_email: receiverEmail,
        is_read: false
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

    } catch (error) {
      console.error("Error submitting item:", error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <Flex justify="center" align="center" h="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  } else {
    return (
      <Flex direction="column" h="100vh" overflow="hidden">
        {/* Fixed Header */}
        <Box w="full" p={4} borderBottom="1px solid #ccc" position="fixed" top={0} left={0} right={0} bg="white" zIndex={1}>
          <Flex gap={4} w="full" align="center">
            <Image src={conversation.images[0]} alt={conversation.name} boxSize="50px" objectFit="cover" borderRadius="md" />

            <Text fontSize="xl" fontWeight="bold">{user.email === conversation.renter_email ? "Chat with the lender" : "Chat with the renter"}</Text>
          </Flex>
        </Box>
  

        {/* Chat Messages - Fills Remaining Space */}
        <Flex direction="column" flex="1" w="full" overflowY="auto" p={4} mt="80px">
          <VStack w="full" spacing={4} align="stretch">
            {messages.map((msg) => (
              <Flex key={msg.id} justify={msg.sender_email === user.email ? "flex-end" : "flex-start"} w="full">
                <Box p={3} borderRadius="md" bg={msg.sender_email === user.email ? "blue.500" : "gray.200"} color={msg.sender_email === user.email ? "white" : "black"}>
                  <Text fontSize="sm">{msg.text}</Text>
                  <Text fontSize="xs" color={msg.sender_email === user.email ? "gray.300" : "gray.500"}>
                    {new Date(msg.timestamp).toLocaleString('en-US', { 
                    month: 'numeric', 
                    day: 'numeric', 
                    year: 'numeric', 
                    hour: 'numeric', 
                    minute: 'numeric', 
                    hour12: true 
                    })}
                  </Text>
                </Box>
              </Flex>
            ))}
            <div ref={messagesEndRef} />
          </VStack>
  
          <Box 
          w="full" 
          p={4} 
          borderTop="1px solid #ccc" 
          bg="white" 
          mb={16}>
          <HStack w="full">
            <Input placeholder="Type your message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
            <Button 
            variant="outline" color="blue.500" borderColor="blue.500" _hover={{ bg: "blue.50" }}
            onClick={handleSendMessage}
            disabled={sendButtonDisabled}>Send</Button>
          </HStack>
        </Box>
  
        {messages.length == 0 && (

        <Button variant="outline" color="blue.500" borderColor="blue.500" _hover={{ bg: "blue.50" }}
        onClick={handleHotButtonClick}>
          {HOT_BUTTON_MESSAGE}
        </Button>
        )}

        </Flex>
  
  
  
      </Flex>
    );
  }


}

export default ChatPage;
