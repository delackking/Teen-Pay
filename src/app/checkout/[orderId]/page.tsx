"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { login, verifyPinAndPay } from "@/app/actions";
import { Loader2, Lock } from "lucide-react";

export default function CheckoutPage() {
    const params = useParams();
    const router = useRouter();
    const orderId = params.orderId as string;

    const [loading, setLoading] = useState(true);
    const [order, setOrder] = useState<any>(null);
    const [user, setUser] = useState<any>(null);

    // Login State
    const [teenId, setTeenId] = useState("");
    const [pin, setPin] = useState("");
    const [loginError, setLoginError] = useState("");

    // Payment State
    const [paymentPin, setPaymentPin] = useState("");
    const [paymentError, setPaymentError] = useState("");
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        // Fetch Order Details
        // In a real app, we'd have a dedicated API to fetch public order info
        // For now, we'll simulate it or add a server action if needed.
        // Let's add a server action to get order details safely.
        fetchOrder();
        checkUser();
    }, [orderId]);

    const fetchOrder = async () => {
        try {
            const res = await fetch(`/api/v1/orders/${orderId}`); // We need to create this endpoint or use action
            // Actually, let's just use a server action for simplicity in this file? 
            // No, let's stick to the plan. I'll create a simple GET endpoint or just fetch from client if I had the endpoint.
            // I haven't created GET /api/v1/orders/[id] yet. 
            // I'll create a server action `getOrderDetails` in this file or actions.ts to keep it simple.

            // Temporary: Call a new action I'll add to actions.ts
            const { getOrderDetails } = await import("@/app/actions");
            const data = await getOrderDetails(orderId);
            if (data) {
                setOrder(data);
            } else {
                setPaymentError("Invalid Order");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const checkUser = async () => {
        const { getCurrentUser } = await import("@/app/actions");
        const currentUser = await getCurrentUser();
        if (currentUser) setUser(currentUser);
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError("");
        const res = await login(teenId, pin);
        if (res.success) {
            setUser(res.user);
        } else {
            setLoginError(res.message || "Login failed");
        }
    };

    const handlePayment = async () => {
        setProcessing(true);
        setPaymentError("");

        try {
            // 1. Verify PIN and Deduct Balance (using existing action but modified for Merchant)
            // We need a specific action for paying an order
            const { payOrder } = await import("@/app/actions");
            const res = await payOrder(orderId, paymentPin);

            if (res.success) {
                // Redirect to success URL
                if (order.redirectUrl) {
                    window.location.href = order.redirectUrl + "?status=success&orderId=" + orderId;
                } else {
                    alert("Payment Successful! (No redirect URL provided)");
                }
            } else {
                setPaymentError(res.message || "Payment failed");
            }
        } catch (e) {
            setPaymentError("Something went wrong");
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-black text-white"><Loader2 className="animate-spin" /></div>;
    }

    if (!order) {
        return <div className="min-h-screen flex items-center justify-center bg-black text-white">Order not found</div>;
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold italic tracking-wider text-purple-500">TEEN PAY</h1>
                    <p className="text-gray-400 text-sm">Secure Payment Gateway</p>
                </div>

                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader className="border-b border-gray-700 pb-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-gray-400">Paying to</p>
                                <CardTitle className="text-xl">{order.merchant.name}</CardTitle>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-400">Amount</p>
                                <div className="text-2xl font-bold">₹{order.amount}</div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        {!user ? (
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div className="text-center text-sm text-gray-400 mb-4">Login with your Teen ID to pay</div>
                                <Input
                                    placeholder="Teen ID (e.g. developer@teen)"
                                    value={teenId}
                                    onChange={e => setTeenId(e.target.value)}
                                    className="bg-gray-700 border-gray-600"
                                />
                                <Input
                                    type="password"
                                    placeholder="PIN"
                                    value={pin}
                                    onChange={e => setPin(e.target.value)}
                                    className="bg-gray-700 border-gray-600"
                                />
                                {loginError && <p className="text-red-400 text-sm">{loginError}</p>}
                                <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
                                    Login
                                </Button>
                            </form>
                        ) : (
                            <div className="space-y-6">
                                <div className="bg-gray-700/50 p-4 rounded-lg flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-gray-400">Paying as</p>
                                        <p className="font-medium">{user.name}</p>
                                        <p className="text-xs text-gray-500">{user.teenId}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-400">Balance</p>
                                        <p className="font-medium text-green-400">₹{user.balance}</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">Enter PIN to Confirm</label>
                                    <Input
                                        type="password"
                                        placeholder="****"
                                        value={paymentPin}
                                        onChange={e => setPaymentPin(e.target.value)}
                                        className="bg-gray-700 border-gray-600 text-center text-lg tracking-widest"
                                        maxLength={4}
                                    />
                                </div>

                                {paymentError && <p className="text-red-400 text-sm text-center">{paymentError}</p>}

                                <Button
                                    onClick={handlePayment}
                                    disabled={processing || !paymentPin}
                                    className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg"
                                >
                                    {processing ? <Loader2 className="animate-spin mr-2" /> : <Lock className="mr-2 h-4 w-4" />}
                                    Pay ₹{order.amount}
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="mt-6 text-center">
                    <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                        <Lock className="h-3 w-3" /> Secured by Teen Pay
                    </p>
                </div>
            </div>
        </div>
    );
}
