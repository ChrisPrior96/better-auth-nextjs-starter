"use client"

import { useSession } from "@/hooks/use-auth-hooks"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Shield, Trophy, User, BarChart3, Users, Menu, X, ClipboardCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet"

export function Navigation() {
  const { data: session } = useSession()
  const pathname = usePathname()
  
  // Check if user is an admin
  const isAdmin = session?.user && (session.user as any).role === "admin"
  
  // Define the navigation links
  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: User },
    { href: "/bosses", label: "Bosses", icon: Trophy },
    // { href: "/leaderboard", label: "Leaderboard", icon: BarChart3 },
  ]
  
  // Admin-only links
  const adminLinks = [
    // { href: "/admin/records/pending", label: "Pending Records", icon: ClipboardCheck },
    // { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin", label: "Admin", icon: Shield },
  ]
  
  return (
    <>
      {/* Desktop Navigation */}
      <nav className="ml-4 hidden md:flex items-center space-x-1">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex h-9 items-center gap-1 rounded-md px-3 text-sm font-medium transition-colors hover:bg-accent",
              pathname.startsWith(link.href)
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <link.icon className="h-4 w-4" />
            {link.label}
          </Link>
        ))}
        
        {/* Admin section */}
        {isAdmin && (
          <>
            <div className="mx-2 h-4 w-px bg-border/50" />
            
            {adminLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex h-9 items-center gap-1 rounded-md px-3 text-sm font-medium transition-colors hover:bg-accent",
                  pathname.startsWith(link.href)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
          </>
        )}
      </nav>
      
      {/* Mobile Navigation */}
      <Sheet>
        <SheetTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            aria-label="Open main menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[240px]">
          <div className="flex flex-col space-y-1 py-4">
            {navLinks.map((link) => (
              <SheetClose asChild key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors hover:bg-accent",
                    pathname.startsWith(link.href)
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <link.icon className="h-5 w-5" />
                  {link.label}
                </Link>
              </SheetClose>
            ))}
            
            {/* Admin section for mobile */}
            {isAdmin && (
              <>
                <div className="my-2 h-px w-full bg-border/50" />
                
                <div className="px-3 py-2">
                  <h3 className="text-xs font-medium text-muted-foreground">Admin</h3>
                </div>
                
                {adminLinks.map((link) => (
                  <SheetClose asChild key={link.href}>
                    <Link
                      href={link.href}
                      className={cn(
                        "flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors hover:bg-accent",
                        pathname.startsWith(link.href)
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <link.icon className="h-5 w-5" />
                      {link.label}
                    </Link>
                  </SheetClose>
                ))}
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
} 