// scripts/setup-database.js
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const pool = require('../config/database');
const fs = require('fs').promises;
const path = require('path');

async function setupDatabase() {
  try {
    console.log('Setting up database tables...');
    
    const sqlScript = await fs.readFile(path.join(__dirname, '../database-setup.sql'), 'utf8');
    await pool.query(sqlScript);
    
    console.log('Database setup complete!');
    process.exit(0);
  } catch (error) {
    console.error('Database setup failed:', error);
    process.exit(1);
  }
}

setupDatabase();