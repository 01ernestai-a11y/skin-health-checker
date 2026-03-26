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
            ALTER TABLE chats ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'patient_doctor';
        `);
        console.log("Added type column to chats table");

        await client.query(`
            ALTER TABLE chats ALTER COLUMN patient_id DROP NOT NULL;
        `);
        console.log("Made patient_id nullable");

        await client.query(`
            ALTER TABLE chats ADD COLUMN IF NOT EXISTS doctor2_id UUID REFERENCES doctors(id) ON DELETE CASCADE;
        `);
        console.log("Added doctor2_id column to chats table");

        console.log("Migration 8 completed successfully");
    } catch (e) {
        console.error("Migration failed:", e);
    } finally {
        await client.end();
    }
}

migrate();
