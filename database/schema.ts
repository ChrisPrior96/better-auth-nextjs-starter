export * from "@/auth-schema"

import { 
    pgTable, 
    text, 
    timestamp, 
    varchar, 
    uuid,
    json
  } from 'drizzle-orm/pg-core'
  
  
  export const bosses = pgTable('bosses', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name').notNull(),
    imageUrl: text('image_url').notNull(),
    allowedTeamSizes: json('allowed_team_sizes').$type<string[]>().notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  })
  
  export const records = pgTable('records', {
    id: uuid('id').primaryKey().defaultRandom(),
    bossId: uuid('boss_id').references(() => bosses.id),
    submitterId: text('submitter_id'),
    completionTime: varchar('completion_time').notNull(), // MM:SS.ms format
    teamSize: varchar('team_size').notNull(),
    teamMembers: json('team_members').$type<string[]>().notNull(),
    status: varchar('status', { 
      enum: ['pending', 'approved', 'rejected'] 
    }).default('pending'),
    screenshotUrl: text('screenshot_url').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  }) 