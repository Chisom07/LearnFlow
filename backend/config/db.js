const path = require("path");
const { Pool } = require("pg");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

if (!process.env.DATABASE_URL) {
  console.error("Missing DATABASE_URL in backend/.env");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000
});

pool.on("error", (err) => {
  console.error("Unexpected PostgreSQL error:", err.message);
});

async function testConnection() {
  try {
    const result = await pool.query("SELECT NOW() AS now");
    console.log("Database connected:", result.rows[0].now.toISOString());
  } catch (err) {
    console.error("Database connection failed:", err.message);
    console.error(
      "Check DATABASE_URL in backend/.env (user, password, host, port, database name)."
    );
  }
}

testConnection();

module.exports = pool;
