import { ReactNode } from "react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex justify-center w-full">
      <div className="w-full max-w-6xl px-4 py-8">
        {children}
      </div>
    </div>
  );
}
