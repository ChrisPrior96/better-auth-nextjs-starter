const { drizzle } = require('drizzle-orm/node-postgres');
const { Pool } = require('pg');
const dotenv = require('dotenv');
const { sql } = require('drizzle-orm');

dotenv.config();

async function main() {
    if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL environment variable is not set');
    }

    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });

    const db = drizzle(pool);

    console.log('🔍 Checking users table for verification_status field...');

    try {
        // Check if verification_status column exists
        const verificationColumn = await db.execute(sql`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'users' AND column_name = 'verification_status';
    `);

        if (verificationColumn.rows.length === 0) {
            console.log('➕ Adding verification_status column to users table...');

            // Add the verification_status column with default value "pending"
            await db.execute(sql`
        ALTER TABLE users
        ADD COLUMN verification_status text NOT NULL DEFAULT 'pending';
      `);

            console.log('✅ Added verification_status column with default value "pending"');
        } else {
            console.log('✅ verification_status column already exists');
        }

        console.log('✅ Verification status field check complete!');
    } catch (error) {
        console.error('❌ Error updating schema:', error);
    } finally {
        await pool.end();
    }
}

main().catch((err) => {
    console.error('Failed to update schema:', err);
    process.exit(1);
}); 