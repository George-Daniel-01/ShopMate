const bcrypt = require('bcrypt');
const {Client} = require('pg');
const client = new Client({connectionString: 'postgresql://neondb_owner:npg_1iczWtTeRp6s@ep-green-glitter-abnrioso-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require'});
bcrypt.hash('NewPassword123!', 10).then(async hash => {
  await client.connect();
  await client.query('UPDATE users SET password=' + '$' + '1 WHERE email=' + '$' + '2', [hash, 'georgeabiamakadaniel@gmail.com']);
  console.log('Done:', hash);
  await client.end();
});
