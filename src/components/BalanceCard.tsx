"use client";

import { useState } from "react";
import { Eye, EyeOff, Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface BalanceCardProps {
    balance: number;
}

export function BalanceCard({ balance }: BalanceCardProps) {
    const [isVisible, setIsVisible] = useState(true);

    return (
        <Card className="relative overflow-hidden border-none bg-gradient-to-br from-primary to-purple-600 text-white shadow-xl">
            <div className="absolute right-0 top-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10 blur-xl" />
            <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-24 w-24 rounded-full bg-black/10 blur-xl" />

            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2 text-white/80">
                        <Wallet className="h-5 w-5" />
                        <span className="text-sm font-medium">Total Balance</span>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-white/80 hover:bg-white/10 hover:text-white"
                        onClick={() => setIsVisible(!isVisible)}
                    >
                        {isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                </div>

                <div className="space-y-1">
                    <h2 className="text-4xl font-bold tracking-tight">
                        {isVisible ? (
                            <>
                                <span className="text-2xl font-medium mr-1">₹</span>
                                {balance.toLocaleString('en-IN')}
                            </>
                        ) : (
                            "••••••"
                        )}
                    </h2>
                    <p className="text-xs text-white/60">Teen Rupees</p>
                </div>
            </CardContent>
        </Card>
    );
}
