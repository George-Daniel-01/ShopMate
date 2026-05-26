import { neon, NeonQueryFunction } from "@neondatabase/serverless";
import dotenv from "dotenv";
dotenv.config({ path: "./config/config.env" });

const sql: NeonQueryFunction<false, false> = neon(process.env.DATABASE_URL!);

export const database = {
  query: async <T = any>(text: string, params?: any[]): Promise<{ rows: T[] }> => {
    const result = await sql.query(text, params ?? []);
    return { rows: result.rows as T[] };
  },
};

export const connectDB = async (): Promise<void> => {
  try {
    await sql.query("SELECT 1");
    console.log("Connected to Neon PostgreSQL successfully");
  } catch (error) {
    console.error("DB connection failed:", error);
    throw error;
  }
};
