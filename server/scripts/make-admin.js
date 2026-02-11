// make-admin.js
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const pool = require('../config/database');

async function makeAdmin() {
  try {
    console.log('Available users:');
    
    // Show all users
    const users = await pool.query('SELECT id, email, name, is_admin FROM users ORDER BY id');
    
    if (users.rows.length === 0) {
      console.log('No users found. Please register a user first.');
      process.exit(0);
    }
    
    users.rows.forEach(user => {
      console.log(`ID: ${user.id}, Email: ${user.email}, Name: ${user.name}, Admin: ${user.is_admin}`);
    });
    
    // For now, let's make the first user an admin
    if (users.rows.length > 0) {
      const firstUser = users.rows[0];
      await pool.query('UPDATE users SET is_admin = TRUE WHERE id = $1', [firstUser.id]);
      console.log(`\nMade ${firstUser.email} an admin!`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Failed to make admin:', error.message);
    process.exit(1);
  }
}

makeAdmin();