import pg from 'pg';
import 'dotenv/config';

const { Client } = pg;

async function migrate() {
    const client = new Client({
        connectionString: process.env.POSTGRES_URL_NON_POOLING.replace('?sslmode=require', ''),
        ssl: { rejectUnauthorized: false }
    });
    await client.connect();

    // Migration 9: avatar_url
    await client.query('ALTER TABLE patients ADD COLUMN IF NOT EXISTS avatar_url TEXT');
    await client.query('ALTER TABLE doctors ADD COLUMN IF NOT EXISTS avatar_url TEXT');
    console.log('Migration 9: avatars added');

    // Migration 10: doctor_checks
    await client.query(`
        CREATE TABLE IF NOT EXISTS doctor_checks (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
          photo_url TEXT NOT NULL,
          q1_answer TEXT,
          q2_answer TEXT,
          q3_answer TEXT,
          q4_answer TEXT,
          q5_answer TEXT,
          ai_verdict TEXT NOT NULL,
          ai_chat_history JSONB,
          notes TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
    `);
    await client.query('ALTER TABLE doctor_checks ENABLE ROW LEVEL SECURITY');
    await client.query('DROP POLICY IF EXISTS "Doctors can manage own checks" ON doctor_checks');
    await client.query(`
        CREATE POLICY "Doctors can manage own checks" ON doctor_checks
        FOR ALL USING (auth.uid() = doctor_id)
    `);
    console.log('Migration 10: doctor_checks created');

    // Migration 11: admin_settings
    await client.query(`
        CREATE TABLE IF NOT EXISTS admin_settings (
          admin_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
          telegram_chat_id TEXT,
          telegram_bot_token TEXT,
          updated_at TIMESTAMPTZ DEFAULT NOW()
        )
    `);
    await client.query('ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY');
    await client.query('DROP POLICY IF EXISTS "Admins manage own settings" ON admin_settings');
    await client.query(`
        CREATE POLICY "Admins manage own settings" ON admin_settings
        FOR ALL USING (auth.uid() = admin_id)
    `);
    console.log('Migration 11: admin_settings created');

    await client.end();
}

migrate().catch(e => {
    console.error('Migration failed:', e);
    process.exit(1);
});
