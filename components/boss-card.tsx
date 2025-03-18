import Link from "next/link";

interface Boss {
  id: string;
  name: string;
  imageUrl: string;
  allowedTeamSizes: string[];
}

export function BossCard({ boss }: { boss: Boss }) {
  return (
    <Link 
      href={`/bosses/${boss.id}`}
      className="block rounded-xl border bg-card text-card-foreground shadow group hover:border-osrs-gold hover:shadow-md transition-all duration-200 h-[280px] flex flex-col transform hover:-translate-y-1 cursor-pointer"
    >
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex flex-col gap-2 mb-4">
          <h3 className="text-lg font-bold">{boss.name}</h3>
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
        </div>
        
        <div className="flex-1 flex justify-center items-center">
          {boss.imageUrl ? (
            <div className="w-24 h-24 overflow-hidden rounded-md flex items-center justify-center">
              <img 
                src={boss.imageUrl} 
                alt={boss.name} 
                className="max-w-full max-h-full object-contain transition group-hover:scale-110"
              />
            </div>
          ) : (
            <div className="w-24 h-24 rounded-md flex items-center justify-center">
              <span className="text-muted-foreground">No image</span>
            </div>
          )}
        </div>
        
        <p className="text-sm text-primary mt-auto group-hover:text-osrs-gold transition-colors font-medium">
          View leaderboard →
        </p>
      </div>
    </Link>
  );
} 