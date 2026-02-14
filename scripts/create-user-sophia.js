const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

async function main() {
    if (!process.env.DATABASE_URL) {
        console.error('DATABASE_URL not found in .env.local');
        process.exit(1);
    }

    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });

    const client = await pool.connect();
    try {
        console.log('Creating user Sophia...');

        // 1. Get Store (Matriz)
        const storeRes = await client.query("SELECT * FROM stores WHERE slug = $1", ['hidrel-caragua-matriz']);
        if (storeRes.rows.length === 0) {
            console.error('Store Matriz not found!');
            return;
        }
        const store = storeRes.rows[0];

        // 2. Create/Update User
        const passwordSimple = '123123';
        const hashedPassword = await bcrypt.hash(passwordSimple, 10);
        const username = 'sophia123';
        const email = 'sophia123'; // Using username as email column for now since we switched logic

        // Check if exists using the username (which is stored in email column now)
        const userRes = await client.query("SELECT * FROM users WHERE email = $1", [username]);

        if (userRes.rows.length === 0) {
            await client.query(
                "INSERT INTO users (name, email, password, role, store_id) VALUES ($1, $2, $3, $4, $5)",
                ['Sophia', username, hashedPassword, 'EMPLOYEE', store.id]
            );
            console.log(`User created: ${username}`);
        } else {
            await client.query(
                "UPDATE users SET password = $1, store_id = $2, name = $3 WHERE email = $4",
                [hashedPassword, store.id, 'Sophia', username]
            );
            console.log(`User updated: ${username}`);
        }

    } catch (error) {
        console.error('Failed:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

main();
