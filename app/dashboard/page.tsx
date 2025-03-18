import Link from "next/link";
import { 
  ChevronRight, 
  Clock, 
  Trophy, 
  Users, 
  PlusCircle, 
  Activity, 
  BarChart, 
  Medal 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BossImage } from "@/components/boss-image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getBosses } from "../actions/bosses";
import { getSession } from "@/lib/auth-utils";
import { getRecentRecords, getUserStats } from "../actions/records";
import { 
  getTopRecordHolders,
  getMostActiveMembers,
  getSubmissionStats,
  getTopBossCompletions
} from "../actions/stats";

export default async function DashboardPage() {
  // Get all data from the database
  const bosses = await getBosses();
  const session = await getSession();
  const isAuthenticated = !!session?.user;
  
  // Fetch recent records from database
  const recentRecords = await getRecentRecords(8);
  
  // Fetch clan stats data
  const topRecordHolders = await getTopRecordHolders();
  const mostActiveMembers = await getMostActiveMembers();
  const submissionStats = await getSubmissionStats();
  const topBossCompletions = await getTopBossCompletions();
  
  // Fetch user stats if authenticated
  const userStats = isAuthenticated && session.user.id 
    ? await getUserStats(session.user.id)
    : {
        totalSubmissions: 0,
        verifiedRecords: 0,
        pendingRecords: 0,
        topPositions: 0,
      };

  // Helper function to get initials from name
  const getInitials = (name: string) => {
    return name.split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Add debug logging
  console.log("Recent records data:", recentRecords);

  return (
    <div className="container mx-auto max-w-7xl px-4 pt-4 pb-8">
      {/* <div className="mb-8 flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome to the Iron CC Leaderboards. View recent records and navigate to boss leaderboards.
        </p>
      </div> */}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Top Record Holders Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <CardTitle className="text-base">Top Record Holders</CardTitle>
        </div>
            </CardHeader>
            <CardContent>
            <div className="space-y-3">
              {topRecordHolders.length > 0 ? (
                topRecordHolders.map((holder) => (
                  <div key={holder.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                      <span className="font-medium">{holder.name}</span>
                    </div>
                    <Badge>{holder.recordCount} Records</Badge>
                </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground">No record holders yet</div>
              )}
              </div>
            </CardContent>
          </Card>
          
        {/* Most Active Members Card */}
          <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              <CardTitle className="text-base">Most Active Members</CardTitle>
            </div>
            </CardHeader>
            <CardContent>
            <div className="space-y-3">
              {mostActiveMembers.length > 0 ? (
                mostActiveMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                      <span className="font-medium">{member.name}</span>
                    </div>
                    <Badge variant="outline">{member.submissionCount} Submissions</Badge>
                </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground">No active members yet</div>
              )}
              </div>
            </CardContent>
          </Card>
          
        {/* Submission Stats Card */}
          <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <BarChart className="h-5 w-5 text-green-500" />
              <CardTitle className="text-base">Submission Stats</CardTitle>
            </div>
            </CardHeader>
            <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Total Submissions</span>
                <span className="font-bold">{submissionStats.total}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">This Month</span>
                <span className="font-bold">{submissionStats.thisMonth}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">This Week</span>
                <span className="font-bold">{submissionStats.thisWeek}</span>
                </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Pending Approval</span>
                <span className="font-bold">{submissionStats.pending}</span>
              </div>
              </div>
            </CardContent>
          </Card>
          
        {/* Top Boss Completions Card */}
          <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Medal className="h-5 w-5 text-purple-500" />
              <CardTitle className="text-base">Top Boss Completions</CardTitle>
            </div>
            </CardHeader>
            <CardContent>
            <div className="space-y-3">
              {topBossCompletions.length > 0 ? (
                topBossCompletions.map((boss) => (
                  <div key={boss.id} className="flex items-center justify-between">
                    <span className="text-sm">{boss.name}</span>
                    <span className="font-bold">{boss.recordCount} Records</span>
                </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground">No boss completions yet</div>
              )}
              </div>
            </CardContent>
          </Card>

      {/* Recent Records Section */}
        <Card className="col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Records</CardTitle>
              <CardDescription>The latest verified record submissions</CardDescription>
            </div>
            {isAuthenticated && (
              <Button asChild>
                <Link href="/submit-record">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Submit Record
            </Link>
          </Button>
            )}
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="mb-4 grid w-full grid-cols-3">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="solo">Solo</TabsTrigger>
                <TabsTrigger value="team">Team</TabsTrigger>
          </TabsList>
              <TabsContent value="all" className="space-y-4">
                {recentRecords.length > 0 ? (
                  recentRecords.map((record) => (
                    <div
                      key={record.id}
                      className="flex flex-col gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{record.boss}</h3>
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {record.teamSize}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm text-muted-foreground">Players:</span>
                          <div className="flex flex-wrap items-center gap-1">
                            {record.players.length > 0 ? record.players.map((player, index) => (
                              <span key={index} className="text-sm font-medium">
                                {player.name}
                                {index < record.players.length - 1 ? "," : ""}
                              </span>
                            )) : (
                              <span className="text-sm">Unknown</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="font-mono font-bold">{record.time}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{record.date}</span>
                        </div>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/bosses/${record.bossId}`}>
                            <ChevronRight className="h-4 w-4" />
                            <span className="sr-only">View details</span>
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No records found. Be the first to submit one!
                  </div>
                )}
              </TabsContent>
              <TabsContent value="solo" className="space-y-4">
                {recentRecords.filter(record => record.teamSize === 1).length > 0 ? (
                  recentRecords
                    .filter((record) => record.teamSize === 1)
                    .map((record) => (
                      <div
                        key={record.id}
                        className="flex flex-col gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{record.boss}</h3>
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {record.teamSize}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm text-muted-foreground">Player:</span>
                            <span className="text-sm font-medium">
                              {record.players[0]?.name || "Unknown player"}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col items-end">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="font-mono font-bold">{record.time}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">{record.date}</span>
                          </div>
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/bosses/${record.bossId}`}>
                              <ChevronRight className="h-4 w-4" />
                              <span className="sr-only">View details</span>
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No solo records found.
                  </div>
                )}
              </TabsContent>
              <TabsContent value="team" className="space-y-4">
                {recentRecords.filter(record => record.teamSize > 1).length > 0 ? (
                  recentRecords
                    .filter((record) => record.teamSize > 1)
                    .map((record) => (
                      <div
                        key={record.id}
                        className="flex flex-col gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{record.boss}</h3>
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {record.teamSize}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm text-muted-foreground">Players:</span>
                            <div className="flex flex-wrap items-center gap-1">
                              {record.players.map((player, index) => (
                                <span key={index} className="text-sm font-medium">
                                  {player.name}
                                  {index < record.players.length - 1 ? "," : ""}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col items-end">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="font-mono font-bold">{record.time}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">{record.date}</span>
                          </div>
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/bosses/${record.bossId}`}>
                              <ChevronRight className="h-4 w-4" />
                              <span className="sr-only">View details</span>
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No team records found.
                  </div>
                )}
          </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* User Stats Card */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Your Stats</CardTitle>
            <CardDescription>Your personal record submissions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Submissions</span>
              <span className="font-bold">{userStats.totalSubmissions}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Verified Records</span>
              <span className="font-bold">{userStats.verifiedRecords}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Top Positions</span>
              <span className="font-bold">{userStats.topPositions}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Pending Approval</span>
              <span className="font-bold">{userStats.pendingRecords}</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link href={isAuthenticated ? "/profile" : "/login"}>
                {isAuthenticated ? "View Profile" : "Login to Track Records"}
            </Link>
          </Button>
          </CardFooter>
        </Card>

        {/* Popular Bosses Card */}
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle>Popular Bosses</CardTitle>
            <CardDescription>Quick access to the most viewed leaderboards</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-6">
              {bosses.slice(0, 4).map((boss) => (
                <Link
                  key={boss.id}
                  href={`/bosses/${boss.id}`}
                  className="flex flex-col items-center gap-3 rounded-lg border p-6 text-center transition-colors hover:bg-muted/50"
                >
                  <BossImage 
                    bossName={boss.name} 
                    imageUrl={boss.imageUrl} 
                    size={80} 
                  />
                  <span className="text-sm font-medium">{boss.name}</span>
                </Link>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/bosses">View All Bosses</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
        </div>
  );
} 