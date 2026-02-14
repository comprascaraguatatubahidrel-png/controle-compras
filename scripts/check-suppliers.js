const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function main() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });

    const client = await pool.connect();
    try {
        console.log('Suppliers linkage check:');
        const suppliersPerStore = await client.query("SELECT store_id, count(*) FROM suppliers GROUP BY store_id");
        console.log('Suppliers per store_id:', suppliersPerStore.rows);

        const nullSuppliers = await client.query("SELECT id, name FROM suppliers WHERE store_id IS NULL");
        console.log('Null store_id suppliers count:', nullSuppliers.rows.length);

    } catch (error) {
        console.error('Failed:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

main();
