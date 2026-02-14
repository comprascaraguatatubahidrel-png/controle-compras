const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

async function main() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });

    const client = await pool.connect();
    try {
        console.log('Verifying user Marcelo...');

        // 1. Get User
        const res = await client.query("SELECT * FROM users WHERE email = $1", ['marcelo123']);
        if (res.rows.length === 0) {
            console.error('User marcelo123 NOT FOUND');
            return;
        }

        const user = res.rows[0];
        console.log('User found:', { id: user.id, username: user.email, role: user.role, store_id: user.store_id });

        // 2. Check Password
        const password = '210598';
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
