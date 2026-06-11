const mysql = require('mysql2/promise');
require('dotenv').config();

async function createDb() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
  });

  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'healthcare_support'}\`;`);
  console.log(`Database '${process.env.DB_NAME || 'healthcare_support'}' created or already exists.`);
  await connection.end();
}

createDb().catch(err => {
  console.error('Failed to create database:', err.message);
  process.exit(1);
});
