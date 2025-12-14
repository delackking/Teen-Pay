"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";

export function RecentTransactions() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const { getTransactions } = await import("@/app/actions");
                const data = await getTransactions();
                setTransactions(data);
            } catch (error) {
                console.error("Failed to fetch transactions", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTransactions();
    }, []);

    if (loading) {
        return <div className="text-center text-muted-foreground py-4">Loading transactions...</div>;
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Recent Transactions</h3>
            <div className="space-y-3">
                {transactions.length === 0 ? (
                    <Card className="bg-muted/50 border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                            <p>No transactions yet</p>
                            <p className="text-xs">Start by sending money to a friend!</p>
                        </CardContent>
                    </Card>
                ) : (
                    transactions.slice(0, 5).map((tx) => (
                        <Card key={tx.id} className="bg-card/50 backdrop-blur-sm border-white/5">
                            <CardContent className="flex items-center justify-between p-4">
                                <div className="flex items-center space-x-4">
                                    <Avatar className="h-10 w-10 border border-white/10">
                                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                            {tx.receiver?.name?.charAt(0) || tx.sender?.name?.charAt(0) || '?'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium">
                                            {tx.senderId === tx.receiverId ? 'Self' : (tx.receiver ? tx.receiver.name : 'Unknown')}
                                        </p>
                                        <p className="text-xs text-muted-foreground">{new Date(tx.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className={`font-bold ${tx.type === 'CREDIT' ? 'text-green-500' : 'text-white'}`}>
                                    {/* We need to determine if it's credit or debit based on current user, but for now let's just show amount */}
                                    ₹{tx.amount}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
