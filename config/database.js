require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000, // 5 second timeout
    idleTimeoutMillis: 10000,
});

async function testConnection() {
    console.log('Attempting to connect to:', process.env.DB_HOST);
    console.log('Port:', process.env.DB_PORT);
    console.log('Database:', process.env.DB_NAME);
    console.log('User:', process.env.DB_USER);

    try {
        const client = await pool.connect();
        console.log('Connected successfully to RDS!');
        const result = await client.query('SELECT NOW()');
        console.log('Current time from DB:', result.rows[0].now);
        client.release();

        // Close pool and exit for testing
        await pool.end();
        process.exit(0);
    } catch (err) {
        console.error('Connection failed:', err.message);
        console.error('Error code:', err.code);
        await pool.end();
        process.exit(1);
    }
}

testConnection();

module.exports = pool;