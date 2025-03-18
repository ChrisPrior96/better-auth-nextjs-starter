import { ReactNode } from "react";

interface BossesLayoutProps {
  children: ReactNode;
}

export default function BossesLayout({ children }: BossesLayoutProps) {
  return (
    <div className="flex justify-center w-full">
      <div className="w-full max-w-6xl px-4">
        {children}
      </div>
    </div>
  );
} 