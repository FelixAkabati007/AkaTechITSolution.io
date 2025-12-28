require("dotenv").config();
const { db } = require("./db/index.cjs");
const { users } = require("./db/schema.cjs");
const { count } = require("drizzle-orm");

const verify = async () => {
  console.log("Verifying database connection...");
  try {
    const result = await db.select({ count: count() }).from(users);
    console.log("Database connection successful!");
    console.log("User count:", result[0].count);
    process.exit(0);
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
};

verify();
