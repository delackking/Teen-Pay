"use client";

import { Suspense } from "react";
import { useSearchParams, useParams } from "next/navigation";
import { Receipt } from "@/components/Receipt";
import { Button } from "@/components/ui/button";
import { Download, Home } from "lucide-react";
import Link from "next/link";
import html2canvas from "html2canvas";

function ReceiptContent() {
    const params = useParams();
    const searchParams = useSearchParams();

    const transactionId = params.id as string;
    const amount = Number(searchParams.get("amount"));
    const recipientId = searchParams.get("to") || "Unknown";
    const date = new Date().toLocaleString();

    const handleDownload = async () => {
        const element = document.getElementById("receipt-card");
        if (element) {
            const canvas = await html2canvas(element);
            const data = canvas.toDataURL("image/png");
            const link = document.createElement("a");
            link.href = data;
            link.download = `receipt-${transactionId}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <div className="min-h-screen bg-background p-4 flex flex-col items-center justify-center space-y-8">
            <Receipt
                amount={amount}
                recipientId={recipientId}
                transactionId={transactionId}
                date={date}
            />

            <div className="flex space-x-4 w-full max-w-md">
                <Link href="/" className="flex-1">
                    <Button variant="outline" className="w-full">
                        <Home className="mr-2 h-4 w-4" />
                        Home
                    </Button>
                </Link>
                <Button onClick={handleDownload} className="flex-1">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                </Button>
            </div>
        </div>
    );
}

export default function PaymentSuccessPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ReceiptContent />
        </Suspense>
    );
}
