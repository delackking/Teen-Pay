"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface PinModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (pin: string) => void;
    amount: number;
    recipientId: string;
}

export function PinModal({ isOpen, onClose, onConfirm, amount, recipientId }: PinModalProps) {
    const [pin, setPin] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (pin.length === 4) {
            onConfirm(pin);
            setPin("");
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-card border-white/10">
                <DialogHeader>
                    <DialogTitle>Enter PIN</DialogTitle>
                    <DialogDescription>
                        Sending ₹{amount} to {recipientId}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex justify-center py-4">
                        <Input
                            type="password"
                            maxLength={4}
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            className="text-center text-2xl tracking-[1em] w-40 h-12 font-bold bg-background/50"
                            placeholder="••••"
                            autoFocus
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={pin.length !== 4}>
                        Confirm Payment
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
