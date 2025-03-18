'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod' // For validation
import { getSession } from '@/lib/auth-utils'
import { db } from '@/database/db'
import { records, bosses } from '@/database/schema'
import { eq, desc } from 'drizzle-orm'

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

export async function getRecentRecords(limit = 6) {
  try {
    // Get approved records
    const recentRecords = await db
      .select()
      .from(records)
      .where(eq(records.status, 'approved'))
      .limit(limit)
      .orderBy(desc(records.createdAt));
    
    // Import users table
    const { users } = await import('@/auth-schema');
    
    // Manually fetch related data
    const recordsWithRelations = await Promise.all(
      recentRecords.map(async (record) => {
        // Get the boss data if available
        let boss = null;
        if (record.bossId) {
          const [bossData] = await db
            .select()
            .from(bosses)
            .where(eq(bosses.id, record.bossId))
            .limit(1);
          boss = bossData;
        }
        
        // Fetch real user data from the users table
        let submitter = { username: "unknown", rsn: "unknown" };
        if (record.submitterId) {
          try {
            const [userData] = await db
              .select({
                id: users.id,
                name: users.name,
                rsn: users.rsn
              })
              .from(users)
              .where(eq(users.id, record.submitterId))
              .limit(1);
            
            if (userData) {
              submitter = {
                username: userData.name || "unknown",
                rsn: userData.rsn || userData.name || "unknown player" // Fallback chain for RSN
              };
            }
          } catch (error) {
            console.error('Error fetching user data:', error);
            // Keep default submitter values
          }
        }
        
        return {
          ...record,
          boss,
          submitter
        };
      })
    );
    
    return recordsWithRelations;
  } catch (error) {
    console.error('Error fetching recent records:', error);
    return [];
  }
} 