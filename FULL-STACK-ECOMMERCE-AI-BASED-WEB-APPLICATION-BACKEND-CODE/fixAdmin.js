import bcrypt from 'bcrypt';
import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';

dotenv.config({ path: './config/config.env' });

const fixAdmin = async () => {
  const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

  try {
    await client.connect();
    const email = 'georgeabiamakadaniel@gmail.com';
    const plainPassword = '07060512565Dan!!';
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    
    const result = await client.query(
      'UPDATE users SET password = \ WHERE email = \ RETURNING id, name, email, role',
      [hashedPassword, email]
    );
    
    if (result.rows.length === 0) {
      console.log(' Admin not found');
    } else {
      console.log(' Admin password fixed!');
      console.log('Email:', email);
      console.log('Password:', plainPassword);
    }
    await client.end();
    process.exit(0);
  } catch (error) {
    console.error(' Error:', error.message);
    await client.end();
    process.exit(1);
  }
};

fixAdmin();
