// config/database.js
const { Pool } = require("pg");
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const DB_URL = process.env.DB_URL || process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/postgres';
const pool = new Pool({
  connectionString: DB_URL,
  ssl: DB_URL.startsWith('postgres://localhost') || DB_URL.startsWith('postgresql://localhost')
    ? false
    : {
    rejectUnauthorized: false
  }
});

module.exports = pool;