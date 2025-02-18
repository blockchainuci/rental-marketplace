const router = require("express").Router();
const pool = require("../db");
const middleware = require("../middleware");

router.post("/", middleware.decodeToken, async (req, res) => {
  try {
    const {
      item_id,
      lender_email,
      renter_email,
    } = req.body;

    // Begin transaction
    const client = await pool.connect();

    try {

        await client.query(`
            CREATE TABLE IF NOT EXISTS Conversations (
                conversation_id SERIAL PRIMARY KEY,
                item_id INTEGER NOT NULL REFERENCES Items(id),
                lender_email VARCHAR(128) NOT NULL,
                renter_email VARCHAR(128) NOT NULL,
                created_at TIMESTAMP DEFAULT NOW()
            );
          `);

      await client.query("BEGIN");

      // First, create the item with basic data
      const newConversation = await client.query(
        `INSERT INTO Conversations (item_id, lender_email, renter_email, created_at) 
         VALUES ($1, $2, $3, $4) 
         RETURNING *`,
        [item_id, lender_email, renter_email, new Date().toISOString()]
      );

      await client.query("COMMIT");

      res.json(newConversation.rows[0]);
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

// Get a conversation 
router.get("/:item_id/:lender_email/:renter_email", async (req, res) => {
    try {
      const { 
        item_id,
        lender_email,
        renter_email } = req.params;
  
      // Query to join the Renter and Items tables
      const query = `
        SELECT 
            *
        FROM 
            Conversations
        WHERE 
            item_id = $1 AND lender_email = $2 AND renter_email = $3;
        `;
    
  
      const result = await pool.query(query, [item_id, lender_email, renter_email]);
  
      if (result.rows.length === 0) {
        return res
          .status(404)
          .json({ error: "No messages found" });
      }
  
      res.json(result.rows[0]); // Return only one item (since item_id is unique)
    } catch (err) {
      console.error(err.message);
      res.status(500).json("Server Error");
    }
  });


// Get conversation with item details
router.get("/:conversation_id", async (req, res) => {
    try {
        const { conversation_id } = req.params;
    
        // Query to join Conversations with Items based on conversation_id
        const query = `
          SELECT 
            c.conversation_id, 
            c.item_id, 
            c.lender_email, 
            c.renter_email, 
            c.created_at, 
            i.name, 
            i.description, 
            i.rental_fee, 
            i.collateral, 
            i.days_limit, 
            i.images
          FROM Conversations c
          JOIN Items i ON c.item_id = i.id
          WHERE c.conversation_id = $1;
        `;  
    
      const result = await pool.query(query, [conversation_id]);
  
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "No matching conversation found" });
      }
  
      res.json(result.rows[0]); // Return only one item (since item_id is unique)
    } catch (err) {
      console.error("Error fetching conversation with item:", err.message);
      res.status(500).json({ error: "Server Error", message: err.message });
    }
});


  module.exports = router;