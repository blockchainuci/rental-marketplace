const router = require("express").Router();
const pool = require("../db");
const middleware = require("../middleware");

// Create renter record
router.post("/", middleware.decodeToken, async (req, res) => {
  try {
    const { item_id, email } = req.body;

    // Check if record already exists
    const existingRenter = await pool.query(
      "SELECT * FROM Renter WHERE item_id = $1 AND email = $2",
      [item_id, email]
    );

    if (existingRenter.rows.length > 0) {
      // Return existing record instead of creating duplicate
      return res.json(existingRenter.rows[0]);
    }

    // If no existing record, create new one
    const newRenter = await pool.query(
      "INSERT INTO Renter (item_id, is_picked_up, is_returned, email) VALUES($1, false, false, $2) RETURNING *",
      [item_id, email]
    );
    res.json(newRenter.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server Error");
  }
});

// Get all renters
router.get("/", async (req, res) => {
  try {
    const allRenters = await pool.query("SELECT * FROM renter");
    res.json(allRenters.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server Error");
  }
});

// Get renter and item details by item_id
router.get("/:item_id", async (req, res) => {
  try {
    const { item_id } = req.params;

    // Query to join the Renter and Items tables
    const query = `
      SELECT 
        Renter.*, 
        Items.* 
      FROM 
        Renter 
      INNER JOIN 
        Items 
      ON 
        Renter.item_id = Items.id 
      WHERE 
        Renter.item_id = $1;
    `;

    const result = await pool.query(query, [item_id]);

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "No renter or item found with this item_id" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server Error");
  }
});

// Update renter status
router.put("/:item_id", middleware.decodeToken, async (req, res) => {
  try {
    const { item_id } = req.params;
    const { is_picked_up, is_returned } = req.body;
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // Update renter status
      const updateRenter = await client.query(
        "UPDATE renter SET is_picked_up = $1, is_returned = $2 WHERE item_id = $3 RETURNING *",
        [is_picked_up, is_returned, item_id]
      );

      // Check if both lender and renter have picked up or returned
      const checkStatus = await client.query(
        `SELECT r.is_picked_up as renter_picked_up, l.is_picked_up as lender_picked_up,
                r.is_returned as renter_returned, l.is_returned as lender_returned
         FROM renter r, lender l 
         WHERE r.item_id = $1 AND l.item_id = $1`,
        [item_id]
      );

      if (
        is_picked_up &&
        checkStatus.rows[0]?.renter_picked_up &&
        checkStatus.rows[0]?.lender_picked_up
      ) {
        // Update item status to "Renting" when both picked up
        await client.query(
          "UPDATE items SET status = 'Renting' WHERE id = $1",
          [item_id]
        );
      }
      if (
        is_returned &&
        checkStatus.rows[0]?.renter_returned &&
        checkStatus.rows[0]?.lender_returned
      ) {
        // Update item status to "Returned" when both returned
        await client.query(
          "UPDATE items SET status = 'Returned' WHERE id = $1",
          [item_id]
        );
      }

      await client.query("COMMIT");
      res.json(updateRenter.rows[0]);
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

// Delete renter record
router.delete("/:item_id", middleware.decodeToken, async (req, res) => {
  try {
    const { item_id } = req.params;
    await pool.query("DELETE FROM renter WHERE item_id = $1", [item_id]);
    res.json("Renter record was deleted!");
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server Error");
  }
});

// Get all items for a renter by email
router.get("/email/:email", async (req, res) => {
  try {
    const { email } = req.params;

    const query = `
      SELECT 
        Items.*,
        Renter.is_picked_up,
        Renter.is_returned,
        Renter.email as renter_email
      FROM 
        Renter 
      INNER JOIN 
        Items 
      ON 
        Renter.item_id = Items.id 
      WHERE 
        Renter.email = $1
      ORDER BY
        Items.id DESC;
    `;

    const result = await pool.query(query, [email]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "No items found for this renter" });
    }

    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server Error");
  }
});

module.exports = router;
