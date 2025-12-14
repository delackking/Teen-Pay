"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

// --- Authentication ---

export async function login(teenId: string, pin: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { teenId },
        });

        if (user && user.pin === pin) {
            // In a real app, set a session cookie
            (await cookies()).set("userId", user.id);
            return { success: true, user };
        }

        return { success: false, message: "Invalid Teen ID or PIN" };
    } catch (error) {
        console.error("Login error:", error);
        return { success: false, message: "Database error during login" };
    }
}

// Helper functions for card generation
function generateCardNumber() {
    let number = "4"; // Visa
    for (let i = 0; i < 15; i++) {
        number += Math.floor(Math.random() * 10);
    }
    return number.match(/.{1,4}/g)?.join(' ') || number;
}

function generateCVV() {
    return Math.floor(100 + Math.random() * 900).toString();
}

function generateExpiry() {
    const month = Math.floor(1 + Math.random() * 12).toString().padStart(2, '0');
    const year = (new Date().getFullYear() + Math.floor(2 + Math.random() * 4)).toString().slice(-2);
    return `${month}/${year}`;
}

export async function signup(name: string, teenId: string, pin: string) {
    try {
        const user = await prisma.user.create({
            data: {
                name,
                teenId,
                pin,
                balance: 1000, // Joining bonus
                cardNumber: generateCardNumber(),
                cvv: generateCVV(),
                expiryDate: generateExpiry(),
            },
        });
        (await cookies()).set("userId", user.id);
        return { success: true, user };
    } catch (error) {
        console.error("Signup error:", error);
        // Check if it's a unique constraint violation
        // @ts-ignore
        if (error.code === 'P2002') {
            return { success: false, message: "Teen ID already taken" };
        }
        return { success: false, message: "Signup failed: " + (error as Error).message };
    }
}

export async function logout() {
    (await cookies()).delete("userId");
}

export async function getCurrentUser() {
    const userId = (await cookies()).get("userId")?.value;
    if (!userId) return null;

    return await prisma.user.findUnique({
        where: { id: userId },
    });
}

export async function changePin(oldPin: string, newPin: string) {
    const user = await getCurrentUser();
    if (!user) return { success: false, message: "Not authenticated" };

    if (user.pin !== oldPin) {
        return { success: false, message: "Incorrect old PIN" };
    }

    await prisma.user.update({
        where: { id: user.id },
        data: { pin: newPin },
    });

    return { success: true, message: "PIN updated successfully" };
}

// --- Payments ---

export async function verifyPinAndPay(amount: number, recipientId: string, note: string, pin: string) {
    const sender = await getCurrentUser();
    if (!sender) return { success: false, message: "Not authenticated" };

    if (amount <= 0) {
        return { success: false, message: "Amount must be greater than zero" };
    }

    if (sender.pin !== pin) {
        return { success: false, message: "Invalid PIN" };
    }

    if (sender.balance < amount) {
        return { success: false, message: "Insufficient balance" };
    }

    const recipient = await prisma.user.findUnique({
        where: { teenId: recipientId },
    });

    if (!recipient) {
        return { success: false, message: "Recipient not found" };
    }

    if (recipient.id === sender.id) {
        return { success: false, message: "Cannot send money to yourself" };
    }

    // Atomic transaction
    try {
        await prisma.$transaction([
            prisma.user.update({
                where: { id: sender.id },
                data: { balance: { decrement: amount } },
            }),
            prisma.user.update({
                where: { id: recipient.id },
                data: { balance: { increment: amount } },
            }),
            prisma.transaction.create({
                data: {
                    amount,
                    description: note,
                    senderId: sender.id,
                    receiverId: recipient.id,
                },
            }),
        ]);

        revalidatePath("/");
        revalidatePath("/passbook");
        return { success: true, message: "Payment successful" };
    } catch (error) {
        return { success: false, message: "Transaction failed" };
    }
}

export async function sendMoney(recipientId: string, amount: number, note: string) {
    // This function is now redundant if we use verifyPinAndPay, but keeping it for compatibility or simple flows
    // For now, let's just call verifyPinAndPay with a dummy PIN check or assume it's called after PIN verification
    // Actually, let's just return an error saying PIN is required if this is called directly
    return { success: false, message: "Please use verifyPinAndPay" };
}

// --- Requests ---

export async function requestMoney(amount: number, payerTeenId: string, note: string) {
    const requester = await getCurrentUser();
    if (!requester) return { success: false, message: "Not authenticated" };

    if (amount <= 0) {
        return { success: false, message: "Amount must be greater than zero" };
    }

    const payer = await prisma.user.findUnique({
        where: { teenId: payerTeenId },
    });

    if (!payer) return { success: false, message: "Payer not found" };

    if (payer.id === requester.id) return { success: false, message: "Cannot request money from yourself" };

    await prisma.paymentRequest.create({
        data: {
            amount,
            description: note,
            requesterId: requester.id,
            payerId: payer.id,
            status: "PENDING",
        },
    });

    revalidatePath("/");
    return { success: true, message: "Request sent successfully" };
}

export async function getPendingRequests() {
    const user = await getCurrentUser();
    if (!user) return [];

    const requests = await prisma.paymentRequest.findMany({
        where: {
            payerId: user.id,
            status: "PENDING",
        },
        include: {
            requester: { select: { name: true, teenId: true } },
        },
        orderBy: { createdAt: 'desc' },
    });

    return requests;
}

export async function respondToRequest(requestId: string, action: 'PAY' | 'REJECT', pin?: string) {
    const user = await getCurrentUser();
    if (!user) return { success: false, message: "Not authenticated" };

    const request = await prisma.paymentRequest.findUnique({
        where: { id: requestId },
        include: { requester: true },
    });

    if (!request || request.payerId !== user.id) {
        return { success: false, message: "Request not found or unauthorized" };
    }

    if (action === 'REJECT') {
        await prisma.paymentRequest.update({
            where: { id: requestId },
            data: { status: 'REJECTED' },
        });
        revalidatePath("/");
        return { success: true, message: "Request rejected" };
    }

    if (action === 'PAY') {
        if (!pin) return { success: false, message: "PIN required" };
        if (user.pin !== pin) return { success: false, message: "Invalid PIN" };
        if (user.balance < request.amount) return { success: false, message: "Insufficient balance" };

        try {
            await prisma.$transaction([
                prisma.user.update({
                    where: { id: user.id },
                    data: { balance: { decrement: request.amount } },
                }),
                prisma.user.update({
                    where: { id: request.requesterId },
                    data: { balance: { increment: request.amount } },
                }),
                prisma.transaction.create({
                    data: {
                        amount: request.amount,
                        description: request.description || "Payment Request",
                        senderId: user.id,
                        receiverId: request.requesterId,
                    },
                }),
                prisma.paymentRequest.update({
                    where: { id: requestId },
                    data: { status: 'PAID' },
                }),
            ]);

            revalidatePath("/");
            revalidatePath("/passbook");
            return { success: true, message: "Payment successful" };
        } catch (error) {
            console.error("Payment error:", error);
            return { success: false, message: "Transaction failed" };
        }
    }
}

export async function getTransactions() {
    const user = await getCurrentUser();
    if (!user) return [];

    const transactions = await prisma.transaction.findMany({
        where: {
            OR: [
                { senderId: user.id },
                { receiverId: user.id },
            ],
        },
        include: {
            sender: { select: { name: true, teenId: true } },
            receiver: { select: { name: true, teenId: true } },
        },
        orderBy: { createdAt: 'desc' },
    });

    return transactions.map(tx => ({
        ...tx,
        type: tx.receiverId === user.id ? 'CREDIT' : 'DEBIT',
    }));
}

// --- Gateway Actions ---

export async function getOrderDetails(orderId: string) {
    return await prisma.paymentOrder.findUnique({
        where: { id: orderId },
        include: { merchant: { select: { name: true } } },
    });
}

export async function payOrder(orderId: string, pin: string) {
    const user = await getCurrentUser();
    if (!user) return { success: false, message: "Not authenticated" };

    if (user.pin !== pin) return { success: false, message: "Invalid PIN" };

    const order = await prisma.paymentOrder.findUnique({
        where: { id: orderId },
        include: { merchant: true },
    });

    if (!order) return { success: false, message: "Order not found" };
    if (order.status === 'PAID') return { success: false, message: "Order already paid" };
    if (user.balance < order.amount) return { success: false, message: "Insufficient balance" };

    try {
        await prisma.$transaction([
            prisma.user.update({
                where: { id: user.id },
                data: { balance: { decrement: order.amount } },
            }),
            prisma.user.update({
                where: { id: order.merchant.userId },
                data: { balance: { increment: order.amount } },
            }),
            prisma.transaction.create({
                data: {
                    amount: order.amount,
                    description: `Payment to ${order.merchant.name}`,
                    senderId: user.id,
                    receiverId: order.merchant.userId,
                    merchantName: order.merchant.name,
                },
            }),
            prisma.paymentOrder.update({
                where: { id: orderId },
                data: {
                    status: 'PAID',
                    payerId: user.id,
                },
            }),
        ]);

        return { success: true, message: "Payment successful" };
    } catch (error) {
        console.error("Gateway payment error:", error);
        return { success: false, message: "Transaction failed" };
    }
}

export async function getTestMerchantKey() {
    const merchant = await prisma.merchant.findFirst({
        where: { name: "Toy Store" }
    });
    return merchant?.apiKey;
}
