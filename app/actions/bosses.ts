'use server'

import { db } from '@/database/db'
import { bosses } from '@/database/schema'
import { asc, desc, like } from 'drizzle-orm'
import { records } from '@/database/schema'
import { eq, and } from 'drizzle-orm'

export async function getBosses(query?: string, teamSize?: string) {
  try {
    // Get all bosses first
    const allBosses = await db.query.bosses.findMany({
      orderBy: [asc(bosses.name)]
    });
    
    // Filter in memory based on query and teamSize
    let filteredBosses = allBosses;
    
    // Filter by name query
    if (query) {
      const lowerQuery = query.toLowerCase();
      filteredBosses = filteredBosses.filter(
        boss => boss.name.toLowerCase().includes(lowerQuery)
      );
    }
    
    // Filter by team size
    if (teamSize) {
      filteredBosses = filteredBosses.filter(
        boss => boss.allowedTeamSizes && boss.allowedTeamSizes.includes(teamSize)
      );
    }
    
    return filteredBosses;
  } catch (error) {
    console.error('Error fetching bosses:', error)
    return []
  }
}

// Get all unique team sizes from all bosses
export async function getAllTeamSizes() {
  try {
    const allBosses = await db.query.bosses.findMany();
    
    // Extract and flatten all team sizes
    const allTeamSizes = allBosses.flatMap(boss => boss.allowedTeamSizes || []);
    
    // Get unique values and sort them
    const uniqueTeamSizes = [...new Set(allTeamSizes)].sort((a, b) => {
      // Custom sort logic for team sizes (solo, duo, trio, etc.)
      const order = { "solo": 1, "duo": 2, "trio": 3 };
      return (order[a as keyof typeof order] || 99) - (order[b as keyof typeof order] || 99);
    });
    
    return uniqueTeamSizes;
  } catch (error) {
    console.error('Error fetching team sizes:', error);
    return [];
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