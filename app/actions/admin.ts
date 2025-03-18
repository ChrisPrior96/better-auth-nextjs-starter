'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/database/db'
import { records } from '@/database/schema'
import { eq, desc } from 'drizzle-orm'
import { getSession, isAdmin } from '@/lib/auth-utils'

// Discord notification function
async function sendDiscordNotification(data: {
  type: string;
  recordId: string;
  userId: string;
}) {
  // TODO: Implement Discord webhook integration
  console.log('Discord notification would be sent:', data);
  return true;
}

export async function approveRecord(recordId: string) {
  try {
    // Check if user is admin
    const isUserAdmin = await isAdmin();
    if (!isUserAdmin) {
      throw new Error('Unauthorized')
    }

    const [updatedRecord] = await db
      .update(records)
      .set({ 
        status: 'approved',
        updatedAt: new Date()
      })
      .where(eq(records.id, recordId))
      .returning()

    if (!updatedRecord) {
      throw new Error('Record not found')
    }

    // Send Discord notification
    if (updatedRecord.submitterId) {
      await sendDiscordNotification({
        type: 'RECORD_APPROVED',
        recordId: updatedRecord.id,
        userId: updatedRecord.submitterId,
      })
    }

    revalidatePath('/admin')
    revalidatePath('/profile/[id]')
    
    return { success: true, record: updatedRecord }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

export async function getUserRecords(userId: string) {
  const userRecords = await db.query.records.findMany({
    where: eq(records.submitterId, userId),
    with: {
      boss: true,
    },
    orderBy: [desc(records.createdAt)]
  })

  return userRecords
} 