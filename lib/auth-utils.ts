import { auth } from "./auth";
import { headers } from "next/headers";

/**
 * Get the current user session from Better Auth
 * This utility function follows Better Auth's recommended pattern
 */
export async function getSession() {
  return auth.api.getSession({
    headers: await headers() // pass headers directly as shown in example
  });
}

/**
 * Check if the current user has admin privileges
 * Returns false if not authenticated or not an admin
 */
export async function isAdmin() {
  try {
    const session = await getSession();
    // Check if user exists and has admin role
    if (!session?.user) return false;
    
    // Access the role property from the user object
    const userRole = (session.user as any).role;
    return userRole === "admin";
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
} 