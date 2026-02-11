// server/server.js

const path = require("path");
const express = require("express");
const cors = require("cors");
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const bcrypt = require('bcryptjs');
const pool = require('./config/database');
const passport = require('./config/passport');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

console.log("Server starting...")
const PORT = process.env.PORT || 3001;

const app = express();



app.use(express.static(path.resolve(__dirname, "../client/dist")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  store: new pgSession({
    pool: pool,
    tableName: 'session'
  }),
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-this-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Middleware to check authentication
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Not authenticated' });
};

// Middleware to check admin authentication
const isAdmin = (req, res, next) => {
  console.log('Admin check - User:', req.user);
  console.log('Admin check - Authenticated:', req.isAuthenticated());
  console.log('Admin check - Is Admin:', req.user?.is_admin);
  
  if (req.isAuthenticated() && req.user.is_admin) {
    return next();
  }
  res.status(403).json({ 
    message: 'Admin access required',
    authenticated: req.isAuthenticated(),
    isAdmin: req.user?.is_admin,
    user: req.user?.email
  });
};

// Auth Routes
// Local registration
app.post('/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Check if user already exists
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists with that email' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const newUser = await pool.query(
      'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id, email, name',
      [email, hashedPassword, name]
    );

    // Log in the user
    req.login(newUser.rows[0], (err) => {
      if (err) {
        console.error('Login error:', err);
        return res.status(500).json({ message: 'Error logging in after registration' });
      }
      res.json({ 
        message: 'Registration successful', 
        user: { 
          id: newUser.rows[0].id, 
          email: newUser.rows[0].email, 
          name: newUser.rows[0].name,
          is_admin: newUser.rows[0].is_admin || false
        } 
      });
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Local login
app.post('/auth/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.error('Login error:', err);
      return res.status(500).json({ message: 'Server error during login' });
    }
    if (!user) {
      return res.status(400).json({ message: info.message || 'Invalid credentials' });
    }
    
    req.login(user, (err) => {
      if (err) {
        console.error('Session login error:', err);
        return res.status(500).json({ message: 'Error creating session' });
      }
      res.json({ 
        message: 'Login successful', 
        user: { 
          id: user.id, 
          email: user.email, 
          name: user.name,
          is_admin: user.is_admin || false
        } 
      });
    });
  })(req, res, next);
});

// Google OAuth Routes (only if Google credentials are configured)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );

  app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: 'http://localhost:5174/login?error=auth_failed' }),
    (req, res) => {
      // Successful authentication, redirect back to client
      res.redirect('http://localhost:5174/home');
    }
  );
} else {
  // If Google OAuth is not configured, return an error
  app.get('/auth/google', (req, res) => {
    res.status(500).json({ message: 'Google OAuth not configured' });
  });

  app.get('/auth/google/callback', (req, res) => {
    res.status(500).json({ message: 'Google OAuth not configured' });
  });
}

// Logout
app.post('/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: 'Error logging out' });
    }
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Error destroying session' });
      }
      res.clearCookie('connect.sid');
      res.json({ message: 'Logged out successfully' });
    });
  });
});

// Get current user
app.get('/auth/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ 
      user: { 
        id: req.user.id, 
        email: req.user.email, 
        name: req.user.name,
        is_admin: req.user.is_admin || false
      } 
    });
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
});

// Test database connection
app.get("/api/test", async (req, res) => {
  try {
    // First check if we can connect to the database
    const connectionTest = await pool.query('SELECT NOW()');
    console.log('Database connection successful');
    
    // Check if table exists and get column info
    const tableInfo = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'class2' 
      ORDER BY ordinal_position
    `);
    
    if (tableInfo.rowCount === 0) {
      return res.json({
        success: false,
        error: "Table 'class2' does not exist",
        hint: "Check if the table name is correct or if the table has been created"
      });
    }
    
    // Get sample data
    const result = await pool.query('SELECT * FROM class2 LIMIT 5');
    
    res.json({ 
      success: true, 
      connection: 'OK',
      tableExists: true,
      columns: tableInfo.rows,
      rowCount: result.rowCount, 
      sampleData: result.rows
    });
  } catch (error) {
    console.error('Database test error:', error);
    res.json({ 
      success: false, 
      error: error.message,
      code: error.code,
      hint: "Check database connection and table structure"
    });
  }
});

// View users in database (for debugging)
app.get("/api/debug/users", async (req, res) => {
  try {
    const users = await pool.query('SELECT id, email, name, google_id, created_at FROM users');
    const sessions = await pool.query('SELECT sid, expire FROM session LIMIT 5');
    
    res.json({ 
      users: users.rows,
      userCount: users.rowCount,
      activeSessions: sessions.rows,
      sessionCount: sessions.rowCount
    });
  } catch (error) {
    console.error('Debug query error:', error);
    res.json({ error: error.message });
  }
});

// Handle GET requests to /api route
app.get("/api", (req, res) => {
  res.json({ message: "Hello from server!" });
});

// Get all classes (protected route)
app.get("/api/classes", isAuthenticated, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM class2 ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching all classes:', error);
    res.status(500).json({ error: 'Failed to fetch classes' });
  }
});

// Search endpoint for class2 table (protected route)
app.get("/api/search-classes", isAuthenticated, async (req, res) => {
  try {
    const { query } = req.query;
    console.log('Search request received, query:', query);
    
    let result;
    if (!query) {
      // If no query, return all classes
      console.log('Fetching all classes...');
      result = await pool.query('SELECT * FROM class2 ORDER BY course_id');
    } else {
      // Search for courses that match the query in course_id, course_title, or course_description
      console.log('Searching for courses matching:', query);
      result = await pool.query(
        `SELECT * FROM class2 
         WHERE LOWER(course_id) LIKE LOWER($1) 
         OR LOWER(course_title) LIKE LOWER($1) 
         OR LOWER(course_description) LIKE LOWER($1)
         ORDER BY course_id`,
        [`%${query}%`]
      );
    }
    
    console.log(`Found ${result.rowCount} courses`);
    res.json(result.rows);
  } catch (error) {
    console.error('Error searching classes:', error);
    console.error('Error code:', error.code);
    console.error('Error detail:', error.detail);
    res.status(500).json({ 
      error: 'Failed to search classes', 
      message: error.message,
      code: error.code
    });
  }
});

// Admin Routes
// Get all users (admin only)
app.get("/api/admin/users", isAdmin, async (req, res) => {
  try {
    console.log('Fetching users from database...');
    
    // First check what columns exist in the users table
    const tableInfo = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);
    console.log('Available columns in users table:', tableInfo.rows.map(r => r.column_name));
    
    // Only select columns that actually exist
    const availableColumns = tableInfo.rows.map(r => r.column_name);
    const columnsToSelect = ['id', 'email', 'name', 'google_id', 'created_at', 'updated_at', 'is_admin']
      .filter(col => availableColumns.includes(col));
    
    // Add classes column if it exists
    if (availableColumns.includes('classes')) {
      columnsToSelect.push('classes');
    }
    
    console.log('Selecting columns:', columnsToSelect);
    
    const result = await pool.query(`SELECT ${columnsToSelect.join(', ')} FROM users ORDER BY id`);
    console.log('Users query successful, found', result.rowCount, 'users');
    
    // Add default empty classes array if column doesn't exist
    const usersWithClasses = result.rows.map(user => ({
      ...user,
      classes: user.classes || []
    }));
    
    res.json(usersWithClasses);
  } catch (error) {
    console.error('Error fetching users:', error);
    console.error('Error details:', error.message);
    console.error('Error code:', error.code);
    res.status(500).json({ 
      error: 'Failed to fetch users',
      message: error.message,
      code: error.code
    });
  }
});

// Update user (admin only)
app.put("/api/admin/users/:id", isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, classes, is_admin } = req.body;
    
    console.log('Updating user:', { id, name, email, classes, is_admin });
    
    // Ensure classes is an array
    const classesArray = Array.isArray(classes) ? classes : (classes ? [classes] : []);
    
    const result = await pool.query(
      'UPDATE users SET name = $1, email = $2, classes = $3, is_admin = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING id, email, name, classes, is_admin',
      [name, email, classesArray, is_admin || false, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log('User updated successfully:', result.rows[0]);
    res.json({ message: 'User updated successfully', user: result.rows[0] });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user', message: error.message });
  }
});

// Delete user (admin only)
app.delete("/api/admin/users/:id", isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Prevent admin from deleting themselves
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }
    
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING email', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Get all classes (admin only)
app.get("/api/admin/classes", isAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM class2 ORDER BY course_id');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching classes:', error);
    res.status(500).json({ error: 'Failed to fetch classes' });
  }
});

// Update class (admin only)
app.put("/api/admin/classes/:id", isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { course_title, course_description, classroom_number, capacity, credit_hours, tuition_cost } = req.body;
    
    const result = await pool.query(
      'UPDATE class2 SET course_title = $1, course_description = $2, classroom_number = $3, capacity = $4, credit_hours = $5, tuition_cost = $6 WHERE id = $7 RETURNING *',
      [course_title, course_description, classroom_number, capacity, credit_hours, tuition_cost, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Class not found' });
    }
    
    res.json({ message: 'Class updated successfully', class: result.rows[0] });
  } catch (error) {
    console.error('Error updating class:', error);
    res.status(500).json({ error: 'Failed to update class' });
  }
});

// Add new class (admin only)
app.post("/api/admin/classes", isAdmin, async (req, res) => {
  try {
    const { course_id, course_title, course_description, classroom_number, capacity, credit_hours, tuition_cost } = req.body;
    
    const result = await pool.query(
      'INSERT INTO class2 (course_id, course_title, course_description, classroom_number, capacity, credit_hours, tuition_cost) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [course_id, course_title, course_description, classroom_number, capacity, credit_hours, tuition_cost]
    );
    
    res.json({ message: 'Class added successfully', class: result.rows[0] });
  } catch (error) {
    console.error('Error adding class:', error);
    res.status(500).json({ error: 'Failed to add class' });
  }
});

// Delete class (admin only)
app.delete("/api/admin/classes/:id", isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM class2 WHERE id = $1 RETURNING course_id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Class not found' });
    }
    
    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    console.error('Error deleting class:', error);
    res.status(500).json({ error: 'Failed to delete class' });
  }
});

// Catch-all handler for unmatched API routes
app.use('/api', (req, res) => {
  res.status(404).json({ message: 'API endpoint not found' });
});

app.use('/auth', (req, res) => {
  res.status(404).json({ message: 'Auth endpoint not found' });
});

// Serve React app for all other routes (SPA support)  
app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../client/dist', 'index.html'));
});

// Error handling middleware (must be last)
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'production' ? {} : err.stack
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});