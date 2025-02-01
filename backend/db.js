const Pool = require("pg").Pool;

const pool = new Pool({
  user: process.env.DEV_DB_USERNAME,
  password: process.env.DEV_DB_PASSWORD,
  host: process.env.DEV_DB_HOSTNAME,
  port: process.env.DEV_DB_PORT,
  database: process.env.DEV_DB_NAME,
  ssl: {
    rejectUnauthorized: false,
  },
});

module.exports = pool;
