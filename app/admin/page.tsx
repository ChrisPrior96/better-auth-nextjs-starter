import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ListPlus, BarChart, ShieldCheck, User } from "lucide-react";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Manage bosses, records, and users
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Bosses</CardTitle>
            <CardDescription>Manage boss records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Add new bosses or edit existing ones
              </p>
              <Button asChild className="w-full">
                <Link href="/admin/bosses/add">
                  <ListPlus className="h-4 w-4 mr-2" />
                  Add New Boss
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Records</CardTitle>
            <CardDescription>Review pending submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Approve or reject record submissions
              </p>
              <Button asChild className="w-full">
                <Link href="/admin/records/pending">
                  <ShieldCheck className="h-4 w-4 mr-2" />
                  Review Records
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Users</CardTitle>
            <CardDescription>Manage user accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Verify users and manage permissions
              </p>
              <Button asChild className="w-full">
                <Link href="/admin/users">
                  <User className="h-4 w-4 mr-2" />
                  Manage Users
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 