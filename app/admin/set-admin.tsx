"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

// This action will be defined in a server action file
async function setUserAsAdmin(email: string) {
  try {
    const response = await fetch("/api/admin/set-role", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, role: "admin" }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || "Failed to set user as admin");
    }
    
    return { success: true, user: data.user };
  } catch (error) {
    console.error("Error setting admin role:", error);
    return { success: false, error: (error as Error).message };
  }
}

export default function SetAdminPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const result = await setUserAsAdmin(email);
      
      if (result.success) {
        toast.success(`User ${email} is now an admin`);
        setEmail("");
      } else {
        toast.error(`Failed to set admin: ${result.error}`);
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manage Admins</h1>
        <p className="text-muted-foreground mt-1">
          Grant administrator privileges to users
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Set Admin</CardTitle>
          <CardDescription>
            Grant admin privileges to a user by their email address
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <label htmlFor="email" className="text-sm font-medium">
                User Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <p className="text-sm text-muted-foreground">
                Enter the email address of the user you want to make an admin
              </p>
            </div>
            
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Processing..." : "Set as Admin"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 