import pg from "pg";
import dotenv from "dotenv";
dotenv.config({ path: "./config/config.env" });

const { Pool } = pg;

export const database = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

database.on("error", (err) => {
  console.error("Unexpected pool error:", err);
});

export const connectDB = async (retries = 3, delay = 2000): Promise<void> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await database.query("SELECT 1");
      console.log("Connected to Neon PostgreSQL successfully");
      return;
    } catch (error) {
      if (attempt < retries) {
        console.warn(`DB connection failed (attempt ${attempt}/${retries}), retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2;
      } else {
        console.error("DB connection failed after all retries:", error);
        throw error;
      }
    }
  }
};

