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
        console.log('Seeding database...');

        // 1. Get or Create Store
        console.log('Checking/Creating store...');
        let storeRes = await client.query("SELECT * FROM stores WHERE slug = $1", ['matriz']);
        let store;

        if (storeRes.rows.length === 0) {
            storeRes = await client.query(
                "INSERT INTO stores (name, slug) VALUES ($1, $2) RETURNING id, name",
                ['Loja Matriz', 'matriz']
            );
            console.log('Store created:', storeRes.rows[0]);
        } else {
            console.log('Store already exists:', storeRes.rows[0]);
        }
        store = storeRes.rows[0];

        // 2. Get or Create User
        console.log('Checking/Creating admin user...');
        let userRes = await client.query("SELECT * FROM users WHERE email = $1", ['admin@loja.com']);

        if (userRes.rows.length === 0) {
            const hashedPassword = await bcrypt.hash('123456', 10);
            const newUserRes = await client.query(
                "INSERT INTO users (name, email, password, role, store_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, email",
                ['Admin', 'admin@loja.com', hashedPassword, 'ADMIN', store.id]
            );
            console.log('User created:', newUserRes.rows[0]);
        } else {
            console.log('User already exists:', userRes.rows[0]);
        }

        // 3. Update existing data
        console.log('Updating existing data to belong to new store...');
        await client.query("UPDATE orders SET store_id = $1 WHERE store_id IS NULL", [store.id]);
        await client.query("UPDATE suppliers SET store_id = $1 WHERE store_id IS NULL", [store.id]);
        await client.query("UPDATE refused_invoices SET store_id = $1 WHERE store_id IS NULL", [store.id]);

        console.log('Seed completed successfully!');
    } catch (error) {
        console.error('Seed failed:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

main();
