import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Boss {
  id: string;
  name: string;
  imageUrl: string;
  allowedTeamSizes: string[];
}

export function BossCard({ boss }: { boss: Boss }) {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow group hover:border-osrs-gold/50 transition">
      <div className="p-6 space-y-3">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-bold">{boss.name}</h3>
          <div className="flex flex-wrap gap-1 mt-1">
            {boss.allowedTeamSizes.map((size) => (
              <span 
                key={size} 
                className="bg-primary/10 text-primary text-xs rounded-full px-2 py-0.5"
              >
                {size}
              </span>
            ))}
          </div>
        </div>
        
        {boss.imageUrl && (
          <div className="relative w-full h-32 overflow-hidden rounded-md my-3">
            <img 
              src={boss.imageUrl} 
              alt={boss.name} 
              className="object-cover w-full h-full transition group-hover:scale-105"
            />
          </div>
        )}
        
        <div className="pt-3">
          <Button asChild className="w-full">
            <Link href={`/bosses/${boss.id}`}>
              View Leaderboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
} 