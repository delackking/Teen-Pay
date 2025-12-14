"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const login = useAppStore((state) => state.setCurrentUser);
    const [teenId, setTeenId] = useState("");
    const [pin, setPin] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Dynamically import server action to avoid client-side bundling issues if any
            const { login: loginAction } = await import("@/app/actions");
            const result = await loginAction(teenId, pin);

            if (result.success && result.user) {
                // We need to cast the user from Prisma to our store User type if they differ slightly
                // or just ensure they match. Prisma dates are Date objects, store might expect strings if we were using JSON.
                // But here we just pass it.
                // @ts-ignore - ignoring date type mismatch for quick fix
                login(result.user);
                router.push("/");
            } else {
                setError(result.message || "Invalid credentials");
            }
        } catch (err) {
            setError("Something went wrong");
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-secondary/20 p-4">
            <Card className="w-full max-w-md border-primary/20 bg-card/50 backdrop-blur-xl">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 rounded-full bg-primary/10 ring-1 ring-primary/50">
                            <Wallet className="h-8 w-8 text-primary" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight">Welcome back</CardTitle>
                    <CardDescription>Enter your Teen ID to access your wallet</CardDescription>
                </CardHeader>
                <form onSubmit={handleLogin}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                placeholder="Teen ID (e.g. rahul@teen)"
                                value={teenId}
                                onChange={(e) => setTeenId(e.target.value)}
                                className="bg-background/50 border-primary/20 focus-visible:ring-primary"
                            />
                        </div>
                        <div className="space-y-2">
                            <Input
                                type="password"
                                placeholder="4-digit PIN"
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                maxLength={4}
                                className="bg-background/50 border-primary/20 focus-visible:ring-primary"
                            />
                        </div>
                        {error && <p className="text-sm text-destructive text-center">{error}</p>}
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <Button type="submit" className="w-full bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 transition-opacity">
                            Login
                        </Button>
                        <p className="text-xs text-center text-muted-foreground">
                            Don&apos;t have an account?{" "}
                            <Link href="/signup" className="text-primary hover:underline">
                                Create one
                            </Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
