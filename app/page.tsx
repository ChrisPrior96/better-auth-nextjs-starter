import Link from "next/link";
import Image from "next/image";
import { Trophy, ArrowRight, Shield, Clock, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
    return (
        <div className="flex justify-center w-full">
            <div className="w-full max-w-6xl px-4 py-12 space-y-16">
                {/* Hero Section */}
                <section className="flex flex-col items-center text-center space-y-6">
                    <div className="inline-flex items-center justify-center rounded-full bg-primary/20 px-3 py-1 text-sm font-medium mb-2">
                        <Trophy className="h-4 w-4 mr-1" />
                        <span> The Iron CC</span>
                    </div>
                    
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                        Clan Leaderboards
                    </h1>
                    
                    <p className="text-xl text-muted-foreground max-w-2xl">
                        Track and share your boss completion times with fellow clan members
                    </p>
                    
                    <div className="flex flex-wrap gap-4 justify-center mt-4">
                        <Button size="lg" asChild>
                            <Link href="/dashboard">
                                View Dashboard
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                        
                        <Button variant="outline" size="lg" asChild>
                            <Link href="/bosses">
                                Browse Bosses
                            </Link>
                        </Button>
                    </div>
                </section>

                {/* Features Section */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="flex flex-col items-center text-center p-6 space-y-4 rounded-lg border bg-card">
                        <div className="p-3 rounded-full bg-primary/10">
                            <Trophy className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold">Clan Leaderboards</h3>
                        <p className="text-muted-foreground">
                            View the fastest completion times across different team sizes
                        </p>
                    </div>
                    
                    <div className="flex flex-col items-center text-center p-6 space-y-4 rounded-lg border bg-card">
                        <div className="p-3 rounded-full bg-primary/10">
                            <Shield className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold">Boss Directory</h3>
                        <p className="text-muted-foreground">
                            Access organized records for all tracked OSRS bosses
                        </p>
                    </div>
                    
                    <div className="flex flex-col items-center text-center p-6 space-y-4 rounded-lg border bg-card">
                        <div className="p-3 rounded-full bg-primary/10">
                            <UserCircle className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold">Member Profiles</h3>
                        <p className="text-muted-foreground">
                            View your personal records and compare with other clan members
                        </p>
                    </div>
                </section>

                {/* Access Section */}
                <section className="rounded-lg bg-card p-8 border text-center">
                    <h2 className="text-2xl font-bold mb-4">Iron CC Members</h2>
                    <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                        Sign in with your clan credentials to access the leaderboards and submit your records
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center">
                        <Button size="lg" asChild>
                            <Link href="/auth/login">
                                Sign In
                            </Link>
                        </Button>
                    </div>
                </section>
            </div>
        </div>
    )
}
