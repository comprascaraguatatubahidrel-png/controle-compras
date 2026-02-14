const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function main() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });

    const client = await pool.connect();
    try {
        console.log('Order status distribution:');
        const statusDist = await client.query("SELECT status, count(*) FROM orders GROUP BY status");
        console.log(statusDist.rows);

        const store1StatusDist = await client.query("SELECT status, count(*) FROM orders WHERE store_id = 1 GROUP BY status");
        console.log('Store 1 status distribution:', store1StatusDist.rows);

    } catch (error) {
        console.error('Failed:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

main();
