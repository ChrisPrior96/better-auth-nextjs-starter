import Link from "next/link";
import Image from "next/image";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, Medal, Trophy } from "lucide-react";

interface Record {
  id: string;
  bossId: string | null;
  completionTime: string;
  teamSize: string;
  status: 'pending' | 'approved' | 'rejected' | null;
  submitterId: string | null;
  screenshotUrl: string;
  createdAt: Date | null;
  updatedAt: Date | null;
  teamMembers: string[];
  boss: {
    id: string;
    name: string;
    imageUrl: string;
  };
  submitter: {
    username: string;
    rsn: string;
  };
}

export function RecordTable({ 
  records, 
  showBoss = false,
  showRank = true,
  emptyMessage = "No records found"
}: { 
  records: Record[];
  showBoss?: boolean;
  showRank?: boolean;
  emptyMessage?: string;
}) {
  if (records.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {showRank && <TableHead className="w-16">Rank</TableHead>}
            {showBoss && <TableHead>Boss</TableHead>}
            <TableHead>Team</TableHead>
            <TableHead>Players</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Proof</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record, index) => (
            <TableRow key={record.id}>
              {showRank && (
                <TableCell className="font-medium">
                  {index === 0 ? (
                    <span className="inline-flex items-center text-yellow-500">
                      <Trophy className="h-4 w-4 mr-1" />
                      1st
                    </span>
                  ) : index === 1 ? (
                    <span className="inline-flex items-center text-gray-400">
                      <Medal className="h-4 w-4 mr-1" />
                      2nd
                    </span>
                  ) : index === 2 ? (
                    <span className="inline-flex items-center text-amber-700">
                      <Medal className="h-4 w-4 mr-1" />
                      3rd
                    </span>
                  ) : (
                    `${index + 1}th`
                  )}
                </TableCell>
              )}
              
              {showBoss && (
                <TableCell>
                  <Link 
                    href={`/bosses/${record.bossId}`}
                    className="font-medium hover:underline"
                  >
                    {record.boss.name}
                  </Link>
                </TableCell>
              )}
              
              <TableCell>
                <Badge variant="outline">{record.teamSize}</Badge>
              </TableCell>
              
              <TableCell>
                <div className="flex flex-col gap-1">
                  <span className="font-medium">{record.submitter.rsn}</span>
                  {record.teamMembers.length > 0 && record.teamMembers.map((member, i) => (
                    <span key={i} className="text-xs text-muted-foreground">
                      + {member}
                    </span>
                  ))}
                </div>
              </TableCell>
              
              <TableCell className="font-bold text-primary">
                {record.completionTime}
              </TableCell>
              
              <TableCell className="text-muted-foreground">
                {record.createdAt ? new Date(record.createdAt).toLocaleDateString() : 'N/A'}
              </TableCell>
              
              <TableCell>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <div className="p-2">
                      <img 
                        src={record.screenshotUrl} 
                        alt="Proof screenshot" 
                        className="w-full rounded-md border"
                      />
                    </div>
                  </DialogContent>
                </Dialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 