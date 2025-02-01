require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
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

app.listen(port, () => {
  console.log(`server is running on ${port}`);
});
