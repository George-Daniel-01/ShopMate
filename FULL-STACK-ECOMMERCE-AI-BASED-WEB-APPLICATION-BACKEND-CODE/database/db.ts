import { Pool } from "@neondatabase/serverless";
import dotenv from "dotenv";
dotenv.config({ path: "./config/config.env" });

export const database = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const connectDB = async (): Promise<void> => {
  try {
    await database.query("SELECT 1");
    console.log("Connected to Neon PostgreSQL successfully");
  } catch (error) {
    console.error("DB connection failed:", error);
    throw error;
  }
};
