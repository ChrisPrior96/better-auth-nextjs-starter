'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod' // For validation
import { getSession } from '@/lib/auth-utils'
import { db } from '@/database/db'
import { records, bosses } from '@/database/schema'
import { eq, desc, sql } from 'drizzle-orm'

// Validation schema
const RecordSchema = z.object({
  bossId: z.string().uuid(),
  completionTime: z.string().regex(/^\d{2}:\d{2}\.\d{3}$/), // MM:SS.ms
  teamSize: z.string(),
  teamMembers: z.array(z.string()),
  screenshotUrl: z.string().url(),
})

// Rate limiting function
async function checkRateLimit(userId: string): Promise<boolean> {
  // TODO: Implement actual rate limiting logic
  // For now, always return true to allow submissions
  return true;
}

export async function submitRecord(formData: FormData) {
  try {
    const session = await getSession();
    if (!session?.user) {
      throw new Error('Unauthorized')
    }

    // Rate limiting check
    const canSubmit = await checkRateLimit(session.user.id)
    if (!canSubmit) {
      throw new Error('Please wait before submitting another record')
    }

    // Validate input
    const validated = RecordSchema.parse({
      bossId: formData.get('bossId'),
      completionTime: formData.get('completionTime'),
      teamSize: formData.get('teamSize'),
      teamMembers: JSON.parse(formData.get('teamMembers') as string),
      screenshotUrl: formData.get('screenshotUrl'),
    })

    const [record] = await db.insert(records).values({
      ...validated,
      submitterId: session.user.id,
      status: 'pending',
    }).returning()

    revalidatePath('/profile/[id]')
    revalidatePath('/dashboard')
    
    return { success: true, record }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

// Fetch recent records with boss info
export async function getRecentRecords(limit = 5) {
  try {
    const { records, bosses } = await import('@/database/schema')
    const { db } = await import('@/database/db')
    const { users } = await import('@/auth-schema')
    
    // Fetch recent approved records
    const recentRecords = await db
      .select({
        id: records.id,
        bossId: records.bossId,
        bossName: bosses.name,
        bossImage: bosses.imageUrl,
        completionTime: records.completionTime,
        teamSize: records.teamSize,
        teamMembers: records.teamMembers,
        status: records.status,
        createdAt: records.createdAt,
      })
      .from(records)
      .innerJoin(bosses, eq(records.bossId, bosses.id))
      .where(eq(records.status, 'approved'))
      .orderBy(desc(records.createdAt))
      .limit(limit)
    
    // Format the data for the UI
    const formattedRecords = await Promise.all(
      recentRecords.map(async (record) => {
        // Get team member names from user IDs
        type Player = {
          id: string;
          name: string;
          avatar: string;
        };
        
        let players: Player[] = [];
        
        try {
          // Parse team members from JSON if needed
          const memberIds = Array.isArray(record.teamMembers) 
            ? record.teamMembers 
            : JSON.parse(record.teamMembers);
            
          // Fetch user details for each member
          const members = await db
            .select({
              id: users.id,
              name: users.rsn,
            })
            .from(users)
            .where(sql`${users.id} IN (${memberIds.join(',')})`)
            
          players = members.map(member => ({
            id: member.id,
            name: member.name || 'Unknown Player',
            avatar: '', // Could add avatar URL if available
          }))
        } catch (e) {
          console.error('Error processing team members:', e)
        }
        
        return {
          id: record.id,
          bossId: record.bossId,
          boss: record.bossName,
          bossImage: record.bossImage,
          teamSize: typeof record.teamSize === 'string' ? parseInt(record.teamSize.match(/\d+/)?.[0] || '1') : 1,
          time: record.completionTime,
          date: record.createdAt?.toISOString().split('T')[0] || '',
          players,
          verified: record.status === 'approved',
        }
      })
    )
    
    return formattedRecords
  } catch (error) {
    console.error('Error fetching recent records:', error)
    return []
  }
}

// Get stats for a specific user
export async function getUserStats(userId: string) {
  try {
    const { records } = await import('@/database/schema')
    const { db } = await import('@/database/db')
    
    // Count total submissions using SQL directly
    const totalSubmissionsQuery = await db.execute(sql`
      SELECT COUNT(*) as count
      FROM records
      WHERE submitter_id = ${userId}
    `)
    
    // Count verified records
    const verifiedRecordsQuery = await db.execute(sql`
      SELECT COUNT(*) as count
      FROM records
      WHERE submitter_id = ${userId} AND status = 'approved'
    `)
    
    // Count pending records
    const pendingRecordsQuery = await db.execute(sql`
      SELECT COUNT(*) as count
      FROM records
      WHERE submitter_id = ${userId} AND status = 'pending'
    `)
    
    // Count top positions (records with fastest times per boss)
    const topPositionsQuery = await db.execute(sql`
      WITH ranked_records AS (
        SELECT
          r.id,
          r.boss_id,
          r.submitter_id,
          r.completion_time,
          RANK() OVER (PARTITION BY r.boss_id, r.team_size ORDER BY r.completion_time ASC) as rank
        FROM records r
        WHERE r.status = 'approved'
      )
      SELECT COUNT(*) as count
      FROM ranked_records
      WHERE submitter_id = ${userId} AND rank = 1
    `)
    
    return {
      totalSubmissions: parseInt(String(totalSubmissionsQuery.rows[0]?.count || 0)),
      verifiedRecords: parseInt(String(verifiedRecordsQuery.rows[0]?.count || 0)),
      pendingRecords: parseInt(String(pendingRecordsQuery.rows[0]?.count || 0)),
      topPositions: parseInt(String(topPositionsQuery.rows[0]?.count || 0)),
    }
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return {
      totalSubmissions: 0,
      verifiedRecords: 0,
      pendingRecords: 0,
      topPositions: 0,
    }
  }
} 