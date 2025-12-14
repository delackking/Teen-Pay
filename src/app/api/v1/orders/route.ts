import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

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
        const { amount, currency = "INR", redirectUrl } = body;

        if (!amount || amount <= 0) {
            return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
        }

        const order = await prisma.paymentOrder.create({
            data: {
                amount,
                currency,
                redirectUrl,
                merchantId: merchant.id,
                status: "CREATED",
            },
        });

        return NextResponse.json({
            id: order.id,
            amount: order.amount,
            currency: order.currency,
            status: order.status,
        });

    } catch (error) {
        console.error("Order creation error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
