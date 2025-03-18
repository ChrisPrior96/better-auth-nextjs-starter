import Link from "next/link";
import { BossCard } from "@/app/components/boss-card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Shield, Filter } from "lucide-react";
import { getBosses } from "../actions/bosses";
import { getSession } from "@/lib/auth-utils";

export const metadata = {
  title: "All Bosses | Iron CC Leaderboards",
  description: "View all bosses and their leaderboards for the Iron CC clan.",
};

export default async function BossesPage() {
  const bosses = await getBosses();
  const session = await getSession();
  const isAuthenticated = !!session?.user;

  return (
    <main className="py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <Link 
            href="/dashboard" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">All Bosses</h1>
          <p className="text-muted-foreground mt-1">
            Select a boss to view its leaderboard
          </p>
        </div>

        <div className="flex gap-2">
          {isAuthenticated && (
            <Button asChild>
              <Link href="/submit-record">Submit Record</Link>
            </Button>
          )}
          
          <Button variant="outline" className="gap-1">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>
      </div>

      {/* Bosses Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {bosses.length > 0 ? (
          bosses.map((boss) => (
            <BossCard key={boss.id} boss={boss} />
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-xl font-semibold mb-2">No bosses found</p>
            <p className="text-sm text-muted-foreground">
              Boss data will be added soon.
            </p>
          </div>
        )}
      </div>
    </main>
  );
} 