import pkg from "pg";
import dotenv from "dotenv";
dotenv.config({ path: "./config/config.env" });
const { Pool } = pkg;

export const database = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export const connectDB = async () => {
  try {
    await database.query("SET search_path TO public");
    console.log("✅ Connected to PostgreSQL successfully");
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    process.exit(1);
  }
};