import { database } from './database/db.js';
import bcrypt from 'bcrypt';
const hash = await bcrypt.hash('George2024!!', 10);
await database.query('UPDATE users SET password = $1 WHERE email = $2', [hash, 'georgeabiamakadaniel@gmail.com']);
console.log('Password updated!');
process.exit(0);