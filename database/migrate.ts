import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const db = drizzle(pool);

  console.log('⏳ Running migrations...');
  
  // This will run migrations from the 'drizzle' folder
  await migrate(db, { migrationsFolder: 'drizzle' });
  
  console.log('✅ Migrations completed!');
  
  await pool.end();
}

main().catch((err) => {
  console.error('❌ Migration failed!');
  console.error(err);
  process.exit(1);
}); 