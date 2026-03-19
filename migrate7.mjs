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
        
        await client.query(`
            ALTER TABLE forum_posts
            ADD COLUMN IF NOT EXISTS image_url TEXT;
        `);
        console.log("Successfully added image_url to forum_posts table");

    } catch (e) {
        console.error("Migration failed:", e);
    } finally {
        await client.end();
    }
}

migrate();
