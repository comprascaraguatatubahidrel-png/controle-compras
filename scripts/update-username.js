const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function main() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });

    const client = await pool.connect();
    try {
        console.log('Updating user to simple username...');

        // Update marcelo123@hidrel.com to marcelo123
        await client.query(
            "UPDATE users SET email = $1 WHERE email = $2",
            ['marcelo123', 'marcelo123@hidrel.com']
        );
        console.log('User updated: marcelo123');

        // Also update admin if needed (optional, keeping as is for now unless requested)
        // await client.query("UPDATE users SET email = 'admin' WHERE email = 'admin@loja.com'");

    } catch (error) {
        console.error('Failed:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

main();
