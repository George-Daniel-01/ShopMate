import dns from "dns";
dns.setDefaultResultOrder("ipv4first");

import pkg from "pg";
import dotenv from "dotenv";
dotenv.config({ path: "./config/config.env" });

const { Pool } = pkg;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

export const database = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 1,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 10000,
  family: 4,
});

export const connectDB = async (): Promise<void> => {
  try {
    await database.query("SELECT 1");
    console.log("Connected to PostgreSQL successfully");
  } catch (error) {
    console.error("Database connection failed:", (error as Error).message);
    process.exit(1);
  }
};