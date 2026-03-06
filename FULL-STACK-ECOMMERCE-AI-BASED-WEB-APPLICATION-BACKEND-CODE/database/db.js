import pkg from "pg";
import dotenv from "dotenv";
dotenv.config({ path: "./config/config.env" });
const { Pool } = pkg;

const isProduction = process.env.DB_HOST && process.env.DB_HOST.includes("neon.tech");

export const database = new Pool(
  isProduction
    ? {
        connectionString: `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_NAME}?sslmode=require`,
        ssl: { rejectUnauthorized: false },
      }
    : {
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: Number(process.env.DB_PORT),
        ssl: false,
      }
);

export const connectDB = async () => {
  try {
    await database.query("SET search_path TO public");
    console.log("✅ Connected to PostgreSQL successfully");
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    process.exit(1);
  }
};