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
        google_id TEXT DEFAULT NULL,
        reset_password_token TEXT DEFAULT NULL,
        reset_password_expire TIMESTAMP DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await database.query(query);

    const ensure = async (sql: string) => {
      try {
        await database.query(sql);
      } catch {
        // best-effort migration, failures are non-fatal
      }
    };

    await ensure(`CREATE EXTENSION IF NOT EXISTS pgcrypto`);
    await ensure(`ALTER TABLE users RENAME COLUMN uuid TO id`);
    await ensure(`ALTER TABLE users ADD COLUMN IF NOT EXISTS id UUID`);
    await ensure(`UPDATE users SET id = gen_random_uuid() WHERE id IS NULL`);
    await ensure(`ALTER TABLE users ALTER COLUMN id SET NOT NULL`);
    await ensure(`ALTER TABLE users ALTER COLUMN id SET DEFAULT gen_random_uuid()`);
    await ensure(`ALTER TABLE users ADD CONSTRAINT users_id_unique UNIQUE (id)`);
    await ensure(`ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255) NOT NULL DEFAULT 'temp_password'`);
    await ensure(`ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(10) DEFAULT 'User'`);
    await ensure(`ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar JSONB DEFAULT NULL`);
    await ensure(`ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id TEXT DEFAULT NULL`);
    await ensure(`ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_password_token TEXT DEFAULT NULL`);
    await ensure(`ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_password_expire TIMESTAMP DEFAULT NULL`);
    await ensure(`ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);

    console.log("✅ Users table created or already exists");
  } catch (error) {
    console.error("❌ Failed To Create Users Table.", error);
    throw error;
  }
}
