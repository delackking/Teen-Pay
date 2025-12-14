"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, QrCode, History, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
    const pathname = usePathname();

    const navItems = [
        { href: "/", icon: Home, label: "Home" },
        { href: "/scan", icon: QrCode, label: "Scan" },
        { href: "/passbook", icon: History, label: "History" },
        { href: "/profile", icon: User, label: "Profile" },
    ];

    // Don't show on auth pages
    if (pathname.includes("/login") || pathname.includes("/signup")) {
        return null;
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-background/80 backdrop-blur-lg pb-safe">
            <div className="flex items-center justify-around h-16">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                                isActive ? "text-primary" : "text-muted-foreground hover:text-primary/70"
                            )}
                        >
                            <item.icon className={cn("h-6 w-6", isActive && "fill-current")} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
