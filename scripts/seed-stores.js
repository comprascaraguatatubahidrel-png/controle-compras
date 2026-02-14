const { Pool } = require('pg');
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
        console.log('Configuring stores...');

        // 1. Rename existing "Loja Matriz" to "Hidrel Caraguatatuba Matriz"
        // We identify it by slug 'matriz' which we set earlier
        console.log('Renaming Main Store...');
        await client.query(
            "UPDATE stores SET name = $1, slug = $2 WHERE slug = $3",
            ['Hidrel Caraguatatuba Matriz', 'hidrel-caragua-matriz', 'matriz']
        );

        // 2. Create other stores
        const newStores = [
            { name: 'Hidrel Parafusos', slug: 'hidrel-parafusos' },
            { name: 'Hidrel Ubatuba', slug: 'hidrel-ubatuba' },
            { name: 'Hidrel São Sebastião', slug: 'hidrel-sao-sebastiao' },
            { name: 'Centro de Distribuição (CD)', slug: 'hidrel-cd' }
        ];

        for (const store of newStores) {
            console.log(`Creating ${store.name}...`);
            // IDEMPOTENT INSERT
            const res = await client.query(
                "INSERT INTO stores (name, slug) VALUES ($1, $2) ON CONFLICT (slug) DO NOTHING RETURNING id",
                [store.name, store.slug]
            );
            if (res.rows.length > 0) {
                console.log(`Matched/Created ${store.name} with ID: ${res.rows[0].id}`);
            } else {
                console.log(`${store.name} already exists.`);
            }
        }

        console.log('Stores configured successfully!');
    } catch (error) {
        console.error('Configuration failed:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

main();
