import { notFound } from "next/navigation";
import { ArrowLeft, UserCog, Shield, CheckCircle, XCircle, Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { updateUserVerificationStatus } from "@/app/actions/admin";
import { isAdmin } from "@/lib/auth-utils";

// Function to get user by ID
async function getUserById(id: string) {
  try {
    const { db } = await import("@/database/db");
    const { users } = await import("@/auth-schema");
    const { eq } = await import("drizzle-orm");
    
    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
    });
    
    return user;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}

// Status badge component
function UserVerificationBadge({ status }: { status: string | null }) {
  if (!status) return <span className="text-muted-foreground text-xs">Unknown</span>;
  
  switch (status) {
    case 'verified':
      return (
        <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
          <CheckCircle className="h-3.5 w-3.5 mr-1" />
          Verified
        </span>
      );
    case 'rejected':
      return (
        <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
          <XCircle className="h-3.5 w-3.5 mr-1" />
          Rejected
        </span>
      );
    case 'pending':
    default:
      return (
        <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
          <Clock className="h-3.5 w-3.5 mr-1" />
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

export default async function UserDetailsPage({ params }: { params: { id: string } }) {
  // Check if user is admin
  await isAdmin();
  
  const userId = params.id;
  const user = await getUserById(userId);
  
  if (!user) {
    notFound();
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/users">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">User Details</h1>
        </div>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold">{user.name || "No Name"}</CardTitle>
            <CardDescription>{user.email}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center space-x-1">
              {user.role === "admin" ? (
                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-primary/10 text-primary">
                  <Shield className="h-3.5 w-3.5 mr-1" />
                  Admin
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-muted text-muted-foreground">
                  <UserCog className="h-3.5 w-3.5 mr-1" />
                  User
                </span>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">User ID</h3>
                <p className="text-sm mt-1 break-all">{user.id}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                <p className="text-sm mt-1">{user.email}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
                <p className="text-sm mt-1">{user.name || "Not set"}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">RuneScape Name (RSN)</h3>
                <p className="text-sm mt-1">{user.rsn || "Not set"}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Role</h3>
                <p className="text-sm mt-1 capitalize">{user.role}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Joined</h3>
                <p className="text-sm mt-1">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  }) : "Unknown"}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Email Verified</h3>
                <p className="text-sm mt-1">
                  {user.emailVerified 
                    ? (typeof user.emailVerified === 'string' || typeof user.emailVerified === 'object')
                      ? new Date(user.emailVerified as any).toLocaleDateString("en-US", {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : "Yes"
                    : "Not verified"}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Account Verification</h3>
                <div className="flex items-center gap-3 mt-2">
                  <UserVerificationBadge status={user.verification_status} />
                  
                  <div className="flex items-center gap-2">
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
                        </Button>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 