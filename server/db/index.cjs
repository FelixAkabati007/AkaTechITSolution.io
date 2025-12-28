const { Pool } = require("pg");
const { drizzle } = require("drizzle-orm/node-postgres");
const schema = require("./schema.cjs");

// Default to a placeholder if not set, but it will fail on query if invalid
const connectionString = process.env.DATABASE_URL;

let db;

if (connectionString) {
  const pool = new Pool({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }, // Required for Neon
    max: 10, // Connection pool size
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 30000, // Increased to 30s to handle Neon cold starts
  });
  db = drizzle(pool, { schema });
} else {
  console.warn("DATABASE_URL is not set. Database features will fail.");
}

module.exports = { db };
