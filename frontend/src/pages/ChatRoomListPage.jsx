import { React, useState, useEffect } from 'react';
import { Flex, Button, VStack, Text, Heading } from "@chakra-ui/react";
import { Link } from 'react-router-dom';
import { io } from 'socket.io-client';

const ChatRoomListPage = () => {
  const [chatRooms, setChatRooms] = useState([]);
  const [messages, setMessages] = useState([]);
  const [clientSocket, setClientSocket] = useState(null);

  useEffect(() => {
    const newSocket = io("ws://localhost:3002");
    setClientSocket(newSocket);
    fetch("http://localhost:3001/chatrooms")
      .then((res) => res.json())
      .then((data) => setChatRooms(data))
      .catch((err) => console.error("Error fetching chat rooms:", err));

    return () => {
      newSocket.disconnect();
    }
  }, []);

  const socket = io('ws://localhost:3001');

  socket.on("receiveMessage", text => {
    console.log(text);
    setMessages([...messages, text]);
  })

  const handleSendMessage = () => {
    socket.emit("sendMessage", "blankText");
  }

  return (
    <VStack py={16} align="center">
      <p>
        {/* {chatRooms[0].id} */}

        {messages.map((m) => {
          <p>{m}</p>
        })}
      </p>

      <button onClick={handleSendMessage}>
        hello
      </button>
    </VStack>
  )
}

export default ChatRoomListPage;