// server/server.js

const path = require("path");
const express = require("express");
const cors = require("cors");
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const bcrypt = require('bcryptjs');
const pool = require('./config/database');
const passport = require('./config/passport');
require('dotenv').config({ path: path.resolve(__dirname, '.env'), override: true });

console.log("Server starting...")
const PORT = process.env.PORT || 3001;
const CLIENT_URL = 'http://localhost:5173';

const app = express();

// Configure CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] // Replace with your production domain
    : ['http://localhost:5174', 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

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

app.get('/home', (req, res) => {
  res.redirect('http://localhost:5173/home');
});

// Middleware to check authentication
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Not authenticated' });
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
          name: newUser.rows[0].name 
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
          name: user.name 
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
    passport.authenticate('google', { failureRedirect: 'http://localhost:5173/login?error=auth_failed' }),
    (req, res) => {
      // Successful authentication, redirect to home
      res.redirect('http://localhost:5173/home');
    }
  );
} else {
  // If Google OAuth is not configured, return an error
  app.get('/auth/google', (req, res) => {
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
        name: req.user.name 
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

// REMOVED AUTHENTICATION -Put bacck authentication when done
app.get("/api/class2", async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM class2 ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching all classes:', error);
    res.status(500).json({ error: 'Failed to fetch classes' });
  }
});

// Search endpoint for class2 table (public route - authentication removed)
app.get("/api/search-classes", async (req, res) => {
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
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});