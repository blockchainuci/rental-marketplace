require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();

const http = require("http");
const server = http.createServer(app);

const port = 3001;

app.use(cors());
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb", extended: true }));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

app.use("/items", require("./routes/items"));
app.use("/lenders", require("./routes/lenders"));
app.use("/renters", require("./routes/renters"));
app.use("/users", require("./routes/users"));
app.use("/carbon", require("./routes/carbon"));

app.get("/", async (req, res) => {
  try {
    res.json("Hello");
  } catch (error) {
    console.error(error);
  }
});

const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
})

io.on("connection", (socket) => {
  console.log("User conencted:", socket.id);

  socket.on("sendMessage", (message) => {
    io.emit("receiveMessage", message);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id)
  })
})

app.listen(port, () => {
  console.log(`server is running on ${port}`);
});
