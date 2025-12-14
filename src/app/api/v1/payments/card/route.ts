import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
    try {
        const apiKey = req.headers.get("x-api-key");
        if (!apiKey) {
            return NextResponse.json({ error: "Missing API Key" }, { status: 401 });
        }

        const merchant = await prisma.merchant.findUnique({
            where: { apiKey },
        });

        if (!merchant) {
            return NextResponse.json({ error: "Invalid API Key" }, { status: 401 });
        }

        const body = await req.json();
        const { amount, cardNumber, cvv, expiryDate } = body;

        if (!amount || amount <= 0) {
            return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
        }

        // Normalize card number: Remove spaces, then format as XXXX XXXX XXXX XXXX
        const cleanCardNumber = cardNumber.replace(/\s/g, "");
        const formattedCardNumber = cleanCardNumber.match(/.{1,4}/g)?.join(' ') || cleanCardNumber;

        // Find user by card details
        const user = await prisma.user.findUnique({
            where: { cardNumber: formattedCardNumber },
        });

        if (!user) {
            return NextResponse.json({ error: "Invalid Card Number" }, { status: 400 });
        }

        if (user.cvv !== cvv || user.expiryDate !== expiryDate) {
            return NextResponse.json({ error: "Invalid Card Details" }, { status: 400 });
        }

        if (user.balance < amount) {
            return NextResponse.json({ error: "Insufficient Balance" }, { status: 400 });
        }

        // Process Payment
        await prisma.$transaction([
            prisma.user.update({
                where: { id: user.id },
                data: { balance: { decrement: amount } },
            }),
            prisma.user.update({
                where: { id: merchant.userId },
                data: { balance: { increment: amount } },
            }),
            prisma.transaction.create({
                data: {
                    amount,
                    description: `Payment to ${merchant.name}`,
                    senderId: user.id,
                    receiverId: merchant.userId,
                    merchantName: merchant.name,
                },
            }),
        ]);

        return NextResponse.json({
            success: true,
            message: "Payment Successful",
            transactionId: "tx_" + Math.random().toString(36).substring(7),
        });

    } catch (error) {
        console.error("Card payment error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
