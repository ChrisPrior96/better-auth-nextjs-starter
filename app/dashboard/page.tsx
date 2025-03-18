import Link from "next/link";
import { BossCard } from "@/app/components/boss-card";
import { RecentRecords } from "@/app/components/recent-records";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronRight, PlusCircle, Trophy } from "lucide-react";
import { getBosses } from "../actions/bosses";
import { getSession } from "@/lib/auth-utils";

export default async function DashboardPage() {
  const bosses = await getBosses();
  const session = await getSession();
  const isAuthenticated = !!session?.user;

  return (
    <main className="space-y-12">
      {/* Hero Section */}
      <section className="animate-fadeIn">
        <div className="rounded-lg bg-gradient-to-b from-primary/10 to-background p-8 border border-primary/20">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center rounded-full bg-primary/20 px-3 py-1 text-sm font-medium mb-6">
              <Trophy className="h-4 w-4 mr-1" />
              <span>Speed Leaderboards</span>
            </div>
            
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
              Iron CC Leaderboards
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8">
              Track your clan's fastest boss completion times. Submit your records and climb the rankings!
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              {isAuthenticated ? (
                <Button asChild>
                  <Link href="/submit-record">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Submit Record
                  </Link>
                </Button>
              ) : (
                <Button asChild>
                  <Link href="/auth/login">
                    Sign in to Submit
                  </Link>
                </Button>
              )}
              
              <Button variant="outline" asChild>
                <Link href="/bosses">View All Bosses</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Records Section */}
      <section className="animate-fadeIn">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold tracking-tight">Recent Records</h2>
          <Button variant="link" asChild className="text-primary">
            <Link href="/records">
              View All
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
        
        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="solo">Solo</TabsTrigger>
            <TabsTrigger value="duo">Duo</TabsTrigger>
            <TabsTrigger value="trio">Trio+</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-0">
            <RecentRecords />
          </TabsContent>
          
          <TabsContent value="solo" className="mt-0">
            {/* TODO: Implement filtered records */}
            <div className="text-center py-12 text-muted-foreground">
              Solo records coming soon
            </div>
          </TabsContent>
          
          <TabsContent value="duo" className="mt-0">
            {/* TODO: Implement filtered records */}
            <div className="text-center py-12 text-muted-foreground">
              Duo records coming soon
            </div>
          </TabsContent>
          
          <TabsContent value="trio" className="mt-0">
            {/* TODO: Implement filtered records */}
            <div className="text-center py-12 text-muted-foreground">
              Trio+ records coming soon
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* Bosses Grid */}
      <section className="animate-fadeIn">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold tracking-tight">All Bosses</h2>
          <Button variant="link" asChild className="text-primary">
            <Link href="/bosses">
              View All
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {bosses.length > 0 ? (
            bosses.map((boss) => (
              <BossCard key={boss.id} boss={boss} />
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              No bosses found. Bosses will be added soon.
            </div>
          )}
        </div>
      </section>
    </main>
  );
} 