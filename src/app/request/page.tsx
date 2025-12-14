"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { requestMoney } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowDownLeft } from "lucide-react";
import Link from "next/link";

export default function RequestPage() {
    const router = useRouter();
    const [payerId, setPayerId] = useState("");
    const [amount, setAmount] = useState("");
    const [note, setNote] = useState("");
    const [status, setStatus] = useState<{ success: boolean; message: string } | null>(null);
    const [loading, setLoading] = useState(false);

    const handleRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!payerId || !amount) return;

        setLoading(true);
        const result = await requestMoney(Number(amount), payerId, note);
        setLoading(false);
        setStatus(result);

        if (result.success) {
            setTimeout(() => {
                router.push("/");
            }, 2000);
        }
    };

    return (
        <div className="min-h-screen bg-background p-4 pb-24">
            <div className="flex items-center mb-6">
                <Link href="/" className="p-2 rounded-full hover:bg-muted">
                    <ArrowLeft className="h-6 w-6" />
                </Link>
                <h1 className="ml-4 text-xl font-bold">Request Money</h1>
            </div>

            <Card className="border-none bg-card/50 backdrop-blur-xl">
                <CardHeader>
                    <CardTitle>Request Details</CardTitle>
                </CardHeader>
                <form onSubmit={handleRequest}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">From (Teen ID)</label>
                            <Input
                                placeholder="dad@teen"
                                value={payerId}
                                onChange={(e) => setPayerId(e.target.value)}
                                className="bg-background/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Amount</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-muted-foreground">₹</span>
                                <Input
                                    type="number"
                                    placeholder="0"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="pl-8 bg-background/50 text-lg font-bold"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Note (Optional)</label>
                            <Input
                                placeholder="For movie tickets..."
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                className="bg-background/50"
                            />
                        </div>

                        {status && (
                            <div className={`p-3 rounded-md text-sm font-medium text-center ${status.success ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                {status.message}
                            </div>
                        )}
                    </CardContent>
                    <div className="p-6 pt-0">
                        <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={!payerId || !amount || loading}>
                            <ArrowDownLeft className="mr-2 h-4 w-4" />
                            {loading ? "Sending Request..." : "Request Now"}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
