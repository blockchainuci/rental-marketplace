// web socket for chat 
const http = require("http");

const app = require("../server.js");

const express = require("express");
const chatroomRouter = express.Router();

const server = http.createServer(app);

const { Server } = require("socket.io");
const chatRooms = [
  { id: "1", user1: "Alice", user2: "Bob" },
  { id: "2", user1: "Charlie", user2: "Dave" },
  { id: "3", user1: "Eve", user2: "Frank" },
];
chatroomRouter.get("/", async (req, res) => {
  try {
    res.json(chatRooms);
  }
  catch (err) {
    console.log(err.msg);
  }
})


const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("sendMessage", (message) => {
    console.log(message);
    io.emit("receiveMessage", message); // Broadcast to all clients
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = 3002; // 0 lets the OS assign an available port

server.listen(PORT, () => {
  console.log(`Server running on port ${server.address().port}`);
});


// export { chatroomRouter };
module.exports = chatroomRouter;