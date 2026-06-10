const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function main() {
  try {
    await client.connect();
    console.log('Connected to the database.');
    
    // Update constraint first to allow new roles
    console.log('Updating staff role check constraint...');
    await client.query(`
      ALTER TABLE staff DROP CONSTRAINT IF EXISTS staff_role_check;
      ALTER TABLE staff ADD CONSTRAINT staff_role_check CHECK (role IN ('viewer', 'admin', 'super_admin', 'staff', 'principal'));
    `);
    
    const seedSqlPath = path.join(__dirname, '../database/seed.sql');
    const sql = fs.readFileSync(seedSqlPath, 'utf8');
    
    console.log('Seeding database...');
    await client.query(sql);
    console.log('Database seeded successfully!');
  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    await client.end();
  }
}

main();
