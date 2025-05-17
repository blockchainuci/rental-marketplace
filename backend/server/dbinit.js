const fs = require('fs');
const { Client } = require('pg');

// Load the SQL file
const sql = fs.readFileSync('.database.sql', 'utf8');

DATABASE_URL = "postgresql://postgres:jmoNRphIYGSFfMKlrPYitYxXaQcUFGOR@hopper.proxy.rlwy.net:23935/railway" // Should add to .env

// Connect to the PostgreSQL database
const client = new Client({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Needed for Railway
  },
});

(async () => {
  try {
    await client.connect();
    console.log('Connected to PostgreSQL');
    await client.query(sql);
    console.log('SQL schema applied successfully');
  } catch (err) {
    console.error('Error applying SQL schema:', err);
  } finally {
    await client.end();
  }
})();
