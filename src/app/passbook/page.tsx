"use client";

import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowDownLeft, ArrowUpRight, Download } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useEffect, useState } from "react";

export default function PassbookPage() {
    const { currentUser } = useAppStore();
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

    if (!currentUser) return null;

    return (
        <div className="min-h-screen bg-background p-4 pb-24">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <Link href="/" className="p-2 rounded-full hover:bg-muted">
                        <ArrowLeft className="h-6 w-6" />
                    </Link>
                    <h1 className="ml-4 text-xl font-bold">Passbook</h1>
                </div>
                <Button variant="outline" size="icon">
                    <Download className="h-4 w-4" />
                </Button>
            </div>

            <Card className="mb-6 bg-gradient-to-r from-gray-900 to-gray-800 border-none text-white">
                <CardContent className="p-6">
                    <p className="text-sm text-gray-400 mb-1">Current Balance</p>
                    <h2 className="text-3xl font-bold">₹{currentUser?.balance.toLocaleString('en-IN')}</h2>
                </CardContent>
            </Card>

            <div className="space-y-4">
                <h3 className="font-semibold text-muted-foreground uppercase text-xs tracking-wider">Transaction History</h3>

                {loading ? (
                    <div className="text-center py-10 text-muted-foreground">Loading history...</div>
                ) : transactions.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">
                        No transactions found
                    </div>
                ) : (
                    transactions.map((tx) => (
                        <Link href={`/payment/${tx.id}`} key={tx.id}>
                            <Card className="border-none bg-card/50 mb-3 hover:bg-card/80 transition-colors">
                                <CardContent className="flex items-center justify-between p-4">
                                    <div className="flex items-center space-x-4">
                                        <div className={`p-2 rounded-full ${tx.receiverId === currentUser.id ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                            {tx.receiverId === currentUser.id ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                                        </div>
                                        <div>
                                            <p className="font-medium">
                                                {tx.senderId === tx.receiverId ? 'Self' : (tx.receiverId === currentUser.id ? tx.sender.name : tx.receiver.name)}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(tx.createdAt).toLocaleDateString()} • {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-bold ${tx.receiverId === currentUser.id ? 'text-green-500' : 'text-foreground'}`}>
                                            {tx.receiverId === currentUser.id ? '+' : '-'}₹{tx.amount}
                                        </p>
                                        <p className="text-xs text-muted-foreground">Success</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}
