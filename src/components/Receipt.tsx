"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

interface ReceiptProps {
    amount: number;
    recipientId: string;
    transactionId: string;
    date: string;
}

export function Receipt({ amount, recipientId, transactionId, date }: ReceiptProps) {
    return (
        <Card className="w-full max-w-md mx-auto bg-white text-black overflow-hidden shadow-xl" id="receipt-card">
            <div className="bg-green-500 p-6 text-center text-white">
                <CheckCircle2 className="h-16 w-16 mx-auto mb-2" />
                <h2 className="text-2xl font-bold">Payment Successful</h2>
            </div>
            <CardContent className="p-6 space-y-6">
                <div className="text-center">
                    <p className="text-sm text-gray-500">Paid to</p>
                    <p className="text-xl font-bold">{recipientId}</p>
                    <p className="text-4xl font-bold mt-2">₹{amount}</p>
                </div>

                <div className="space-y-2 border-t pt-4">
                    <div className="flex justify-between">
                        <span className="text-gray-500">Transaction ID</span>
                        <span className="font-mono text-sm">{transactionId}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Date</span>
                        <span>{date}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Status</span>
                        <span className="text-green-600 font-medium">Completed</span>
                    </div>
                </div>

                <div className="text-center pt-4">
                    <p className="text-xs text-gray-400">Teen Pay • Secure Payment</p>
                </div>
            </CardContent>
        </Card>
    );
}
