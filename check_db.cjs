require("dotenv").config();
const { db } = require("./server/db/index.cjs");
const { sql } = require("drizzle-orm");

async function checkDb() {
  console.log("Checking DB connection...");
  try {
    const start = Date.now();
    await db.execute(sql`SELECT 1`);
    console.log(`DB Connected successfully in ${Date.now() - start}ms`);
    process.exit(0);
  } catch (error) {
    console.error("DB Connection failed:", error);
    process.exit(1);
  }
}

checkDb();
