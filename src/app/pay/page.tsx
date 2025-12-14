"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyPinAndPay } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Send } from "lucide-react";
import Link from "next/link";
import { PinModal } from "@/components/PinModal";
import { useAppStore } from "@/lib/store";

function SendMoneyForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialRecipient = searchParams.get("recipient") || "";

    const [recipientId, setRecipientId] = useState(initialRecipient);
    const [amount, setAmount] = useState("");
    const [note, setNote] = useState("");
    const [status, setStatus] = useState<{ success: boolean; message: string } | null>(null);
    const [isPinModalOpen, setIsPinModalOpen] = useState(false);

    const handleSendClick = (e: React.FormEvent) => {
        e.preventDefault();
        if (!recipientId || !amount) return;
        setIsPinModalOpen(true);
    };

    const handleConfirmPayment = async (pin: string) => {
        setIsPinModalOpen(false);
        const result = await verifyPinAndPay(Number(amount), recipientId, note, pin);
        setStatus(result);

        if (result.success) {
            // Update local store with new balance
            try {
                const { getCurrentUser } = await import("@/app/actions");
                const user = await getCurrentUser();
                if (user) {
                    // @ts-ignore
                    useAppStore.getState().setCurrentUser(user);
                }
            } catch (e) {
                console.error("Failed to update balance", e);
            }

            // Generate a mock transaction ID for now since action doesn't return it yet
            // Ideally action should return the transaction object
            const mockTxId = Math.random().toString(36).substring(7);
            setTimeout(() => {
                router.push(`/payment/${mockTxId}?amount=${amount}&to=${recipientId}`);
            }, 1000);
        }
    };

    return (
        <>
            <Card className="border-none bg-card/50 backdrop-blur-xl">
                <CardHeader>
                    <CardTitle>Payment Details</CardTitle>
                </CardHeader>
                <form onSubmit={handleSendClick}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">To (Teen ID)</label>
                            <Input
                                placeholder="friend@teen"
                                value={recipientId}
                                onChange={(e) => setRecipientId(e.target.value)}
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
                                placeholder="For pizza..."
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
                        <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={!recipientId || !amount}>
                            <Send className="mr-2 h-4 w-4" />
                            Pay Now
                        </Button>
                    </div>
                </form>
            </Card>

            <PinModal
                isOpen={isPinModalOpen}
                onClose={() => setIsPinModalOpen(false)}
                onConfirm={handleConfirmPayment}
                amount={Number(amount)}
                recipientId={recipientId}
            />
        </>
    );
}

export default function SendMoneyPage() {
    return (
        <div className="min-h-screen bg-background p-4 pb-24">
            <div className="flex items-center mb-6">
                <Link href="/" className="p-2 rounded-full hover:bg-muted">
                    <ArrowLeft className="h-6 w-6" />
                </Link>
                <h1 className="ml-4 text-xl font-bold">Send Money</h1>
            </div>
            <Suspense fallback={<div>Loading...</div>}>
                <SendMoneyForm />
            </Suspense>
        </div>
    );
}
