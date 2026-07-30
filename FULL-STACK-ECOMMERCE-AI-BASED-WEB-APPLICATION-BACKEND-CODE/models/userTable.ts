import { database } from "../database/db.js";

export async function createUserTable() {
  try {
    const query = `
      CREATE TABLE IF NOT EXISTS users (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(10) DEFAULT 'User',
        avatar JSONB DEFAULT NULL,
        reset_password_token TEXT DEFAULT NULL,
        reset_password_expire TIMESTAMP DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await database.query(query);

    const migrations = [
      `CREATE EXTENSION IF NOT EXISTS pgcrypto`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255) NOT NULL DEFAULT 'temp_password'`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(10) DEFAULT 'User'`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar JSONB DEFAULT NULL`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_password_token TEXT DEFAULT NULL`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_password_expire TIMESTAMP DEFAULT NULL`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,
    ];
    try { await database.query(`ALTER TABLE users RENAME COLUMN uuid TO id`); } catch { }
    try { await database.query(`ALTER TABLE users ALTER COLUMN id SET DEFAULT gen_random_uuid()`); } catch { }
    try { await database.query(`ALTER TABLE users ALTER COLUMN id SET NOT NULL`); } catch { }
    try { await database.query(`ALTER TABLE users ALTER COLUMN uuid SET DEFAULT gen_random_uuid()`); } catch { }
    for (const m of migrations) {
      try {
        await database.query(m);
      } catch { }
    }

    console.log("✅ Users table created or already exists");
  } catch (error) {
    console.error("❌ Failed To Create Users Table.", error);
    throw error;
  }
}
