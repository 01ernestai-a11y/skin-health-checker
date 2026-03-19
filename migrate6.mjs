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
            CREATE TABLE IF NOT EXISTS forum_posts (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
            );

            CREATE TABLE IF NOT EXISTS forum_comments (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
                doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
                content TEXT NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
            );
        `);
        console.log("Successfully created forum_posts and forum_comments tables");

    } catch (e) {
        console.error("Migration failed:", e);
    } finally {
        await client.end();
    }
}

migrate();
