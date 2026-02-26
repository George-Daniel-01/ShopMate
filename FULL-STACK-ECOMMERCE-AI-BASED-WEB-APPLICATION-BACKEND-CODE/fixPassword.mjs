import bcrypt from 'bcrypt';
import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: './config/config.env' });
const { Client } = pkg;

const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

await client.connect();
const hash = await bcrypt.hash('07060512565Dan!!', 10);
await client.query('UPDATE users SET password = $1 WHERE email = $2', [hash, 'georgeabiamakadaniel@gmail.com']);
console.log('Password updated! You can now login.');
await client.end();
