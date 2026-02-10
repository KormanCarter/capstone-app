// config/database.js
const { Pool } = require("pg");
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const DB_URL = process.env.DB_URL;
const pool = new Pool({
  connectionString: DB_URL,
  ssl: DB_URL.includes('localhost') ? false : {
    rejectUnauthorized: false
  }
});

module.exports = pool;