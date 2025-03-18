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
    <div className="rounded-lg border bg-card text-card-foreground shadow group hover:border-osrs-gold/50 transition h-[280px] flex flex-col">
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-bold truncate max-w-[130px]">{boss.name}</h3>
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
        
        <div className="flex-1 flex justify-center items-center">
          {boss.imageUrl ? (
            <div className="w-24 h-24 overflow-hidden rounded-md bg-black/5 flex items-center justify-center">
              <img 
                src={boss.imageUrl} 
                alt={boss.name} 
                className="max-w-full max-h-full object-contain transition group-hover:scale-105"
              />
            </div>
          ) : (
            <div className="w-24 h-24 rounded-md bg-black/5 flex items-center justify-center">
              <span className="text-muted-foreground">No image</span>
            </div>
          )}
        </div>
        
        <div className="mt-auto pt-3">
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