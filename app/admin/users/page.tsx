import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, User, UserPlus, CheckCircle, XCircle, Clock } from "lucide-react";
import { updateUserVerificationStatus } from "@/app/actions/admin";

// Function to get all users
async function getUsers() {
  try {
    // Import users table
    const { users } = await import("@/auth-schema");
    const { db } = await import("@/database/db");
    
    const allUsers = await db.query.users.findMany({
      orderBy: (users, { asc, desc }) => [desc(users.createdAt)],
    });
    
    return allUsers;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

// Status badge component
function UserVerificationBadge({ status }: { status: string | null }) {
  if (!status) return <span className="text-muted-foreground text-xs">Unknown</span>;
  
  switch (status) {
    case 'verified':
      return (
        <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
          <CheckCircle className="h-3 w-3 mr-1" />
          Verified
        </span>
      );
    case 'rejected':
      return (
        <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
          <XCircle className="h-3 w-3 mr-1" />
          Rejected
        </span>
      );
    case 'pending':
    default:
      return (
        <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </span>
      );
  }
}

// Server action wrapper
async function verifyUser(userId: string, action: 'verify' | 'reject') {
  'use server'
  
  const status = action === 'verify' ? 'verified' : 'rejected';
  return updateUserVerificationStatus(userId, status);
}

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Users</h1>
          <p className="text-muted-foreground mt-1">
            View and manage user accounts
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/set-admin">
              <Shield className="h-4 w-4 mr-2" />
              Set Admin
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/users/invite">
              <UserPlus className="h-4 w-4 mr-2" />
              Invite User
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            A list of all users registered in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No users found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>RSN</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Verification</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.rsn || "Not set"}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        user.role === "admin" 
                          ? "bg-primary/10 text-primary" 
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {user.role === "admin" ? (
                          <>
                            <Shield className="h-3 w-3 mr-1" />
                            Admin
                          </>
                        ) : "User"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <UserVerificationBadge status={user.verification_status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {user.verification_status !== 'verified' && (
                          <form action={async () => {
                            'use server'
                            await verifyUser(user.id, 'verify');
                          }}>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 border-green-200"
                              type="submit"
                            >
                              <CheckCircle className="h-3.5 w-3.5 mr-1" />
                              Verify
                            </Button>
                          </form>
                        )}
                        
                        {user.verification_status !== 'rejected' && (
                          <form action={async () => {
                            'use server'
                            await verifyUser(user.id, 'reject');
                          }}>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-red-200"
                              type="submit"
                            >
                              <XCircle className="h-3.5 w-3.5 mr-1" />
                              Reject
                            </Button>
                          </form>
                        )}
                        
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/users/${user.id}`}>
                            <User className="h-4 w-4 mr-1" />
                            Details
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 