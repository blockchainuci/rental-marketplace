const express = require("express");
const router = require("express").Router();
const pool = require("../db");
const middleware = require("../middleware");

router.post("/", middleware.decodeToken, async (req, res) => {
  try {
    const {
      conversation_id,
      text,
      timestamp,
      item_id,
      sender_email,
      receiver_email,
      is_read
    } = req.body;

    // Begin transaction
    const client = await pool.connect();

    try {

      await client.query("BEGIN");

      // First, create the item with basic data
      const newMessage = await client.query(
        `INSERT INTO Messages (
        conversation_id,
        text, timestamp, 
        item_id, sender_email,
        receiver_email, is_read
        ) 
        VALUES($1, $2, $3, $4, $5, $6, $7) 
        RETURNING *`,
        [conversation_id, text, timestamp, 
            item_id, sender_email, 
            receiver_email, is_read
        ]
      );

      await client.query("COMMIT");

      res.json(newMessage.rows[0]);
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server Error");
  }
});


// Get the latest message in each conversation by email
router.get("/conversations/:user_email", async (req, res) => {
    try {
        const { user_email } = req.params;

        const query = `
            SELECT DISTINCT ON (m.item_id) 
                m.*, 
                i.name, i.description, i.rental_fee,
                i.collateral, i.days_limit, i.images
            FROM Messages m
            JOIN Items i ON m.item_id = i.id
            WHERE m.sender_email = $1 OR m.receiver_email = $1
            ORDER BY m.item_id, m.timestamp DESC;
        `;

        const result = await pool.query(query, [user_email]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "No conversations found" });
        }

        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching latest conversations:", err.message);
        res.status(500).json({ error: "Server Error", message: err.message });
    }
});

// Get messages by email and conversation id
router.get("/:user_email/conversation/:conversation_id", async (req, res) => {
    try {
      const { user_email, conversation_id } = req.params;
  
      // Query to join the Renter and Items tables
      const query = `
        SELECT 
          *
        FROM 
          Messages
        WHERE 
          (sender_email = $1 OR receiver_email = $1) AND conversation_id = $2;
      `;
  
      const result = await pool.query(query, [user_email, conversation_id]);
  
      if (result.rows.length === 0) {
        return res
          .status(404)
          .json({ error: "No messages found" });
      }
  
      res.json(result.rows);
    } catch (err) {
      console.error(err.message);
      res.status(500).json("Server Error");
    }
  });


// Check if a user has an unread message
router.get("/has_unread_message/:user_email", async (req, res) => {
    try {
        const { user_email } = req.params;

        const query = `
        SELECT 
          is_read
        FROM 
          Messages
        WHERE 
          receiver_email = $1 AND is_read = false
        LIMIT 1;
        `;

        const result = await pool.query(query, [user_email]);

        // If we found an unread message, return true
        if (result.rows.length > 0) {
            return res.json({ hasUnread: true });
        }

        // Otherwise, return false
        return res.json({ hasUnread: false });

    } catch (err) {
        console.error("Error fetching unread messages:", err.message);
        res.status(500).json({ error: "Server Error", message: err.message });
    }
});

// Update is read boolean
router.get("/update_unread/:conversation_id/:user_email", async (req, res) => {
    try {
        const { conversation_id, user_email } = req.params;

        const query = `
            UPDATE Messages 
            SET is_read = TRUE 
            WHERE conversation_id = $1 AND receiver_email = $2 AND is_read = FALSE
            RETURNING *;
        `;

        const result = await pool.query(query, [conversation_id, user_email]);

        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, error: "No unread messages found" });
        }

        res.json({ success: true, message: "Unread messages marked as read", data: result.rows });

    } catch (err) {
        console.error("Error updating unread messages:", err.message);
        res.status(500).json({ error: "Server Error", message: err.message });
    }
});


// Get all messages
router.get("/", async (req, res) => {
    try {
      const allLenders = await pool.query("SELECT * FROM Messages");
      res.json(allLenders.rows);
    } catch (err) {
      console.error(err.message);
      res.status(500).json("Server Error");
    }
  });


  module.exports = router;