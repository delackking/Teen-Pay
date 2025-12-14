"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowDownLeft } from "lucide-react";
import { useEffect, useState } from "react";

// In a real app, this would fetch data from the server
// For now, we'll just show a placeholder or fetch if we had the data in store
export function PendingRequests() {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const { getPendingRequests } = await import("@/app/actions");
                const data = await getPendingRequests();
                setRequests(data);
            } catch (error) {
                console.error("Failed to fetch requests", error);
            } finally {
                setLoading(false);
            }
        };
        fetchRequests();
    }, []);

    const handleAction = async (requestId: string, action: 'PAY' | 'REJECT') => {
        setProcessingId(requestId);
        try {
            if (action === 'PAY') {
                const pin = prompt("Enter your PIN to pay:");
                if (!pin) {
                    setProcessingId(null);
                    return;
                }
                const { respondToRequest } = await import("@/app/actions");
                const result = await respondToRequest(requestId, 'PAY', pin);
                if (result?.success) {
                    setRequests(requests.filter(r => r.id !== requestId));
                    // Refresh balance if needed, or rely on page refresh/store update
                } else {
                    alert(result?.message || "Transaction failed");
                }
            } else {
                const { respondToRequest } = await import("@/app/actions");
                await respondToRequest(requestId, 'REJECT');
                setRequests(requests.filter(r => r.id !== requestId));
            }
        } catch (error) {
            console.error("Action failed", error);
        } finally {
            setProcessingId(null);
        }
    };

    if (loading || requests.length === 0) return null;

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Pending Requests</h3>
            <div className="space-y-3">
                {requests.map((req) => (
                    <Card key={req.id} className="bg-card/50 backdrop-blur-sm border-l-4 border-l-yellow-500">
                        <CardContent className="flex items-center justify-between p-4">
                            <div>
                                <p className="font-medium">{req.requester.name}</p>
                                <p className="text-xs text-muted-foreground">Requested ₹{req.amount}</p>
                                {req.description && <p className="text-xs text-gray-500 italic">"{req.description}"</p>}
                            </div>
                            <div className="flex space-x-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-red-500 hover:text-red-600"
                                    onClick={() => handleAction(req.id, 'REJECT')}
                                    disabled={!!processingId}
                                >
                                    Reject
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => handleAction(req.id, 'PAY')}
                                    disabled={!!processingId}
                                >
                                    {processingId === req.id ? "..." : "Pay"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
