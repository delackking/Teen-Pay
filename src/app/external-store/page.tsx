"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, CreditCard, Smartphone } from "lucide-react";

// Hardcoded API Key for the demo (In real life, this would be server-side)
// We need to fetch this or hardcode the one we generated. 
// Since I can't easily fetch it in a client component without a server action, 
// I'll just ask the user to input it or I'll fetch it via a special demo action.
// Let's make a demo action to get the test merchant key.

export default function MerchantStore() {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("");

    // Card Payment State
    const [cardNumber, setCardNumber] = useState("");
    const [cvv, setCvv] = useState("");
    const [expiry, setExpiry] = useState("");
    const [cardError, setCardError] = useState("");

    const handleTeenPayCheckout = async () => {
        setLoading(true);
        try {
            // 1. Get API Key (Demo only)
            const { getTestMerchantKey } = await import("@/app/actions");
            const apiKey = await getTestMerchantKey();

            if (!apiKey) {
                setStatus("Error: No Test Merchant found");
                return;
            }

            // 2. Create Order
            const res = await fetch("/api/v1/orders", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": apiKey,
                },
                body: JSON.stringify({
                    amount: 500,
                    redirectUrl: window.location.origin + "/external-store/success",
                }),
            });

            const data = await res.json();

            if (data.id) {
                // 3. Redirect to Checkout
                window.location.href = `/checkout/${data.id}`;
            } else {
                setStatus("Failed to create order");
            }
        } catch (e) {
            setStatus("Error connecting to Gateway");
        } finally {
            setLoading(false);
        }
    };

    const handleCardPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setCardError("");

        try {
            // 1. Get API Key (Demo only)
            const { getTestMerchantKey } = await import("@/app/actions");
            const apiKey = await getTestMerchantKey();

            // 2. Process Payment
            const res = await fetch("/api/v1/payments/card", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": apiKey || "",
                },
                body: JSON.stringify({
                    amount: 500,
                    cardNumber,
                    cvv,
                    expiryDate: expiry,
                }),
            });

            const data = await res.json();

            if (data.success) {
                window.location.href = "/external-store/success?status=success";
            } else {
                setCardError(data.error || "Payment Failed");
            }
        } catch (e) {
            setCardError("Network Error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans">
            <header className="p-6 border-b flex justify-between items-center">
                <h1 className="text-2xl font-bold text-blue-600">TOY STORE</h1>
                <div className="text-sm text-gray-500">Demo Merchant</div>
            </header>

            <main className="max-w-4xl mx-auto p-8 grid md:grid-cols-2 gap-12">
                {/* Product Section */}
                <div>
                    <div className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center mb-6">
                        <span className="text-6xl">🧸</span>
                    </div>
                    <h2 className="text-3xl font-bold mb-2">Super Cool Teddy</h2>
                    <p className="text-gray-600 mb-4">The best teddy bear in the world. Soft, cuddly, and perfect for kids.</p>
                    <div className="text-2xl font-bold text-blue-600">₹500.00</div>
                </div>

                {/* Checkout Section */}
                <div className="space-y-8">
                    <div className="bg-gray-50 p-6 rounded-xl border">
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                            <Smartphone className="h-5 w-5 text-purple-600" />
                            Pay with Teen Pay
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">Login to your Teen Pay app to approve payment securely.</p>
                        <Button
                            onClick={handleTeenPayCheckout}
                            disabled={loading}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                        >
                            {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                            Checkout with Teen Pay
                        </Button>
                        {status && <p className="text-red-500 text-sm mt-2">{status}</p>}
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-muted-foreground">Or pay with card</span>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-xl border">
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-gray-600" />
                            Pay with Card
                        </h3>
                        <form onSubmit={handleCardPayment} className="space-y-4">
                            <Input
                                placeholder="Card Number"
                                value={cardNumber}
                                onChange={e => setCardNumber(e.target.value)}
                                className="bg-white"
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    placeholder="MM/YY"
                                    value={expiry}
                                    onChange={e => setExpiry(e.target.value)}
                                    className="bg-white"
                                />
                                <Input
                                    placeholder="CVV"
                                    value={cvv}
                                    onChange={e => setCvv(e.target.value)}
                                    className="bg-white"
                                />
                            </div>
                            {cardError && <p className="text-red-500 text-sm">{cardError}</p>}
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gray-900 hover:bg-gray-800 text-white"
                            >
                                {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                                Pay ₹500.00
                            </Button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}
