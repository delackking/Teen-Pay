"use client";

import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, LogOut, Share2, Copy } from "lucide-react";
import Link from "next/link";
import QRCode from "react-qr-code";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function ProfilePage() {
    const router = useRouter();
    const { currentUser, logout } = useAppStore();

    if (!currentUser) return null;

    const handleLogout = async () => {
        await import("@/app/actions").then(mod => mod.logout());
        logout();
        router.push("/login");
    };

    return (
        <div className="min-h-screen bg-background p-4 pb-24">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <Link href="/" className="p-2 rounded-full hover:bg-muted">
                        <ArrowLeft className="h-6 w-6" />
                    </Link>
                    <h1 className="ml-4 text-xl font-bold">My Profile</h1>
                </div>
                <Button variant="ghost" size="icon" onClick={handleLogout} className="text-destructive hover:text-destructive/80">
                    <LogOut className="h-5 w-5" />
                </Button>
            </div>

            <div className="flex flex-col items-center space-y-4 mb-8">
                <Avatar className="h-24 w-24 border-4 border-primary/20">
                    <AvatarFallback className="text-2xl bg-primary/10 text-primary font-bold">
                        {currentUser.name.charAt(0)}
                    </AvatarFallback>
                </Avatar>
                <div className="text-center">
                    <h2 className="text-2xl font-bold">{currentUser.name}</h2>
                    <p className="text-muted-foreground">{currentUser.teenId}</p>
                </div>
            </div>

            <Card className="bg-white text-black mb-6 overflow-hidden">
                <CardHeader className="bg-primary/10 pb-4">
                    <CardTitle className="text-center text-primary text-sm uppercase tracking-wider">My QR Code</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center p-8 bg-white">
                    <div className="p-4 bg-white rounded-xl shadow-sm border">
                        <QRCode
                            value={`teenpay:${currentUser.teenId}`}
                            size={200}
                            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                            viewBox={`0 0 256 256`}
                        />
                    </div>
                    <p className="mt-4 text-sm font-medium text-gray-500">Scan to pay me</p>
                </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <Button variant="outline" className="w-full">
                    <Share2 className="mr-2 h-4 w-4" />
                    Share QR
                </Button>
                <Button variant="outline" className="w-full">
                    <Copy className="mr-2 h-4 w-4" />
                    Copy ID
                </Button>
            </div>

            <ChangePinDialog />
        </div>
    );
}

function ChangePinDialog() {
    const [open, setOpen] = useState(false);
    const [oldPin, setOldPin] = useState("");
    const [newPin, setNewPin] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        try {
            const { changePin } = await import("@/app/actions");
            const result = await changePin(oldPin, newPin);
            if (result.success) {
                setSuccess("PIN updated successfully");
                setTimeout(() => setOpen(false), 1500);
                setOldPin("");
                setNewPin("");
            } else {
                setError(result.message || "Failed to update PIN");
            }
        } catch (err) {
            setError("Something went wrong");
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full border-destructive/50 text-destructive hover:bg-destructive/10">
                    Change PIN
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Change PIN</DialogTitle>
                    <DialogDescription>
                        Enter your current PIN and a new 4-digit PIN.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Input
                            type="password"
                            placeholder="Current PIN"
                            value={oldPin}
                            onChange={(e) => setOldPin(e.target.value)}
                            maxLength={4}
                        />
                    </div>
                    <div className="space-y-2">
                        <Input
                            type="password"
                            placeholder="New PIN"
                            value={newPin}
                            onChange={(e) => setNewPin(e.target.value)}
                            maxLength={4}
                        />
                    </div>
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    {success && <p className="text-sm text-green-500">{success}</p>}
                    <DialogFooter>
                        <Button type="submit">Update PIN</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
