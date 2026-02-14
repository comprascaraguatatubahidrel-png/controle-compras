const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function main() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });

    const client = await pool.connect();
    try {
        console.log('--- DATABASE INSPECTION ---');

        // 1. Check Stores
        const stores = await client.query("SELECT * FROM stores");
        console.log('Stores found:', stores.rows);

        // 2. Check Orders count and storeIds
        const ordersTotal = await client.query("SELECT count(*) FROM orders");
        console.log('Total Orders:', ordersTotal.rows[0].count);

        const ordersPerStore = await client.query("SELECT store_id, count(*) FROM orders GROUP BY store_id");
        console.log('Orders per store_id:', ordersPerStore.rows);

        // 3. Check Users
        const users = await client.query("SELECT id, email, store_id FROM users");
        console.log('Users found:', users.rows);

    } catch (error) {
        console.error('Failed:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

main();
