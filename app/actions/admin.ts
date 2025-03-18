'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/database/db'
import { records, bosses } from '@/database/schema'
import { eq, desc } from 'drizzle-orm'
import { getSession, isAdmin } from '@/lib/auth-utils'
import { z } from 'zod'

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

// Boss validation schema
const BossSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  imageUrl: z.string().url("Please enter a valid image URL"),
  allowedTeamSizes: z.array(z.string()).min(1, "Select at least one team size")
});

export type BossFormData = z.infer<typeof BossSchema>;

// User verification schema
const UserVerificationSchema = z.object({
  userId: z.string(),
  status: z.enum(['pending', 'verified', 'rejected'])
});

export async function updateUserVerificationStatus(userId: string, status: 'pending' | 'verified' | 'rejected') {
  try {
    // Check if user is admin
    const isUserAdmin = await isAdmin();
    if (!isUserAdmin) {
      throw new Error('Unauthorized')
    }

    // Import users table
    const { users } = await import("@/auth-schema");

    // Update the user's verification status
    const [updatedUser] = await db
      .update(users)
      .set({ 
        verification_status: status,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();

    if (!updatedUser) {
      throw new Error('User not found')
    }

    // Send Discord notification if user was verified
    if (status === 'verified') {
      // You can use your notification system here
      console.log(`User ${updatedUser.id} (${updatedUser.name}) was verified`);
    }

    // Revalidate pages that might show this user
    revalidatePath('/admin/users')
    revalidatePath(`/admin/users/${userId}`)
    revalidatePath('/profile/[id]')
    
    return { success: true, user: updatedUser }
  } catch (error) {
    console.error('Error updating user verification status:', error);
    return { success: false, error: (error as Error).message }
  }
}

export async function createBoss(formData: FormData) {
  try {
    // Check if user is admin
    const isUserAdmin = await isAdmin();
    if (!isUserAdmin) {
      throw new Error('Unauthorized')
    }

    // Validate input
    const validated = BossSchema.parse({
      name: formData.get('name'),
      imageUrl: formData.get('imageUrl'),
      allowedTeamSizes: JSON.parse(formData.get('allowedTeamSizes') as string),
    });

    // Create the boss
    const [newBoss] = await db.insert(bosses)
      .values({
        name: validated.name,
        imageUrl: validated.imageUrl,
        allowedTeamSizes: validated.allowedTeamSizes,
      })
      .returning();

    // Revalidate paths that may show bosses
    revalidatePath('/admin/bosses');
    revalidatePath('/bosses');
    revalidatePath('/dashboard');
    
    return { success: true, boss: newBoss };
  } catch (error) {
    console.error('Error creating boss:', error);
    return { 
      success: false, 
      error: error instanceof z.ZodError 
        ? error.errors.map(e => `${e.path}: ${e.message}`).join(', ')
        : (error as Error).message 
    };
  }
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