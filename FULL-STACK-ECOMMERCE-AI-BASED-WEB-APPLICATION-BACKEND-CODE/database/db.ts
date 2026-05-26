import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";
dotenv.config({ path: "./config/config.env" });

const sql = neon(process.env.DATABASE_URL!);

export const database = {
  query: async (text: string, params?: any[]) => {
    const result = await sql(text, params ?? []);
    return { rows: result as any[] };
  },
};

export const connectDB = async (): Promise<void> => {
  try {
    await sql`SELECT 1`;
    console.log("Connected to Neon PostgreSQL successfully");
  } catch (error) {
    console.error("DB connection failed:", error);
    throw error;
  }
};
