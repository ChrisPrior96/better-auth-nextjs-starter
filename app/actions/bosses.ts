'use server'

import { db } from '@/database/db'
import { bosses } from '@/database/schema'
import { asc, desc } from 'drizzle-orm'
import { records } from '@/database/schema'
import { eq, and } from 'drizzle-orm'

export async function getBosses() {
  try {
    const bossesData = await db.query.bosses.findMany({
      orderBy: [asc(bosses.name)]
    })
    
    return bossesData
  } catch (error) {
    console.error('Error fetching bosses:', error)
    return []
  }
}

export async function getBossById(id: string) {
  try {
    const boss = await db.query.bosses.findFirst({
      where: (bosses, { eq }) => eq(bosses.id, id)
    })
    
    return boss
  } catch (error) {
    console.error(`Error fetching boss with id ${id}:`, error)
    return null
  }
}

export async function getRecordsByBossId(bossId: string, teamSize?: string) {
  try {
    // Fetch records with proper where conditions
    let recordsList;
    if (teamSize) {
      recordsList = await db.select()
        .from(records)
        .where(
          and(
            eq(records.bossId, bossId),
            eq(records.status, 'approved'),
            eq(records.teamSize, teamSize)
          )
        )
        .orderBy(desc(records.completionTime));
    } else {
      recordsList = await db.select()
        .from(records)
        .where(
          and(
            eq(records.bossId, bossId),
            eq(records.status, 'approved')
          )
        )
        .orderBy(desc(records.completionTime));
    }
    
    // Fetch boss for each record
    const boss = await getBossById(bossId);
    
    // Return records with boss data
    return recordsList.map(record => ({
      ...record,
      boss,
      submitter: { username: "user", rsn: "Player" } // Placeholder
    }));
  } catch (error) {
    console.error(`Error fetching records for boss ${bossId}:`, error);
    return [];
  }
} 