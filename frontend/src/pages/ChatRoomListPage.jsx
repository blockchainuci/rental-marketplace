import { React, useState, useEffect } from 'react';
import { Flex, Button, VStack, Text, Heading } from "@chakra-ui/react";
import { Link } from 'react-router-dom';

const ChatRoomListPage = () => {
  const [chatRooms, setChatRooms] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3001/chatrooms")
      .then((res) => res.json())
      .then((data) => setChatRooms(data))
      .catch((err) => console.error("Error fetching chat rooms:", err));
  }, []);
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Chat Rooms</h1>
      <ul className="space-y-4">
        {chatRooms.length > 0 ? (
          chatRooms.map((room) => (
            <li
              key={room.id}
              className="p-4 border rounded-lg shadow hover:bg-gray-100"
            >
              <Link to={`/chat/${room.id}`} className="text-blue-600">
                Chat between {room.user1} and {room.user2}
              </Link>
            </li>
          ))
        ) : (
          <p>No active chat rooms</p>
        )}
      </ul>
    </div>
  )
}

export default ChatRoomListPage;