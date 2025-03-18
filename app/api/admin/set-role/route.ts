import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database/db";
import { isAdmin } from "@/lib/auth-utils";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    // Check if the current user is an admin
    const userIsAdmin = await isAdmin();
    if (!userIsAdmin) {
      return NextResponse.json(
        { error: "Unauthorized. Only admins can access this endpoint." },
        { status: 403 }
      );
    }

    // Parse the request body
    const body = await request.json();
    const { email, role } = body;

    if (!email || !role) {
      return NextResponse.json(
        { error: "Email and role are required" },
        { status: 400 }
      );
    }

    if (role !== "admin" && role !== "user") {
      return NextResponse.json(
        { error: "Role must be either 'admin' or 'user'" },
        { status: 400 }
      );
    }

    // Import users table
    const { users } = await import("@/auth-schema");

    // Check if the user exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!existingUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Update the user's role
    const [updatedUser] = await db
      .update(users)
      .set({ role })
      .where(eq(users.email, email))
      .returning();

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("Error setting user role:", error);
    return NextResponse.json(
      { error: "An error occurred while updating the user role" },
      { status: 500 }
    );
  }
} 