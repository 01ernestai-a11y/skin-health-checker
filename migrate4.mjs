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

        // Add `is_verified` column to `doctors`
        await client.query(`
            ALTER TABLE doctors ADD COLUMN is_verified BOOLEAN NOT NULL DEFAULT FALSE;
        `);
        console.log("Successfully added `is_verified` column to doctors table");

    } catch (e) {
        if (e.message.includes("column \"is_verified\" of relation \"doctors\" already exists")) {
            console.log("Column `is_verified` already exists. Skipping.");
        } else {
            console.error("Migration failed:", e);
        }
    } finally {
        await client.end();
    }
}

migrate();
