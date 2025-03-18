'use server'

import { desc, eq, sql, count } from 'drizzle-orm'

// Define interfaces for return types
interface RecordHolder {
  id: string;
  name: string;
  recordCount: number;
}

interface ActiveMember {
  id: string;
  name: string;
  submissionCount: number;
}

interface BossCompletion {
  id: string;
  name: string;
  recordCount: number;
}

// Get top record holders (users with most approved records)
export async function getTopRecordHolders(limit = 3): Promise<RecordHolder[]> {
  try {
    const { records } = await import('@/database/schema')
    const { db } = await import('@/database/db')
    const { users } = await import('@/auth-schema')

    // Query to get users with most records
    const topUsers = await db.execute(sql`
      SELECT 
        u.id, 
        u.rsn, 
        COUNT(r.id) as record_count
      FROM 
        records r
      INNER JOIN 
        users u ON r.submitter_id = u.id
      WHERE 
        r.status = 'approved'
      GROUP BY 
        u.id, u.rsn
      ORDER BY 
        record_count DESC
      LIMIT ${limit}
    `)

    return topUsers.rows.map(user => ({
      id: String(user.id),
      name: user.rsn ? String(user.rsn) : 'Unknown',
      recordCount: parseInt(String(user.record_count))
    }))
  } catch (error) {
    console.error('Error fetching top record holders:', error)
    return []
  }
}

// Get most active members (users with most submissions)
export async function getMostActiveMembers(limit = 3): Promise<ActiveMember[]> {
  try {
    const { records } = await import('@/database/schema')
    const { db } = await import('@/database/db')
    const { users } = await import('@/auth-schema')

    // Query to get users with most submissions
    const activeUsers = await db.execute(sql`
      SELECT 
        u.id, 
        u.rsn, 
        COUNT(r.id) as submission_count
      FROM 
        records r
      INNER JOIN 
        users u ON r.submitter_id = u.id
      GROUP BY 
        u.id, u.rsn
      ORDER BY 
        submission_count DESC
      LIMIT ${limit}
    `)

    return activeUsers.rows.map(user => ({
      id: String(user.id),
      name: user.rsn ? String(user.rsn) : 'Unknown',
      submissionCount: parseInt(String(user.submission_count))
    }))
  } catch (error) {
    console.error('Error fetching most active members:', error)
    return []
  }
}

// Get submission statistics
export async function getSubmissionStats() {
  try {
    const { records } = await import('@/database/schema')
    const { db } = await import('@/database/db')
    
    // Total submissions
    const totalQuery = await db
      .select({ count: sql<number>`count(*)` })
      .from(records)
    
    // This month submissions
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const thisMonthQuery = await db.execute(sql`
      SELECT COUNT(*) as count
      FROM records
      WHERE created_at >= ${firstDayOfMonth.toISOString()}
    `)
    
    // This week submissions
    const firstDayOfWeek = new Date(now)
    firstDayOfWeek.setDate(now.getDate() - now.getDay())
    firstDayOfWeek.setHours(0, 0, 0, 0)
    const thisWeekQuery = await db.execute(sql`
      SELECT COUNT(*) as count
      FROM records
      WHERE created_at >= ${firstDayOfWeek.toISOString()}
    `)
    
    // Pending approval
    const pendingQuery = await db
      .select({ count: sql<number>`count(*)` })
      .from(records)
      .where(eq(records.status, 'pending'))
    
    return {
      total: totalQuery[0]?.count || 0,
      thisMonth: parseInt(String(thisMonthQuery.rows[0]?.count || '0')),
      thisWeek: parseInt(String(thisWeekQuery.rows[0]?.count || '0')),
      pending: pendingQuery[0]?.count || 0
    }
  } catch (error) {
    console.error('Error fetching submission stats:', error)
    return {
      total: 0,
      thisMonth: 0,
      thisWeek: 0,
      pending: 0
    }
  }
}

// Get top boss completions
export async function getTopBossCompletions(limit = 4): Promise<BossCompletion[]> {
  try {
    const { records, bosses } = await import('@/database/schema')
    const { db } = await import('@/database/db')
    
    // Query to get bosses with most records
    const topBosses = await db.execute(sql`
      SELECT 
        b.id, 
        b.name, 
        COUNT(r.id) as record_count
      FROM 
        records r
      INNER JOIN 
        bosses b ON r.boss_id = b.id
      WHERE 
        r.status = 'approved'
      GROUP BY 
        b.id, b.name
      ORDER BY 
        record_count DESC
      LIMIT ${limit}
    `)
    
    return topBosses.rows.map(boss => ({
      id: String(boss.id),
      name: String(boss.name),
      recordCount: parseInt(String(boss.record_count))
    }))
  } catch (error) {
    console.error('Error fetching top boss completions:', error)
    return []
  }
} 