// server/server.js

const path = require("path");
const express = require("express");
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
app.use(express.static(path.resolve(__dirname, "../client/dist")));
app.use(express.json());

// Handle GET requests to /api route
app.get("/api", (req, res) => {
  res.json({ message: "Hello from server!" });
});

// Search endpoint for class2 table
app.get("/api/search-classes", async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.json([]);
    }
    
    // Search for ID that matches the query
    const result = await pool.query(
      'SELECT * FROM class2 WHERE id::text LIKE $1',
      [`%${query}%`]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error searching classes:', error);
    res.status(500).json({ error: 'Failed to search classes' });
  }
});
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});