const express = require("express");
const router = express.Router();
const pool = require("../db");
const OpenAI = require("openai");

// Initialize OpenAI configuration
const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_API_KEY,
});

// Create item with GPT-generated details using vision
router.post("/", async (req, res) => {
  try {
    const {
      name,
      description,
      rental_fee,
      collateral,
      days_limit,
      images,
      email,
    } = req.body;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Based on this item and its images, generate a JSON object with environmental impact information:
              
              Item Name: ${name}
              Description: ${description}

              Generate realistic values and return only the JSON object with these exact fields:
              {
                "category": "string (e.g., electronics, clothing)",
                "material_composition": ["array of materials"]("fabric", "plastic", "steel", "aluminum", "glass", "paper", "wool", "leather", "concrete", "rubber", "wood", "copper", "ceramic", "cardboard", "foam", "pvc", "nylon", "polyester"),
                "estimated_weight_kg": number,
                "country_of_origin": "string",
                "transportation_distance_km": number,
                "transport_mode": "string (sea, air, or road)",
                "usage_energy_kWh_per_year": number,
                "lifetime_years": number,
                "disposal_method": "string (recycling, landfill)"
              }`,
            },
            ...images.map((imageUrl) => ({
              type: "image_url",
              image_url: {
                url: imageUrl,
              },
            })),
          ],
        },
      ],
      store: true,
    });

    // Parse GPT response
    const gptData = JSON.parse(
      response.choices[0].message.content.replace(/^```json|```$/g, "").trim()
    );

    // Log GPT response
    console.log("GPT Generated Data:", gptData);

    // Begin transaction
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // First, create the item with basic data
      const newItem = await client.query(
        `INSERT INTO Items (
          name, description, rental_fee, collateral, days_limit, days_rented, 
          images, status
        ) 
        VALUES($1, $2, $3, $4, $5, 0, $6, 'Listed') 
        RETURNING *`,
        [name, description, rental_fee, collateral, days_limit, images]
      );

      // Then, create the carbon data entry
      const carbonData = await client.query(
        `INSERT INTO Carbon (
          item_id, category, material_composition, estimated_weight_kg,
          country_of_origin, transportation_distance_km, transport_mode,
          usage_energy_kWh_per_year, lifetime_years, disposal_method
        ) 
        VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
        RETURNING *`,
        [
          newItem.rows[0].id,
          gptData.category,
          gptData.material_composition,
          gptData.estimated_weight_kg,
          gptData.country_of_origin,
          gptData.transportation_distance_km,
          gptData.transport_mode,
          gptData.usage_energy_kWh_per_year,
          gptData.lifetime_years,
          gptData.disposal_method,
        ]
      );

      // Create the lender entry
      await client.query(
        "INSERT INTO Lender (item_id, email, is_picked_up, is_returned) VALUES($1, $2, false, false)",
        [newItem.rows[0].id, email]
      );

      await client.query("COMMIT");

      // Return combined item and carbon data
      res.json({
        ...newItem.rows[0],
        carbon_data: carbonData.rows[0],
      });
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

// Get all items
router.get("/", async (req, res) => {
  try {
    const allItems = await pool.query("SELECT * FROM Items");
    res.json(allItems.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server Error");
  }
});

// Get ledger items (items with status Renting or Returned)
router.get("/ledger", async (req, res) => {
  try {
    const query = `
      SELECT 
        i.*,
        l.email as lender_email,
        r.email as renter_email
      FROM 
        Items i
        LEFT JOIN Lender l ON i.id = l.item_id
        LEFT JOIN Renter r ON i.id = r.item_id
      WHERE 
        i.status IN ('Renting', 'Returned')
      ORDER BY
        i.id DESC;
    `;

    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server Error");
  }
});

// Get item by id
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const item = await pool.query("SELECT * FROM items WHERE id = $1", [id]);
    res.json(item.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server Error");
  }
});

// Update item
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      rental_fee,
      collateral,
      days_limit,
      images,
      status,
      days_rented,
    } = req.body;
    const updateItem = await pool.query(
      "UPDATE items SET name = $1, description = $2, rental_fee = $3, collateral = $4, days_limit = $5, images = $6, status = $7, days_rented = $8 WHERE id = $9 RETURNING *",
      [
        name,
        description,
        rental_fee,
        collateral,
        days_limit,
        images,
        status,
        days_rented,
        id,
      ]
    );
    res.json(updateItem.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server Error");
  }
});

// Delete item
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM items WHERE id = $1", [id]);
    res.json("Item was deleted!");
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server Error");
  }
});

// Emission Calculator
router.post("/emission-calculator", async (req, res) => {
  try {
    const {
      estimated_weight_kg,
      material_composition,
      transportation_distance_km,
      transport_mode,
      usage_energy_kWh_per_year,
      lifetime_years,
    } = req.body;

    const materialEmissionFactors = {
      fabric: 3.0, // kg CO2e per kg (average for textiles like cotton, polyester, etc.)
      plastic: 6, // kg CO2e per kg
      steel: 1.85, // kg CO2e per kg
      aluminum: 8.24, // kg CO2e per kg
      glass: 1.2, // kg CO2e per kg
      paper: 1.7, // kg CO2e per kg
      wool: 3.6, // kg CO2e per kg
      leather: 13.8, // kg CO2e per kg
      concrete: 0.1, // kg CO2e per kg
      rubber: 2.3, // kg CO2e per kg
      wood: 0.9, // kg CO2e per kg
      copper: 3.0, // kg CO2e per kg
      ceramic: 1.0, // kg CO2e per kg
      cardboard: 1.2, // kg CO2e per kg
      foam: 3.5, // kg CO2e per kg (e.g., insulation or packaging foam)
      pvc: 6.1, // kg CO2e per kg (polyvinyl chloride)
      nylon: 9.0, // kg CO2e per kg (synthetic fiber)
      polyester: 5.5, // kg CO2e per kg (common synthetic textile)
    };

    const transportEmissionFactors = {
      sea: 0.02, // kg CO2e per km per kg
      air: 0.5, // kg CO2e per km per kg
      road: 0.15, // kg CO2e per km per kg
    };

    const energyEmissionFactor = 0.5; // kg CO2e per kWh

    // Calculate Material Emissions
    let materialEmissions = 0;
    material_composition.forEach((material) => {
      const factor = materialEmissionFactors[material.toLowerCase()];
      if (factor) {
        materialEmissions += estimated_weight_kg * factor;
      }
    });

    // Calculate Transport Emissions
    const transportFactor =
      transportEmissionFactors[transport_mode.toLowerCase()];
    let transportEmissions = 0;
    if (transportFactor) {
      transportEmissions =
        estimated_weight_kg * transportation_distance_km * transportFactor;
    }

    // Calculate Usage Emissions
    const usageEmissions =
      usage_energy_kWh_per_year * lifetime_years * energyEmissionFactor;

    // Total Emissions
    const totalEmissions =
      materialEmissions + transportEmissions + usageEmissions;

    res.json({
      total_emissions_kg: parseFloat(totalEmissions.toFixed(2)),
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server Error");
  }
});

module.exports = router;
