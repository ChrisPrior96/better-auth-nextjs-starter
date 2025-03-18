import { notFound, redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth-utils";
import { getBosses } from "@/app/actions/bosses";
import { SubmitRecordForm } from "../../components/submit-record-form";

// Metadata
export const metadata = {
  title: "Submit Record | Iron CC Leaderboards",
  description: "Submit your boss completion records for the Iron CC clan leaderboards.",
};

export default async function SubmitRecordPage({
  searchParams,
}: {
  searchParams: { boss?: string };
}) {
  // Get current user session
  const session = await getSession();
  
  // Redirect if not logged in
  if (!session?.user) {
    redirect("/login?callbackUrl=/submit-record");
  }
  
  // Get all bosses for the selection
  const bosses = await getBosses();
  
  // Check if boss ID was provided in URL
  const preselectedBossId = searchParams.boss;
  
  // Verify the boss exists if an ID was provided
  if (preselectedBossId) {
    const bossExists = bosses.some(boss => boss.id === preselectedBossId);
    if (!bossExists) {
      notFound();
    }
  }
  
  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <main className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <Link
            href="/bosses"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Bosses
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Submit Record</h1>
          <p className="text-muted-foreground">
            Submit your boss completion time to be featured on the leaderboard
          </p>
        </div>

        {/* Submission Form */}
        <Card>
          <CardHeader>
            <CardTitle>New Record Submission</CardTitle>
            <CardDescription>
              All submissions are reviewed by moderators before being published
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SubmitRecordForm preselectedBossId={preselectedBossId} bosses={bosses} />
          </CardContent>
        </Card>
        
        {/* Submission Guidelines */}
        <Card>
          <CardHeader>
            <CardTitle>Submission Guidelines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium">Screenshot Requirements</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Your screenshot must clearly show the completion time, all team members, and the boss killed.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium">Time Format</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Enter the completion time in the format MM:SS.ms (e.g., 02:45.300 for 2 minutes, 45 seconds, and 300 milliseconds).
              </p>
            </div>
            
            <div>
              <h3 className="font-medium">Team Members</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Please provide the RuneScape Name (RSN) for each team member who participated in the kill.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
} 