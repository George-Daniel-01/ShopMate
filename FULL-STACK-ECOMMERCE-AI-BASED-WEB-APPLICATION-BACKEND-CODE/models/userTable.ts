import { database } from "../database/db.js";

export async function createUserTable() {
  try {
    const query = `
      CREATE TABLE IF NOT EXISTS users (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        is_admin BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await database.query(query);
    console.log("✅ Users table created or already exists");
  } catch (error) {
    console.error("❌ Failed To Create Users Table.", error);
    process.exit(1);
  }
}
