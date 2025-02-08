// web socket for chat 
const http = require("http");
const server = http.createServer(app);
app.use(cors());

const { Server } = require("socket.io");


const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("sendMessage", (message) => {
    io.emit("receiveMessage", message); // Broadcast to all clients
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 0; // 0 lets the OS assign an available port

server.listen(PORT, () => {
  console.log(`Server running on port ${server.address().port}`);
});
