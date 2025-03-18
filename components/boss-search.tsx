"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface BossSearchProps {
  teamSizes: string[];
}

export function BossSearch({ teamSizes }: BossSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  
  const initialQuery = searchParams.get("query") || "";
  const initialTeamSize = searchParams.get("teamSize") || "";
  
  const [query, setQuery] = useState(initialQuery);
  const [selectedTeamSize, setSelectedTeamSize] = useState(initialTeamSize);

  // Update the URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (query) params.set("query", query);
    if (selectedTeamSize) params.set("teamSize", selectedTeamSize);
    
    startTransition(() => {
      router.push(`/bosses${params.toString() ? `?${params.toString()}` : ""}`);
    });
  }, [query, selectedTeamSize, router]);

  // Toggle team size selection
  const toggleTeamSize = (size: string) => {
    if (selectedTeamSize === size) {
      setSelectedTeamSize("");
    } else {
      setSelectedTeamSize(size);
    }
  };

  // Reset all filters
  const handleReset = () => {
    setQuery("");
    setSelectedTeamSize("");
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search input */}
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search bosses..."
            className="pl-8"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        
        {/* Reset button */}
        {(query || selectedTeamSize) && (
          <Button 
            variant="outline" 
            onClick={handleReset}
            size="icon"
            aria-label="Clear filters"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {/* Team Size Filter */}
      {teamSizes.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-medium">Team Size</h3>
          <div className="flex flex-wrap gap-2">
            {teamSizes.map((size) => (
              <Badge 
                key={size} 
                variant={selectedTeamSize === size ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary/20 transition-colors"
                onClick={() => toggleTeamSize(size)}
              >
                {size.charAt(0).toUpperCase() + size.slice(1)}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 