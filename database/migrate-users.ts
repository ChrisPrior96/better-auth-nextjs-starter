import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import { sql } from 'drizzle-orm';

dotenv.config();

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const db = drizzle(pool);

  console.log('⏳ Checking user table structure...');
  
  try {
    // First check if the rsn column exists
    const userTableInfo = await db.execute(sql`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'users' AND column_name = 'rsn';
    `);
    
    if (userTableInfo.rows.length === 0) {
      console.log('Adding missing "rsn" column to users table...');
      
      // Add the missing column
      await db.execute(sql`
        ALTER TABLE "users" 
        ADD COLUMN IF NOT EXISTS "rsn" text UNIQUE;
      `);
      
      console.log('✅ Added "rsn" column to users table');
    } else {
      console.log('✅ "rsn" column already exists');
    }
    
    // Check if email column exists
    const emailColumnInfo = await db.execute(sql`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'users' AND column_name = 'email';
    `);
    
    if (emailColumnInfo.rows.length === 0) {
      console.log('Adding missing "email" column to users table...');
      
      // Add the missing column
      await db.execute(sql`
        ALTER TABLE "users" 
        ADD COLUMN IF NOT EXISTS "email" text UNIQUE;
      `);
      
      console.log('✅ Added "email" column to users table');
    } else {
      console.log('✅ "email" column already exists');
    }
    
    // Update name column to have NOT NULL constraint if it doesn't exist
    await db.execute(sql`
      ALTER TABLE "users" 
      ALTER COLUMN "name" SET NOT NULL;
    `);
    
    console.log('✅ Schema update complete!');
  } catch (error) {
    console.error('❌ Error updating schema:', error);
  }
  
  await pool.end();
}

main().catch((err) => {
  console.error('❌ Migration failed!');
  console.error(err);
  process.exit(1);
}); 