// migration-add-admin.js
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const pool = require('../config/database');

async function addAdminColumn() {
  try {
    console.log('Adding is_admin column to users table...');
    
    // Check if column already exists
    const columnExists = await pool.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'is_admin'
      );
    `);
    
    if (columnExists.rows[0].exists) {
      console.log('is_admin column already exists');
    } else {
      // Add the column
      await pool.query('ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;');
      console.log('is_admin column added successfully');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
}

addAdminColumn();