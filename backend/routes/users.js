const router = require("express").Router();
const pool = require("../db");
const middleware = require("../middleware");

// Create user
router.post("/", middleware.decodeToken, async (req, res) => {
  try {
    const { email } = req.body;
    const newUser = await pool.query(
      "INSERT INTO Users (email) VALUES($1) RETURNING *",
      [email]
    );
    res.json(newUser.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server Error");
  }
});

// Get all users
router.get("/", async (req, res) => {
  try {
    const allUsers = await pool.query("SELECT * FROM users");
    res.json(allUsers.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server Error");
  }
});

// Get user by id
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    res.json(user.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server Error");
  }
});

// Update user
router.put("/:id", middleware.decodeToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { email, wallet_address } = req.body;
    const updateUser = await pool.query(
      "UPDATE users SET email = $1, wallet_address = $2 WHERE id = $3 RETURNING *",
      [email, wallet_address, id]
    );
    res.json(updateUser.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server Error");
  }
});

// Delete user
router.delete("/:id", middleware.decodeToken, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM users WHERE id = $1", [id]);
    res.json("User was deleted!");
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server Error");
  }
});

module.exports = router;
