import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import { bosses } from './schema';
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

  console.log('⏳ Creating bosses and records tables...');
  
  try {
    // Try to create bosses table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "bosses" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" varchar NOT NULL,
        "image_url" text NOT NULL,
        "allowed_team_sizes" json NOT NULL,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
      );
    `);
    
    // First check the users table to see what type id is
    const userTableInfo = await db.execute(sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'users' AND column_name = 'id';
    `);
    
    console.log('User table ID type:', userTableInfo.rows[0]?.data_type);
    
    // Try to create records table without the foreign key constraint
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "records" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "boss_id" uuid REFERENCES "bosses"("id"),
        "submitter_id" text,
        "completion_time" varchar NOT NULL,
        "team_size" varchar NOT NULL,
        "team_members" json NOT NULL,
        "status" varchar DEFAULT 'pending',
        "screenshot_url" text NOT NULL,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
      );
    `);

    console.log('✅ Tables created successfully!');
    
    // Insert some sample bosses for testing
    await db.insert(bosses).values([
      {
        name: 'Chambers of Xeric',
        imageUrl: 'https://oldschool.runescape.wiki/images/thumb/Chambers_of_Xeric_artwork.jpg/1200px-Chambers_of_Xeric_artwork.jpg',
        allowedTeamSizes: ['solo', 'duo', 'trio', 'team']
      },
      {
        name: 'Theatre of Blood',
        imageUrl: 'https://oldschool.runescape.wiki/images/thumb/Theatre_of_Blood_artwork.jpg/1200px-Theatre_of_Blood_artwork.jpg',
        allowedTeamSizes: ['trio', 'team']
      },
      {
        name: 'Tombs of Amascut',
        imageUrl: 'https://oldschool.runescape.wiki/images/thumb/Tombs_of_Amascut_artwork.jpg/1200px-Tombs_of_Amascut_artwork.jpg',
        allowedTeamSizes: ['solo', 'duo', 'team']
      }
    ]).onConflictDoNothing();
    
    console.log('✅ Sample bosses added!');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
  }
  
  await pool.end();
}

main().catch((err) => {
  console.error('❌ Migration failed!');
  console.error(err);
  process.exit(1);
}); 