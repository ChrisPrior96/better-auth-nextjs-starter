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

    console.log('🔍 Examining database schema...');

    try {
        // Check users table structure
        console.log('Checking users table...');

        // First check if the users table exists
        const userTableExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'users'
      );
    `);

        if (!userTableExists.rows[0].exists) {
            console.log('❌ Users table does not exist!');
            throw new Error('Users table not found');
        }

        // Check column types and modify if needed
        const columns = await db.execute(sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'users';
    `);

        console.log(`Found ${columns.rows.length} columns in users table`);

        // Check if rsn column exists
        const rsnColumn = columns.rows.find(col => col.column_name === 'rsn');
        if (!rsnColumn) {
            console.log('➕ Adding missing rsn column...');
            await db.execute(sql`
        ALTER TABLE users
        ADD COLUMN rsn text UNIQUE;
      `);
            console.log('✅ Added rsn column');
        } else {
            console.log('✅ rsn column exists');
        }

        // Check if email column exists
        const emailColumn = columns.rows.find(col => col.column_name === 'email');
        if (!emailColumn) {
            console.log('➕ Adding missing email column...');
            await db.execute(sql`
        ALTER TABLE users
        ADD COLUMN email text UNIQUE NOT NULL DEFAULT 'temp@example.com';
      `);

            // Then remove the default constraint
            await db.execute(sql`
        ALTER TABLE users
        ALTER COLUMN email DROP DEFAULT;
      `);

            console.log('✅ Added email column');
        } else {
            console.log('✅ email column exists');
        }

        // Check if name column exists
        const nameColumn = columns.rows.find(col => col.column_name === 'name');
        if (!nameColumn) {
            console.log('➕ Adding missing name column...');
            await db.execute(sql`
        ALTER TABLE users
        ADD COLUMN name text NOT NULL DEFAULT 'Unknown';
      `);

            // Then remove the default constraint
            await db.execute(sql`
        ALTER TABLE users
        ALTER COLUMN name DROP DEFAULT;
      `);

            console.log('✅ Added name column');
        } else {
            console.log('✅ name column exists');
        }

        // Check if email_verified column exists
        const emailVerifiedColumn = columns.rows.find(col => col.column_name === 'email_verified');
        if (!emailVerifiedColumn) {
            console.log('➕ Adding missing email_verified column...');
            await db.execute(sql`
        ALTER TABLE users
        ADD COLUMN email_verified boolean NOT NULL DEFAULT false;
      `);
            console.log('✅ Added email_verified column');
        } else {
            console.log('✅ email_verified column exists');
        }

        // Check if image column exists
        const imageColumn = columns.rows.find(col => col.column_name === 'image');
        if (!imageColumn) {
            console.log('➕ Adding missing image column...');
            await db.execute(sql`
        ALTER TABLE users
        ADD COLUMN image text;
      `);
            console.log('✅ Added image column');
        } else {
            console.log('✅ image column exists');
        }

        // Fix records table if submitter_id has wrong type
        console.log('Checking records table...');

        const recordsSubmitterColumn = await db.execute(sql`
      SELECT data_type 
      FROM information_schema.columns 
      WHERE table_name = 'records' AND column_name = 'submitter_id';
    `);

        if (recordsSubmitterColumn.rows.length > 0) {
            const dataType = recordsSubmitterColumn.rows[0].data_type;

            if (dataType === 'uuid') {
                console.log('🔄 Converting submitter_id from uuid to text in records table...');

                // Drop the foreign key constraint if it exists
                try {
                    await db.execute(sql`
            ALTER TABLE records 
            DROP CONSTRAINT IF EXISTS records_submitter_id_users_id_fk;
          `);
                } catch (e) {
                    console.log('No foreign key constraint to drop');
                }

                // Alter the column type
                await db.execute(sql`
          ALTER TABLE records 
          ALTER COLUMN submitter_id TYPE text;
        `);

                console.log('✅ Converted submitter_id to text type');
            } else {
                console.log('✅ submitter_id already has correct type (text)');
            }
        }

        console.log('✅ Schema repair completed successfully!');
    } catch (error) {
        console.error('❌ Error fixing schema:', error);
    } finally {
        await pool.end();
    }
}

main().catch((err) => {
    console.error('Failed to fix schema:', err);
    process.exit(1);
}); 