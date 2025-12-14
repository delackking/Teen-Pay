"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export default function SignupPage() {
    const router = useRouter();
    const setCurrentUser = useAppStore((state) => state.setCurrentUser);
    const [name, setName] = useState("");
    const [teenId, setTeenId] = useState("");
    const [pin, setPin] = useState("");
    const [error, setError] = useState("");

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { signup: signupAction } = await import("@/app/actions");
            const result = await signupAction(name, teenId, pin);

            if (result.success && result.user) {
                // @ts-ignore
                setCurrentUser(result.user);
                router.push("/");
            } else {
                setError(result.message || "Signup failed");
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
                            <Sparkles className="h-8 w-8 text-primary" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight">Create Account</CardTitle>
                    <CardDescription>Get your own Teen ID and start paying</CardDescription>
                </CardHeader>
                <form onSubmit={handleSignup}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                placeholder="Full Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="bg-background/50 border-primary/20 focus-visible:ring-primary"
                            />
                        </div>
                        <div className="space-y-2">
                            <Input
                                placeholder="Choose Teen ID (e.g. coolkid@teen)"
                                value={teenId}
                                onChange={(e) => setTeenId(e.target.value)}
                                className="bg-background/50 border-primary/20 focus-visible:ring-primary"
                            />
                        </div>
                        <div className="space-y-2">
                            <Input
                                type="password"
                                placeholder="Create 4-digit PIN"
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
                            Create Wallet
                        </Button>
                        <p className="text-xs text-center text-muted-foreground">
                            Already have an account?{" "}
                            <Link href="/login" className="text-primary hover:underline">
                                Login
                            </Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
