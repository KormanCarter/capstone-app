// server/server.js

const path = require("path");
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const DB_URL = process.env.DB_URL || "postgresql://postgres_fwcd_user:QppNSwd21Pev5ItNIy246Ah21znp0jMI@dpg-d610ovl6ubrc739k1dsg-a.oregon-postgres.render.com/postgres_fwcd";
const pool = new Pool({
  connectionString: DB_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

console.log("Hello")
const PORT = process.env.PORT || 3001;

const app = express();

// CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'], // Allow both Vite and React dev servers
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.static(path.resolve(__dirname, "../client/dist")));
app.use(express.json());

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

// Handle GET requests to /api route
app.get("/api", (req, res) => {
  res.json({ message: "Hello from server!" });
});

// Get all classes
app.get("/api/classes", async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM class2 ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching all classes:', error);
    res.status(500).json({ error: 'Failed to fetch classes' });
  }
});

// Search endpoint for class2 table
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