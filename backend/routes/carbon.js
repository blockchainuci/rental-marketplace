const express = require("express");
const router = express.Router();
const pool = require("../db");

// Create carbon data
router.post("/", async (req, res) => {
  try {
    const {
      item_id,
      category,
      material_composition,
      estimated_weight_kg,
      country_of_origin,
      transportation_distance_km,
      transport_mode,
      usage_energy_kwh_per_year,
      lifetime_years,
      disposal_method,
    } = req.body;

    const newCarbon = await pool.query(
      `INSERT INTO Carbon (
        item_id,
        category,
        material_composition,
        estimated_weight_kg,
        country_of_origin,
        transportation_distance_km,
        transport_mode,
        usage_energy_kwh_per_year,
        lifetime_years,
        disposal_method
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
      RETURNING *`,
      [
        item_id,
        category,
        material_composition,
        estimated_weight_kg,
        country_of_origin,
        transportation_distance_km,
        transport_mode,
        usage_energy_kwh_per_year,
        lifetime_years,
        disposal_method,
      ]
    );

    res.json(newCarbon.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server Error");
  }
});

// Get all carbon data
router.get("/", async (req, res) => {
  try {
    const allCarbon = await pool.query(
      `SELECT c.*, i.name as item_name 
       FROM Carbon c 
       JOIN Items i ON c.item_id = i.id 
       ORDER BY c.item_id DESC`
    );
    res.json(allCarbon.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server Error");
  }
});

// Get carbon data by item_id
router.get("/item/:item_id", async (req, res) => {
  try {
    const { item_id } = req.params;
    const carbon = await pool.query(
      `SELECT c.*, i.name as item_name 
       FROM Carbon c 
       JOIN Items i ON c.item_id = i.id 
       WHERE c.item_id = $1`,
      [item_id]
    );

    if (carbon.rows.length === 0) {
      return res.status(404).json("Carbon data not found for this item");
    }

    res.json(carbon.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server Error");
  }
});

// Get carbon data by id
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const carbon = await pool.query(
      `SELECT c.*, i.name as item_name 
       FROM Carbon c 
       JOIN Items i ON c.item_id = i.id 
       WHERE c.id = $1`,
      [id]
    );

    if (carbon.rows.length === 0) {
      return res.status(404).json("Carbon data not found");
    }

    res.json(carbon.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server Error");
  }
});

// Update carbon data
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      category,
      material_composition,
      estimated_weight_kg,
      country_of_origin,
      transportation_distance_km,
      transport_mode,
      usage_energy_kwh_per_year,
      lifetime_years,
      disposal_method,
    } = req.body;

    const updateCarbon = await pool.query(
      `UPDATE Carbon SET 
        category = $1,
        material_composition = $2,
        estimated_weight_kg = $3,
        country_of_origin = $4,
        transportation_distance_km = $5,
        transport_mode = $6,
        usage_energy_kwh_per_year = $7,
        lifetime_years = $8,
        disposal_method = $9
      WHERE id = $10 
      RETURNING *`,
      [
        category,
        material_composition,
        estimated_weight_kg,
        country_of_origin,
        transportation_distance_km,
        transport_mode,
        usage_energy_kWh_per_year,
        lifetime_years,
        disposal_method,
        id,
      ]
    );

    if (updateCarbon.rows.length === 0) {
      return res.status(404).json("Carbon data not found");
    }

    res.json(updateCarbon.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server Error");
  }
});

// Delete carbon data
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleteCarbon = await pool.query(
      "DELETE FROM Carbon WHERE id = $1 RETURNING *",
      [id]
    );

    if (deleteCarbon.rows.length === 0) {
      return res.status(404).json("Carbon data not found");
    }

    res.json("Carbon data deleted successfully");
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server Error");
  }
});

// Emission Calculator
router.get("/emission-calculator/:item_id", async (req, res) => {
  try {
    const { item_id } = req.params;

    // Get carbon data for the item
    const carbonData = await pool.query(
      "SELECT * FROM Carbon WHERE item_id = $1",
      [item_id]
    );

    if (carbonData.rows.length === 0) {
      return res.status(404).json("Carbon data not found for this item");
    }

    const {
      estimated_weight_kg,
      material_composition,
      transportation_distance_km,
      transport_mode,
      usage_energy_kwh_per_year,
      lifetime_years,
    } = carbonData.rows[0];

    const materialEmissionFactors = {
      fabric: 3.0, // kg CO2e per kg
      plastic: 6.0, // kg CO2e per kg
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
      foam: 3.5, // kg CO2e per kg
      pvc: 6.1, // kg CO2e per kg
      nylon: 9.0, // kg CO2e per kg
      polyester: 5.5, // kg CO2e per kg
    };

    const transportEmissionFactors = {
      sea: 0.02, // kg CO2e per km per kg
      air: 0.5, // kg CO2e per km per kg
      road: 0.15, // kg CO2e per km per kg
    };

    const energyEmissionFactor = 0.5; // kg CO2e per kWh

    // Parse material composition from PostgreSQL array format
    const materials = material_composition
      .replace(/[{"}]/g, "")
      .split(",")
      .map((m) => m.trim().toLowerCase());

    // Calculate Material Emissions
    let materialEmissions = 0;
    materials.forEach((material) => {
      const factor = materialEmissionFactors[material];
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
      usage_energy_kwh_per_year * lifetime_years * energyEmissionFactor;

    // Total Emissions
    const totalEmissions =
      materialEmissions + transportEmissions + usageEmissions;

    res.json({
      total_emissions_kg: parseFloat(totalEmissions.toFixed(2)),
      breakdown: {
        material_emissions_kg: parseFloat(materialEmissions.toFixed(2)),
        transport_emissions_kg: parseFloat(transportEmissions.toFixed(2)),
        usage_emissions_kg: parseFloat(usageEmissions.toFixed(2)),
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server Error");
  }
});

module.exports = router;
