"use client";

import Link from "next/link";
import { Send, QrCode, ArrowDownLeft, History } from "lucide-react";
import { Card } from "@/components/ui/card";

const actions = [
    { icon: QrCode, label: "Scan QR", href: "/scan", color: "bg-blue-500/10 text-blue-500" },
    { icon: Send, label: "To Mobile", href: "/pay", color: "bg-purple-500/10 text-purple-500" },
    { icon: ArrowDownLeft, label: "Request", href: "/request", color: "bg-green-500/10 text-green-500" },
    { icon: History, label: "History", href: "/passbook", color: "bg-orange-500/10 text-orange-500" },
];

export function QuickActions() {
    return (
        <div className="grid grid-cols-4 gap-4">
            {actions.map((action) => (
                <Link key={action.label} href={action.href} className="flex flex-col items-center space-y-2">
                    <Card className={`flex h-14 w-14 items-center justify-center rounded-2xl border-none ${action.color} transition-transform active:scale-95`}>
                        <action.icon className="h-6 w-6" />
                    </Card>
                    <span className="text-xs font-medium text-muted-foreground">{action.label}</span>
                </Link>
            ))}
        </div>
    );
}
