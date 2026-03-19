import pg from 'pg';
import "dotenv/config";

const { Client } = pg;

async function migrate() {
    const client = new Client({
        connectionString: process.env.POSTGRES_URL_NON_POOLING.replace('?sslmode=require', ''),
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log("Connected to DB.");

        await client.query(`
            ALTER TABLE doctors 
            ADD COLUMN IF NOT EXISTS education TEXT,
            ADD COLUMN IF NOT EXISTS experience_years INTEGER DEFAULT 0;
        `);
        console.log("Successfully added `education` and `experience_years` columns to doctors table");

    } catch (e) {
        console.error("Migration failed:", e);
    } finally {
        await client.end();
    }
}

migrate();
