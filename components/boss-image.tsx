'use client'

import Image from "next/image";
import { useState } from "react";

interface BossImageProps {
  bossName: string;
  imageUrl?: string;
  size?: number;
}

export function BossImage({ bossName, imageUrl, size = 60 }: BossImageProps) {
  const [error, setError] = useState(false);
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <Image
        src={error || !imageUrl ? "/placeholder.svg" : imageUrl}
        alt={bossName}
        fill
        className="object-contain rounded-md"
        onError={() => setError(true)}
      />
    </div>
  );
} 