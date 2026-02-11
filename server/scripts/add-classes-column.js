// add-classes-column.js
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const pool = require('../config/database');

async function addClassesColumn() {
  try {
    console.log('Adding classes column to users table...');
    
    // Check if column already exists
    const columnExists = await pool.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'classes'
      );
    `);
    
    if (columnExists.rows[0].exists) {
      console.log('classes column already exists');
    } else {
      // Add the column
      await pool.query('ALTER TABLE users ADD COLUMN classes TEXT[] DEFAULT \'{}\';');
      console.log('classes column added successfully');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
}

addClassesColumn();