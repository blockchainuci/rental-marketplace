import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Flex, Button, VStack, Box, Text, Input, HStack } from "@chakra-ui/react";
import { auth } from "../firebase"; 

const MessagesPage = () => {
  const navigate = useNavigate();
  const { id } = useParams(); 
  const [selectedChatroom, setSelectedChatroom] = useState(null); 
  const [messages, setMessages] = useState({});
  const [newMessage, setNewMessage] = useState("");
  const [userEmail, setUserEmail] = useState(""); 

  // Mock chatrooms
  const chatrooms = ["chatroom1", "chatroom2", "chatroom3", "chatroom4", "chatroom5", "chatroom6"];

  useEffect(() => {
    // Check if user is logged in, otherwise redirect to sign-in
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user || user.uid !== id) {
        navigate("/signin");
      } else {
        setUserEmail(user.email); 
      }
    });

    return () => unsubscribe();
  }, [id, navigate]);

  // Sample messages for each chatroom
  const initialMessages = {};
  chatrooms.forEach((room) => {
    initialMessages[room] = [
      { sender: "Sender", content: "Which chatroom is this?" }, 
      { sender: "Receiver", content: `Chatroom ${room.replace("chatroom", "")}` },
    ];
  });

  useEffect(() => {
    setMessages(initialMessages);
  }, []);

  // Handle sending a new message
  const handleSendMessage = () => {
    if (!selectedChatroom || newMessage.trim() === "") return;

    setMessages((prevMessages) => ({
      ...prevMessages,
      [selectedChatroom]: [...(prevMessages[selectedChatroom] || []), { sender: userEmail, content: newMessage }],
    }));

    setNewMessage("");
  };

  return (
    <Flex h="100vh" p={4}>
      {/* Chatroom Buttons Section */}
      <Box ml="10px" mt="60px" p={4} bg="gray.200" borderRadius="md" minW="150px">
        <Text fontWeight="bold" mb={3}>Chatrooms</Text>
        <VStack spacing={4} align="flex-start">
          {chatrooms.map((room, index) => (
            <Button 
              key={index} 
              colorScheme={selectedChatroom === room ? "green" : "blue"} 
              size="lg" 
              onClick={() => setSelectedChatroom(room)} 
            >
              {room}
            </Button>
          ))}
        </VStack>
      </Box>

      {/* Vertical Black Divider */}
      <Box ml="10px" mt="60px" h="calc(100vh - 60px)" w="5px" bg="black" borderRadius="full" />

      {/* Chatroom Display Section */}
      <Box flex="1" ml="10px" mt="60px" p={4} bg="gray.50" borderRadius="md">
        {selectedChatroom ? (
          <>
            <Text fontSize="lg" fontWeight="bold">{selectedChatroom}</Text>
            <Box h="70vh" overflowY="auto" p={2} bg="white" borderRadius="md">
              {messages[selectedChatroom]?.map((msg, index) => (
                <Flex 
                  key={index} 
                  justify={msg.sender === "Sender" || msg.sender === userEmail ? "flex-end" : "flex-start"} 
                  mb={2}
                >
                  <Box
                    p={3}
                    maxW="60%"
                    borderRadius="lg"
                    bg={msg.sender === "Sender" || msg.sender === userEmail ? "blue.500" : "gray.800"}
                    color="white"
                    position="relative"
                  >
                    {/* Speech bubble styling */}
                    <Text fontSize="sm">{msg.content}</Text>
                    <Box 
                      position="absolute"
                      bottom="-5px"
                      left={msg.sender === "Sender" || msg.sender === userEmail ? "auto" : "10px"}
                      right={msg.sender === "Sender" || msg.sender === userEmail ? "10px" : "auto"}
                      w="0"
                      h="0"
                      borderStyle="solid"
                      borderWidth="5px"
                      borderColor={msg.sender === "Sender" || msg.sender === userEmail 
                        ? "blue.500 transparent transparent transparent" 
                        : "gray.800 transparent transparent transparent"}
                    />
                  </Box>
                </Flex>
              ))}
            </Box>
            
            {/* Input Box */}
            <HStack mt={4}>
              <Input 
                placeholder="Type a message..." 
                value={newMessage} 
                onChange={(e) => setNewMessage(e.target.value)} 
              />
              <Button colorScheme="blue" onClick={handleSendMessage}>Send</Button>
            </HStack>
          </>
        ) : (
          <Text fontSize="lg" fontWeight="bold">Select a chatroom to start messaging.</Text>
        )}
      </Box>
    </Flex>
  );
};

export default MessagesPage;
