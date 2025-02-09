import { React, useState, useEffect } from 'react';
import { Flex, Button, VStack, Text, Heading } from "@chakra-ui/react";
import { Link } from 'react-router-dom';
import { io } from 'socket.io-client';

const ChatRoomListPage = () => {
  const [chatRooms, setChatRooms] = useState([]);
  const [messages, setMessages] = useState([]);
  const [clientSocket, setClientSocket] = useState(null);
  const [newMessageText, setNewMessageText] = useState("");

  useEffect(() => {
    const newSocket = io("ws://localhost:3002");
    setClientSocket(newSocket);
    fetch("http://localhost:3001/chatrooms")
      .then((res) => res.json())
      .then((data) => setChatRooms(data))
      .catch((err) => console.error("Error fetching chat rooms:", err));

    newSocket.on("receiveMessage", text => {
      console.log("Received a message");
      console.log(text);
      setMessages(prevMessages => [...prevMessages, text]);
    })
    return () => {
      newSocket.off("receiveMessage");
      newSocket.disconnect();
    }
  }, []);

  const updateNewMessage = (e) => {
    setNewMessageText(e.target.value);
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    clientSocket.emit("sendMessage", newMessageText);
  }

  return (
    <VStack py={48} align="center">
      <ul>
        {messages.map((m, index) => (
          <li key={index}>{m}</li>
        ))}
      </ul>

      <form onSubmit={handleSubmit}>
        <VStack>
          <input type="text" onChange={updateNewMessage}></input>
          <button type="submit">Send</button>
        </VStack>
      </form>
    </VStack>
  )
}

export default ChatRoomListPage;