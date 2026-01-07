const { neon } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-http');
const dotenv = require('dotenv');
const { resolve } = require('path');

dotenv.config({ path: resolve(__dirname, '.env.local') });

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

async function checkData() {
    try {
        const result = await db.execute('SELECT count(*) FROM orders');
        console.log('Order count:', result[0]);

        const sample = await db.execute('SELECT status, total_value FROM orders LIMIT 5');
        console.log('Sample orders:', sample);
    } catch (e) {
        console.error('Error fetching data:', e);
    }
}

checkData();
