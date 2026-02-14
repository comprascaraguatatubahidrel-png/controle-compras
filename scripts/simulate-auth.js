const { z } = require('zod');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function getUser(email, pool) {
    const client = await pool.connect();
    try {
        const res = await client.query("SELECT * FROM users WHERE email = $1", [email]);
        return res.rows[0];
    } finally {
        client.release();
    }
}

async function simulateAuth(username, password) {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        console.log(`Simulating login for: ${username}`);

        // 1. Zod Parse
        const parsedCredentials = z
            .object({ email: z.string().min(1), password: z.string().min(1) })
            .safeParse({ email: username, password: password });

        if (parsedCredentials.success) {
            console.log('Zod validation passed');
            const { email, password } = parsedCredentials.data;

            const user = await getUser(email, pool);
            if (!user) {
                console.log('User not found in DB');
                return null;
            }
            console.log('User found:', user.email);

            const passwordsMatch = await bcrypt.compare(password, user.password);
            if (passwordsMatch) {
                console.log('Password match! Login SUCCESS');
                return user;
            } else {
                console.log('Password mismatch.');
            }
        } else {
            console.log('Zod validation failed');
        }
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await pool.end();
    }
}

simulateAuth('marcelo123', '210598');
