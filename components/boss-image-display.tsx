// components/boss-image-display.tsx
"use client";

import { useState } from "react";
import { CldImage } from "next-cloudinary";

export function BossImageDisplay({ imageUrl, bossName }: { imageUrl: string, bossName: string }) {
  const [isCloudinaryUrl] = useState(() => imageUrl.includes('cloudinary.com'));
  const [imgError, setImgError] = useState(false);

  if (isCloudinaryUrl && !imgError) {
    try {
      const publicId = imageUrl.split('/upload/')[1] || '';
      return (
        <CldImage
          src={publicId}
          width={300}
          height={300}
          alt={bossName}
          crop="fill"
          className="object-contain w-full h-full rounded-lg"
          onError={() => setImgError(true)}
        />
      );
    } catch (error) {
      return (
        <img 
          src={imageUrl} 
          alt={bossName} 
          className="object-contain w-full h-full"
          onError={() => setImgError(true)}
        />
      );
    }
  }
  
  return (
    <img 
      src={imageUrl} 
      alt={bossName} 
      className="object-contain w-full h-full"
      onError={() => setImgError(true)}
    />
  );
}