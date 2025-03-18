import Link from "next/link";
import { getBosses } from "@/app/actions/bosses";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Pencil, Trash } from "lucide-react";

export default async function BossesPage() {
  const bosses = await getBosses();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Bosses</h1>
          <p className="text-muted-foreground mt-1">
            Add, edit or remove bosses from the leaderboard
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/bosses/add">
            <PlusCircle className="h-4 w-4 mr-2" />
            Add New Boss
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Bosses</CardTitle>
          <CardDescription>
            A list of all bosses currently in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {bosses.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No bosses found. Add one to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Team Sizes</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bosses.map((boss) => (
                  <TableRow key={boss.id}>
                    <TableCell className="font-medium">{boss.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {boss.allowedTeamSizes.map((size) => (
                          <span 
                            key={size} 
                            className="bg-primary/10 text-primary text-xs rounded-full px-2 py-0.5"
                          >
                            {size}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {boss.createdAt 
                        ? new Date(boss.createdAt).toLocaleDateString() 
                        : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/bosses/edit/${boss.id}`}>
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" className="text-destructive">
                          <Trash className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
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