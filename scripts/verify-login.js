const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

async function main() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });

    const client = await pool.connect();
    try {
        console.log('Verifying user Sophia...');

        // 1. Get User
        // Note: we updated the schema to use 'email' column as username holder in previous step? 
        // Let's check what's actually in the DB.
        const res = await client.query("SELECT * FROM users WHERE email = $1", ['sophia123']);
        if (res.rows.length === 0) {
            console.error('User sophia123 NOT FOUND in email column');

            // Check if it's in name or something?
            const res2 = await client.query("SELECT * FROM users WHERE name = $1", ['Sophia']);
            console.log('Found by name Sophia:', res2.rows);
            return;
        }

        const user = res.rows[0];
        console.log('User found:', { id: user.id, email: user.email, role: user.role, store_id: user.store_id });

        // 2. Check Password
        const password = '123123';
        const valid = await bcrypt.compare(password, user.password);
        console.log(`Password '${password}' is valid?`, valid);

    } catch (error) {
        console.error('Failed:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

main();
