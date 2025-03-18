import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { getBossById, getRecordsByBossId } from "@/app/actions/bosses";
import { RecordTable } from "@/app/components/record-table";
import { getSession } from "@/lib/auth-utils";

interface PageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: PageProps) {
  const boss = await getBossById(params.id);
  
  if (!boss) {
    return {
      title: "Boss Not Found | Iron CC Leaderboards",
      description: "The requested boss could not be found.",
    };
  }
  
  return {
    title: `${boss.name} Leaderboard | Iron CC Leaderboards`,
    description: `View the fastest ${boss.name} completion times for the Iron CC clan.`,
  };
}

export default async function BossPage({ params }: PageProps) {
  const boss = await getBossById(params.id);
  const session = await getSession();
  const isAuthenticated = !!session?.user;
  
  if (!boss) {
    notFound();
  }
  
  const records = await getRecordsByBossId(params.id);
  
  // Group records by team size
  const groupedRecords: Record<string, any[]> = {};
  records.forEach((record: any) => {
    const teamSize = record.teamSize;
    if (!groupedRecords[teamSize]) {
      groupedRecords[teamSize] = [];
    }
    groupedRecords[teamSize].push(record);
  });
  
  // Sort team sizes for tab display (solo, duo, etc.)
  const teamSizes = Object.keys(groupedRecords).sort((a, b) => {
    // Custom sort logic to prioritize "solo", "duo", "trio", etc.
    const order: Record<string, number> = { "solo": 1, "duo": 2, "trio": 3 };
    return (order[a] || 99) - (order[b] || 99);
  });
  
  return (
    <main className="py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <Link 
            href="/bosses" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Bosses
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">{boss.name}</h1>
          <p className="text-muted-foreground mt-1">
            Fastest completion times
          </p>
        </div>

        <div className="flex gap-2">
          {isAuthenticated && (
            <Button asChild>
              <Link href={`/submit-record?boss=${boss.id}`}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Submit Record
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Boss Image */}
      {boss.imageUrl && (
        <div className="relative w-full h-64 overflow-hidden rounded-lg mb-8">
          <img 
            src={boss.imageUrl} 
            alt={boss.name} 
            className="object-cover w-full h-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent"></div>
        </div>
      )}

      {/* Leaderboard Tabs */}
      {teamSizes.length > 0 ? (
        <Tabs defaultValue={teamSizes[0]}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold tracking-tight">Leaderboard</h2>
            <TabsList>
              {teamSizes.map((size) => (
                <TabsTrigger key={size} value={size}>
                  {size.charAt(0).toUpperCase() + size.slice(1)}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          
          {teamSizes.map((size) => (
            <TabsContent key={size} value={size}>
              <RecordTable 
                records={groupedRecords[size]}
                showBoss={false}
                emptyMessage={`No ${size} records found for ${boss.name}`}
              />
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <div className="text-center py-12 border rounded-lg">
          <h2 className="text-2xl font-bold tracking-tight mb-4">Leaderboard</h2>
          <p className="text-muted-foreground">
            No records found for {boss.name}. Be the first to submit!
          </p>
          {isAuthenticated && (
            <Button className="mt-6" asChild>
              <Link href={`/submit-record?boss=${boss.id}`}>
                Submit Record
              </Link>
            </Button>
          )}
        </div>
      )}
    </main>
  );
} 