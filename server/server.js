// server/server.js

const path = require("path");
const express = require("express");
const cors = require("cors");
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const bcrypt = require('bcryptjs');
const pool = require('./config/database');
const passport = require('./config/passport');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

console.log("Server starting...");
const PORT = process.env.PORT || 3001;
const SERVER_URL = (process.env.SERVER_URL || `http://localhost:${PORT}`).replace(/\/$/, '');
const CLIENT_URL = (
  process.env.CLIENT_URL
  || (process.env.NODE_ENV === 'production' ? SERVER_URL : 'http://localhost:5173')
).replace(/\/$/, '');
const CORS_ORIGINS = (process.env.CORS_ORIGINS || `${CLIENT_URL},${SERVER_URL}`)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const app = express();
const ensureCompletionRequestsTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS completion_requests (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        course_id TEXT NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        requested_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        reviewed_at TIMESTAMP,
        reviewed_by INTEGER REFERENCES users(id),
        UNIQUE(user_id, course_id, status)
      )
    `);

    await pool.query('CREATE INDEX IF NOT EXISTS idx_completion_requests_user_id ON completion_requests(user_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_completion_requests_status ON completion_requests(status)');
  } catch (error) {
    console.error('Error ensuring completion_requests table:', error);
  }
};

ensureCompletionRequestsTable();

// Configure CORS
app.use(cors({
  origin: CORS_ORIGINS,
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
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('/home', (req, res) => {
  res.redirect(`${CLIENT_URL}/home`);
});

// Middleware to check authentication
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Not authenticated' });
};

const toBoolean = (value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return ['1', 'true', 't', 'yes', 'y', 'on'].includes(normalized);
  }
  return false;
};

const isAdmin = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  if (!toBoolean(req.user?.is_admin)) {
    return res.status(403).json({ message: 'Admin access required' });
  }

  return next();
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
      'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id, email, name, is_admin',
      [email, hashedPassword, name]
    );

    // Destroy any existing session before creating a new one
    req.session.regenerate((err) => {
      if (err) {
        console.error('Session regeneration error:', err);
        return res.status(500).json({ message: 'Error creating session' });
      }
      
      // Log in the new user
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
            is_admin: toBoolean(newUser.rows[0].is_admin)
          } 
        });
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
    
    // Regenerate session to prevent session fixation attacks
    req.session.regenerate((err) => {
      if (err) {
        console.error('Session regeneration error:', err);
        return res.status(500).json({ message: 'Error creating session' });
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
            is_admin: toBoolean(user.is_admin)
          } 
        });
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
    passport.authenticate('google', { failureRedirect: `${CLIENT_URL}/login?error=auth_failed` }),
    (req, res) => {
      // Successful authentication, redirect to home
      res.redirect(`${CLIENT_URL}/home`);
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
        name: req.user.name,
        is_admin: toBoolean(req.user.is_admin)
      } 
    });
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
});

app.get('/api/admin/users', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const tableInfo = await pool.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name = 'users'"
    );

    const availableColumns = new Set(tableInfo.rows.map((row) => row.column_name));
    const returningColumns = ['id', 'email', 'name', 'is_admin', 'classes', 'created_at']
      .filter((columnName) => availableColumns.has(columnName));

    if (returningColumns.length === 0) {
      return res.json([]);
    }

    const users = await pool.query(
      `SELECT ${returningColumns.join(', ')} FROM users ORDER BY id`
    );

    return res.json(users.rows);
  } catch (error) {
    console.error('Admin users fetch error:', error);
    return res.status(500).json({ message: 'Failed to fetch users' });
  }
});

app.put('/api/admin/users/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const targetUserId = Number(req.params.id);
    if (!Number.isInteger(targetUserId)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }

    const hasAdminFlag = Object.prototype.hasOwnProperty.call(req.body, 'is_admin');
    if (targetUserId === req.user.id && hasAdminFlag && !toBoolean(req.body.is_admin)) {
      return res.status(400).json({ message: 'You cannot remove your own admin access' });
    }

    const tableInfo = await pool.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name = 'users'"
    );
    const availableColumns = new Set(tableInfo.rows.map((row) => row.column_name));

    const updates = [];
    const values = [];

    const maybeAddUpdate = (columnName, valueTransform = (v) => v) => {
      if (!availableColumns.has(columnName) || typeof req.body[columnName] === 'undefined') {
        return;
      }
      values.push(valueTransform(req.body[columnName]));
      updates.push(columnName + ' = $' + values.length);
    };

    maybeAddUpdate('name');
    maybeAddUpdate('email');
    maybeAddUpdate('is_admin', toBoolean);
    maybeAddUpdate('classes', (classes) => Array.isArray(classes) ? classes : []);

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No valid fields provided for update' });
    }

    values.push(targetUserId);

    const returningColumns = ['id', 'email', 'name', 'is_admin', 'classes']
      .filter((columnName) => availableColumns.has(columnName));
    const returningClause = returningColumns.length > 0
      ? ` RETURNING ${returningColumns.join(', ')}`
      : '';

    const result = await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${values.length}${returningClause}`,
      values
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({ message: 'User updated successfully', user: result.rows[0] || null });
  } catch (error) {
    console.error('Admin user update error:', error);
    return res.status(500).json({ message: 'Failed to update user' });
  }
});

app.delete('/api/admin/users/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const targetUserId = Number(req.params.id);
    if (!Number.isInteger(targetUserId)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }

    if (targetUserId === req.user.id) {
      return res.status(400).json({ message: 'You cannot delete your own account from admin panel' });
    }

    const result = await pool.query('DELETE FROM users WHERE id = $1', [targetUserId]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Admin user delete error:', error);
    return res.status(500).json({ message: 'Failed to delete user' });
  }
});

app.get('/api/admin/classes', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const tableInfo = await pool.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name = 'class2'"
    );
    const availableColumns = new Set(tableInfo.rows.map((row) => row.column_name));
    const orderByColumn = availableColumns.has('course_id') ? 'course_id' : 'id';

    const result = await pool.query(`SELECT * FROM class2 ORDER BY ${orderByColumn}`);
    return res.json(result.rows);
  } catch (error) {
    console.error('Admin classes fetch error:', error);
    return res.status(500).json({ message: 'Failed to fetch classes' });
  }
});

app.post('/api/admin/classes', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const tableInfo = await pool.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name = 'class2'"
    );
    const availableColumns = new Set(tableInfo.rows.map((row) => row.column_name));
    const writableColumns = [
      'course_id',
      'course_title',
      'course_description',
      'classroom_number',
      'capacity',
      'credit_hours',
      'tuition_cost'
    ];

    const columns = [];
    const values = [];
    const placeholders = [];

    for (const columnName of writableColumns) {
      if (!availableColumns.has(columnName) || typeof req.body[columnName] === 'undefined') {
        continue;
      }
      columns.push(columnName);
      values.push(req.body[columnName]);
      placeholders.push(`$${values.length}`);
    }

    if (columns.length === 0) {
      return res.status(400).json({ message: 'No class fields provided' });
    }

    const result = await pool.query(
      `INSERT INTO class2 (${columns.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`,
      values
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Admin class create error:', error);
    return res.status(500).json({ message: 'Failed to create class' });
  }
});

app.put('/api/admin/classes/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const classId = Number(req.params.id);
    if (!Number.isInteger(classId)) {
      return res.status(400).json({ message: 'Invalid class id' });
    }

    const tableInfo = await pool.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name = 'class2'"
    );
    const availableColumns = new Set(tableInfo.rows.map((row) => row.column_name));
    const writableColumns = [
      'course_id',
      'course_title',
      'course_description',
      'classroom_number',
      'capacity',
      'credit_hours',
      'tuition_cost'
    ];

    const updates = [];
    const values = [];

    for (const columnName of writableColumns) {
      if (!availableColumns.has(columnName) || typeof req.body[columnName] === 'undefined') {
        continue;
      }
      values.push(req.body[columnName]);
      updates.push(`${columnName} = $${values.length}`);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No class fields provided for update' });
    }

    values.push(classId);

    const result = await pool.query(
      `UPDATE class2 SET ${updates.join(', ')} WHERE id = $${values.length} RETURNING *`,
      values
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Class not found' });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Admin class update error:', error);
    return res.status(500).json({ message: 'Failed to update class' });
  }
});

app.delete('/api/admin/classes/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const classId = Number(req.params.id);
    if (!Number.isInteger(classId)) {
      return res.status(400).json({ message: 'Invalid class id' });
    }

    const result = await pool.query('DELETE FROM class2 WHERE id = $1', [classId]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Class not found' });
    }

    return res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    console.error('Admin class delete error:', error);
    return res.status(500).json({ message: 'Failed to delete class' });
  }
});


app.put('/api/profile/update', isAuthenticated, async (req, res) => {
  try {
    const { name, bio, phone, location } = req.body;

    const tableInfo = await pool.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name = 'users'"
    );

    const availableColumns = new Set(tableInfo.rows.map((row) => row.column_name));
    const updates = [];
    const values = [];

    const maybeAddUpdate = (columnName, value) => {
      if (!availableColumns.has(columnName) || typeof value === 'undefined') {
        return;
      }
      values.push(value);
      updates.push(columnName + ' = $' + values.length);
    };

    maybeAddUpdate('name', name);
    maybeAddUpdate('bio', bio);
    maybeAddUpdate('phone', phone);
    maybeAddUpdate('location', location);

    if (updates.length === 0) {
      return res.json({ message: 'No profile fields to update' });
    }

    values.push(req.user.id);

    const hasUpdatedAt = availableColumns.has('updated_at');
    const setClause = hasUpdatedAt
      ? updates.join(', ') + ', updated_at = CURRENT_TIMESTAMP'
      : updates.join(', ');

    const returningColumns = ['id', 'email', 'name', 'is_admin', 'bio', 'phone', 'location']
      .filter((columnName) => availableColumns.has(columnName));

    const returningClause = returningColumns.length > 0
      ? ' RETURNING ' + returningColumns.join(', ')
      : '';

    const result = await pool.query(
      'UPDATE users SET ' + setClause + ' WHERE id = $' + values.length + returningClause,
      values
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({ message: 'Profile updated successfully', user: result.rows[0] || null });
  } catch (error) {
    console.error('Profile update error:', error);
    return res.status(500).json({ message: 'Failed to update profile' });
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

// Authenticated classes listing route
app.get("/api/class2", isAuthenticated, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, COALESCE(ec.enrollment_count, 0) AS enrollment_count
       FROM class2 c
       LEFT JOIN LATERAL (
         SELECT COUNT(*)::int AS enrollment_count
         FROM users u
         WHERE COALESCE(u.classes, ARRAY[]::text[]) && ARRAY[c.course_id::text, c.id::text]
       ) ec ON TRUE
       ORDER BY c.id`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching all classes:', error);
    res.status(500).json({ error: 'Failed to fetch classes' });
  }
});

app.get("/api/search-classes", isAuthenticated, async (req, res) => {
  try {
    const { query } = req.query;
    console.log('Search request received, query:', query);
    
    let result;
    if (!query) {
      console.log('Fetching all classes...');
      result = await pool.query(
        `SELECT c.*, COALESCE(ec.enrollment_count, 0) AS enrollment_count
         FROM class2 c
         LEFT JOIN LATERAL (
           SELECT COUNT(*)::int AS enrollment_count
           FROM users u
           WHERE COALESCE(u.classes, ARRAY[]::text[]) && ARRAY[c.course_id::text, c.id::text]
         ) ec ON TRUE
         ORDER BY c.course_id`
      );
    } else {
      console.log('Searching for courses matching:', query);
      result = await pool.query(
        `SELECT c.*, COALESCE(ec.enrollment_count, 0) AS enrollment_count
         FROM class2 c
         LEFT JOIN LATERAL (
           SELECT COUNT(*)::int AS enrollment_count
           FROM users u
           WHERE COALESCE(u.classes, ARRAY[]::text[]) && ARRAY[c.course_id::text, c.id::text]
         ) ec ON TRUE
         WHERE LOWER(c.course_id) LIKE LOWER($1) 
         OR LOWER(c.course_title) LIKE LOWER($1) 
         OR LOWER(c.course_description) LIKE LOWER($1)
         ORDER BY c.course_id`,
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

app.get('/api/profile/classes', isAuthenticated, async (req, res) => {
  try {
    const userResult = await pool.query('SELECT classes FROM users WHERE id = $1', [req.user.id]);
    if (userResult.rows.length === 0) return res.status(404).json({ message: 'User not found' });

    const classes = Array.isArray(userResult.rows[0].classes) ? userResult.rows[0].classes : [];
    if (classes.length === 0) return res.json([]);

    const enrolledResult = await pool.query(
      `SELECT c.*, COALESCE(ec.enrollment_count, 0) AS enrollment_count
       FROM class2 c
       LEFT JOIN LATERAL (
         SELECT COUNT(*)::int AS enrollment_count
         FROM users u
         WHERE COALESCE(u.classes, ARRAY[]::text[]) && ARRAY[c.course_id::text, c.id::text]
       ) ec ON TRUE
       WHERE c.course_id = ANY($1::text[]) OR c.id::text = ANY($1::text[])
       ORDER BY c.course_id`,
      [classes]
    );

    return res.json(enrolledResult.rows);
  } catch (error) {
    console.error('Error fetching enrolled classes:', error);
    return res.status(500).json({ message: 'Failed to fetch enrolled classes' });
  }
});

app.post('/api/classes/:courseId/enrollment', isAuthenticated, async (req, res) => {
  const MAX_ENROLLMENT = 30;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { courseId } = req.params;
    const classResult = await client.query(
      'SELECT id, course_id FROM class2 WHERE course_id = $1 OR id::text = $1 LIMIT 1',
      [courseId]
    );

    if (classResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Class not found' });
    }

    const classId = String(classResult.rows[0].id);
    const normalizedCourseId = classResult.rows[0].course_id;

    await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [normalizedCourseId]);

    const userResult = await client.query(
      'SELECT classes FROM users WHERE id = $1 FOR UPDATE',
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'User not found' });
    }

    const userClasses = Array.isArray(userResult.rows[0].classes) ? userResult.rows[0].classes : [];
    const alreadyEnrolled = userClasses.includes(normalizedCourseId) || userClasses.includes(classId);

    const enrollmentCountResult = await client.query(
      `SELECT COUNT(*)::int AS enrollment_count
       FROM users
       WHERE COALESCE(classes, ARRAY[]::text[]) && ARRAY[$1::text, $2::text]`,
      [normalizedCourseId, classId]
    );

    const enrollmentCount = Number(enrollmentCountResult.rows[0]?.enrollment_count || 0);

    if (!alreadyEnrolled && enrollmentCount >= MAX_ENROLLMENT) {
      await client.query('ROLLBACK');
      return res.status(409).json({
        message: 'Class is full (30 max)',
        enrollment_count: enrollmentCount,
        max_enrollment: MAX_ENROLLMENT,
      });
    }

    const updateResult = await client.query(
      `UPDATE users
       SET classes = CASE
         WHEN classes IS NULL THEN ARRAY[$1]::text[]
         WHEN NOT ($1 = ANY(classes)) THEN array_append(classes, $1)
         ELSE classes
       END,
       updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING classes`,
      [normalizedCourseId, req.user.id]
    );

    await client.query('COMMIT');

    return res.json({
      message: alreadyEnrolled ? 'Already enrolled' : 'Enrolled successfully',
      classes: updateResult.rows[0]?.classes || [],
      enrollment_count: alreadyEnrolled ? enrollmentCount : enrollmentCount + 1,
      max_enrollment: MAX_ENROLLMENT,
    });
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      console.error('Enrollment rollback error:', rollbackError);
    }
    console.error('Error enrolling in class:', error);
    return res.status(500).json({ message: 'Failed to enroll in class' });
  } finally {
    client.release();
  }
});


app.delete('/api/classes/:courseId/enrollment', isAuthenticated, async (req, res) => {
  const MAX_ENROLLMENT = 30;
  try {
    const { courseId } = req.params;
    const classResult = await pool.query('SELECT id, course_id FROM class2 WHERE course_id = $1 OR id::text = $1 LIMIT 1', [courseId]);
    const normalizedCourseId = classResult.rows[0]?.course_id || courseId;
    const classId = classResult.rows[0]?.id ? String(classResult.rows[0].id) : String(courseId);

    const updateResult = await pool.query(
      `UPDATE users
       SET classes = array_remove(array_remove(COALESCE(classes, ARRAY[]::text[]), $1), $2),
       updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING classes`,
      [courseId, normalizedCourseId, req.user.id]
    );

    const enrollmentCountResult = await pool.query(
      `SELECT COUNT(*)::int AS enrollment_count
       FROM users
       WHERE COALESCE(classes, ARRAY[]::text[]) && ARRAY[$1::text, $2::text]`,
      [normalizedCourseId, classId]
    );

    return res.json({
      message: 'Unenrolled successfully',
      classes: updateResult.rows[0]?.classes || [],
      enrollment_count: Number(enrollmentCountResult.rows[0]?.enrollment_count || 0),
      max_enrollment: MAX_ENROLLMENT,
    });
  } catch (error) {
    console.error('Error unenrolling from class:', error);
    return res.status(500).json({ message: 'Failed to unenroll from class' });
  }
});

app.get('/api/completion-requests/my', isAuthenticated, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT cr.id, cr.course_id, cr.status, cr.requested_at, cr.reviewed_at, c.course_title
       FROM completion_requests cr
       LEFT JOIN class2 c ON c.course_id = cr.course_id OR c.id::text = cr.course_id
       WHERE cr.user_id = $1
       ORDER BY cr.requested_at DESC`,
      [req.user.id]
    );
    return res.json(result.rows);
  } catch (error) {
    console.error('Error fetching completion requests:', error);
    return res.status(500).json({ message: 'Failed to fetch completion requests' });
  }
});

app.post('/api/classes/:courseId/completion-request', isAuthenticated, async (req, res) => {
  try {
    const { courseId } = req.params;
    const classResult = await pool.query('SELECT course_id FROM class2 WHERE course_id = $1 OR id::text = $1 LIMIT 1', [courseId]);
    if (classResult.rows.length === 0) return res.status(404).json({ message: 'Class not found' });

    const normalizedCourseId = classResult.rows[0].course_id;
    const userResult = await pool.query('SELECT classes FROM users WHERE id = $1', [req.user.id]);
    const enrolledClasses = Array.isArray(userResult.rows[0]?.classes) ? userResult.rows[0].classes : [];

    if (!enrolledClasses.includes(normalizedCourseId) && !enrolledClasses.includes(courseId)) {
      return res.status(400).json({ message: 'You must be enrolled before requesting completion' });
    }

    const pendingResult = await pool.query(
      'SELECT id FROM completion_requests WHERE user_id = $1 AND course_id = $2 AND status = $3 LIMIT 1',
      [req.user.id, normalizedCourseId, 'pending']
    );
    if (pendingResult.rows.length > 0) return res.status(409).json({ message: 'Completion request already pending approval' });

    const insertResult = await pool.query(
      `INSERT INTO completion_requests (user_id, course_id, status)
       VALUES ($1, $2, 'pending')
       RETURNING id, user_id, course_id, status, requested_at`,
      [req.user.id, normalizedCourseId]
    );

    return res.status(201).json({ message: 'Completion request submitted for admin approval', request: insertResult.rows[0] });
  } catch (error) {
    console.error('Error submitting completion request:', error);
    return res.status(500).json({ message: 'Failed to submit completion request' });
  }
});

app.get('/api/admin/completion-requests', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT cr.id, cr.user_id, cr.course_id, cr.status, cr.requested_at, cr.reviewed_at, cr.reviewed_by,
              u.name AS user_name, u.email AS user_email, reviewer.name AS reviewer_name, c.course_title
       FROM completion_requests cr
       JOIN users u ON u.id = cr.user_id
       LEFT JOIN users reviewer ON reviewer.id = cr.reviewed_by
       LEFT JOIN class2 c ON c.course_id = cr.course_id OR c.id::text = cr.course_id
       ORDER BY CASE WHEN cr.status = 'pending' THEN 0 ELSE 1 END, cr.requested_at DESC`
    );
    return res.json(result.rows);
  } catch (error) {
    console.error('Error fetching admin completion requests:', error);
    return res.status(500).json({ message: 'Failed to fetch completion requests' });
  }
});

app.post('/api/admin/completion-requests/:id/approve', isAuthenticated, isAdmin, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const result = await client.query(
      `UPDATE completion_requests
       SET status = 'approved', reviewed_at = CURRENT_TIMESTAMP, reviewed_by = $1
       WHERE id = $2 AND status = 'pending'
       RETURNING id, user_id, course_id, status, requested_at, reviewed_at, reviewed_by`,
      [req.user.id, id]
    );

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Pending request not found' });
    }

    const approvedRequest = result.rows[0];
    const classResult = await client.query(
      'SELECT id, course_id FROM class2 WHERE course_id = $1 OR id::text = $1 LIMIT 1',
      [approvedRequest.course_id]
    );

    const normalizedCourseId = classResult.rows[0]?.course_id || approvedRequest.course_id;
    const classId = classResult.rows[0]?.id ? String(classResult.rows[0].id) : String(approvedRequest.course_id);

    await client.query(
      `UPDATE users
       SET classes = array_remove(array_remove(array_remove(COALESCE(classes, ARRAY[]::text[]), $1), $2), $3),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4`,
      [approvedRequest.course_id, normalizedCourseId, classId, approvedRequest.user_id]
    );

    await client.query('COMMIT');

    return res.json({ message: 'Completion request approved', request: result.rows[0] });
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      console.error('Completion approval rollback error:', rollbackError);
    }
    console.error('Error approving completion request:', error);
    return res.status(500).json({ message: 'Failed to approve completion request' });
  } finally {
    client.release();
  }
});
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});


