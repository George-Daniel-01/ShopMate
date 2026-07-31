import { database } from "../database/db.js";

export async function createCategoriesTable() {
  try {
    const query = `CREATE TABLE IF NOT EXISTS categories (
         id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
         name VARCHAR(100) NOT NULL UNIQUE,
         image JSONB DEFAULT '{}'::JSONB,
         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`;
    await database.query(query);
  } catch (error) {
    console.error("Failed To Create Categories Table.", error);
    throw error;
  }
}
