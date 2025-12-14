"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, EyeOff, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CreditCardProps {
    cardNumber: string;
    cvv: string;
    expiryDate: string;
    name: string;
}

export function CreditCard({ cardNumber, cvv, expiryDate, name }: CreditCardProps) {
    const [showDetails, setShowDetails] = useState(false);

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text.replace(/\s/g, ''));
        toast.success(`${label} copied to clipboard`);
    };

    return (
        <div className="relative w-full h-56 perspective-1000 group cursor-pointer" onClick={() => setShowDetails(!showDetails)}>
            <div className={`relative w-full h-full transition-all duration-500 transform preserve-3d ${showDetails ? 'rotate-y-180' : ''}`}>

                {/* Front of Card */}
                <div className="absolute w-full h-full backface-hidden">
                    <div className="w-full h-full rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 p-6 text-white shadow-xl flex flex-col justify-between border border-white/10">
                        <div className="flex justify-between items-start">
                            <div className="text-lg font-bold italic tracking-wider">TEEN PAY</div>
                            <div className="h-8 w-12 bg-white/20 rounded flex items-center justify-center">
                                <div className="w-6 h-4 border-2 border-white/50 rounded-sm relative overflow-hidden">
                                    <div className="absolute top-1 left-0 w-full h-[1px] bg-white/50"></div>
                                    <div className="absolute bottom-1 left-0 w-full h-[1px] bg-white/50"></div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center justify-between">
                                <div className="text-2xl font-mono tracking-widest drop-shadow-md">
                                    {showDetails ? cardNumber : "**** **** **** " + cardNumber.slice(-4)}
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10 relative z-50"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        copyToClipboard(cardNumber, "Card Number");
                                    }}
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="flex justify-between items-end">
                            <div>
                                <div className="text-xs text-white/70 uppercase tracking-wider mb-1">Card Holder</div>
                                <div className="font-medium tracking-wide uppercase">{name}</div>
                            </div>
                            <div>
                                <div className="text-xs text-white/70 uppercase tracking-wider mb-1">Expires</div>
                                <div className="font-medium tracking-wide">{expiryDate}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Back of Card */}
                <div className="absolute w-full h-full backface-hidden rotate-y-180">
                    <div className="w-full h-full rounded-2xl bg-gradient-to-bl from-gray-800 to-gray-900 text-white shadow-xl flex flex-col border border-white/10 overflow-hidden">
                        <div className="w-full h-10 bg-black mt-6"></div>

                        <div className="px-6 mt-4">
                            <div className="flex flex-col items-end">
                                <div className="text-xs text-white/70 uppercase tracking-wider mb-1">CVV</div>
                                <div className="w-full h-10 bg-white text-black flex items-center justify-between px-3 font-mono font-bold rounded">
                                    <span>{cvv}</span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 text-black/50 hover:text-black hover:bg-black/10"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            copyToClipboard(cvv, "CVV");
                                        }}
                                    >
                                        <Copy className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto p-6 flex justify-between items-center">
                            <div className="text-xs text-white/50 max-w-[70%]">
                                This is a virtual card for Teen Pay transactions. Not valid for physical use.
                            </div>
                            <div className="text-lg font-bold italic tracking-wider text-white/50">TEEN PAY</div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
