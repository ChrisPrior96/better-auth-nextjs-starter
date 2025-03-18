import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSession, isAdmin } from "@/lib/auth-utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Users, Database, Home, ListPlus } from "lucide-react";

interface AdminLayoutProps {
  children: ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const session = await getSession();
  const userIsAdmin = await isAdmin();

  // Redirect if user is not authenticated or not an admin
  if (!session?.user || !userIsAdmin) {
    redirect("/auth/login");
  }

  return (
    <div className="flex justify-center w-full">
      <div className="w-full max-w-6xl px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full md:w-64 space-y-2">
            <div className="p-4 border rounded-lg bg-card mb-4">
              <div className="flex items-center gap-2 mb-6">
                <ShieldAlert className="h-5 w-5 text-primary" />
                <h2 className="font-bold">Admin Panel</h2>
              </div>
              
              <nav className="space-y-1">
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link href="/admin">
                    <Home className="h-4 w-4 mr-2" />
                    Dashboard
                  </Link>
                </Button>
                
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link href="/admin/bosses">
                    <Database className="h-4 w-4 mr-2" />
                    Bosses
                  </Link>
                </Button>
                
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link href="/admin/bosses/add">
                    <ListPlus className="h-4 w-4 mr-2" />
                    Add Boss
                  </Link>
                </Button>
                
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link href="/admin/users">
                    <Users className="h-4 w-4 mr-2" />
                    Users
                  </Link>
                </Button>
              </nav>
            </div>
            
            <Button variant="outline" className="w-full" asChild>
              <Link href="/dashboard">
                <Home className="h-4 w-4 mr-2" />
                Back to Site
              </Link>
            </Button>
          </aside>
          
          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
} 