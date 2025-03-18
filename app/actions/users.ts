'use server'

import { isAdmin } from "@/lib/auth-utils"
import { sql } from "drizzle-orm"

// Define type to match component expectation
export type UserWithRsn = {
  id: string;
  rsn: string;
}

export async function getAllUsersWithRsn(): Promise<UserWithRsn[]> {
  try {
    // Import users table
    const { users } = await import('@/auth-schema')
    const { db } = await import('@/database/db')
    
    // Get all users with RSN set
    const usersWithRsn = await db
      .select({
        id: users.id,
        rsn: users.rsn
      })
      .from(users)
      .where(
        // Only get users who have RSN set
        sql`${users.rsn} IS NOT NULL`
      )
    
    // Filter out null RSNs and cast to correct type
    return usersWithRsn
      .filter((user): user is UserWithRsn => 
        user.rsn !== null && user.rsn !== ''
      );
  } catch (error) {
    console.error('Error fetching users with RSN:', error)
    return []
  }
} 