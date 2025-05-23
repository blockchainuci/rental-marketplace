const router = require("express").Router();
const pool = require("../db");
const middleware = require("../middleware");
const serverTransaction = require("../functions/server_transaction");

// Create lender record
router.post("/", async (req, res) => {
  try {
    const { item_id, email, public_key } = req.body;
    const newLender = await pool.query(
      "INSERT INTO Lender (item_id, is_picked_up, is_returned, email, public_key) VALUES($1, false, false, $2, $3) RETURNING *",
      [item_id, email, public_key]
    );
    res.json(newLender.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server Error");
  }
});

// Get all lenders
router.get("/", async (req, res) => {
  try {
    const allLenders = await pool.query("SELECT * FROM Lender");
    res.json(allLenders.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server Error");
  }
});

// Get lender and item details by item_id
router.get("/:item_id", async (req, res) => {
  try {
    const { item_id } = req.params;

    // Query to join the Lender and Items tables
    const query = `
      SELECT 
        Lender.*, 
        Items.* 
      FROM 
        Lender 
      INNER JOIN 
        Items 
      ON 
        Lender.item_id = Items.id 
      WHERE 
        Lender.item_id = $1;
    `;

    const result = await pool.query(query, [item_id]);

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "No lender or item found with this item_id" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server Error");
  }
});

// Update lender status
router.put("/:item_id", async (req, res) => {
  try {
    const { item_id } = req.params;
    const { is_picked_up, is_returned } = req.body;
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // Update lender status
      const updateLender = await client.query(
        "UPDATE lender SET is_picked_up = $1, is_returned = $2 WHERE item_id = $3 RETURNING *",
        [is_picked_up, is_returned, item_id]
      );

      // Check if both lender and renter have picked up or returned
      const checkStatus = await client.query(
        `SELECT r.is_picked_up as renter_picked_up, 
                l.is_picked_up as lender_picked_up, 
                r.public_key as renter_public_key,
                l.public_key as lender_public_key,
                r.is_returned as renter_returned, 
                l.is_returned as lender_returned,
                i.rental_fee as rental_fee,
                i.days_rented as days_rented,
                i.collateral as collateral
         FROM renter r, lender l, items i
         WHERE r.item_id = $1 AND l.item_id = $1 AND i.id = $1`,
        [item_id]
      );

      if (
        is_picked_up &&
        checkStatus.rows[0]?.renter_picked_up &&
        checkStatus.rows[0]?.lender_picked_up
      ) {
        // Update item status to "Renting" when both picked up
        if (checkStatus.rows[0]?.lender_public_key) {

          await client.query(
            "UPDATE items SET status = 'Renting' WHERE id = $1",
            [item_id]
          );

          if (!checkStatus.rows[0]?.renter_returned && !checkStatus.rows[0]?.lender_returned) {
            // Send rental fee to lender
            console.log('Send fee to lender')
            const totalFee = checkStatus.rows[0]?.rental_fee * checkStatus.rows[0]?.days_rented;
            serverTransaction(checkStatus.rows[0]?.lender_public_key, totalFee);
          }
          
          // TO DO: send receipt in an email to both people


        } else {
          throw 'Error no lender public key';
        }
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

        // Send collateral back to renter
        serverTransaction(checkStatus.rows[0]?.renter_public_key, checkStatus.rows[0]?.collateral);
        console.log('Sending collateral to renter')
        // TO DO: send receipt in an email to the renter

      }

      await client.query("COMMIT");
      res.json(updateLender.rows[0]);
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

// Delete lender record
router.delete("/:item_id", async (req, res) => {
  try {
    const { item_id } = req.params;
    await pool.query("DELETE FROM lender WHERE item_id = $1", [item_id]);
    res.json("Lender record was deleted!");
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server Error");
  }
});

// Get all items for a lender by email
router.get("/email/:email", async (req, res) => {
  try {
    const { email } = req.params;

    const query = `
      SELECT 
        Items.*,
        Lender.is_picked_up,
        Lender.is_returned,
        Lender.email as lender_email
      FROM 
        Lender 
      INNER JOIN 
        Items 
      ON 
        Lender.item_id = Items.id 
      WHERE 
        Lender.email = $1
      ORDER BY
        Items.id DESC;
    `;

    const result = await pool.query(query, [email]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "No items found for this lender" });
    }

    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server Error");
  }
});

module.exports = router;
