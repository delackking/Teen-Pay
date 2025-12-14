"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Scanner } from "@yudiel/react-qr-scanner";

export default function ScanPage() {
    const router = useRouter();
    const [error, setError] = useState("");

    const handleScan = (result: any) => {
        if (result) {
            const rawValue = result[0]?.rawValue;
            if (rawValue) {
                // Expected format: teenpay:username@teen
                if (rawValue.startsWith("teenpay:")) {
                    const teenId = rawValue.split("teenpay:")[1];
                    router.push(`/pay?recipient=${teenId}`);
                } else {
                    setError("Invalid QR Code");
                }
            }
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext("2d");
                if (ctx) {
                    ctx.drawImage(img, 0, 0);
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    // Dynamic import to avoid SSR issues if any
                    import("jsqr").then((jsQR) => {
                        const code = jsQR.default(imageData.data, imageData.width, imageData.height);
                        if (code) {
                            handleScan([{ rawValue: code.data }]);
                        } else {
                            setError("No QR code found in image");
                        }
                    });
                }
            };
            img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            <div className="p-4 flex items-center justify-between z-10">
                <Link href="/" className="p-2 rounded-full bg-black/50 backdrop-blur-md">
                    <ArrowLeft className="h-6 w-6" />
                </Link>
                <h1 className="font-bold">Scan QR</h1>
                <div className="w-10" />
            </div>

            <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="w-full max-w-md aspect-square relative">
                    <Scanner
                        onScan={handleScan}
                        onError={(error: any) => console.log(error?.message)}
                        components={{
                            finder: true,
                        }}
                        styles={{
                            container: { width: '100%', height: '100%' }
                        }}
                    />
                </div>

                {error && (
                    <div className="mt-4 p-3 bg-red-500/20 text-red-500 rounded-lg">
                        {error}
                    </div>
                )}

                <p className="mt-8 text-sm text-gray-400">Align QR code within the frame</p>

                <div className="mt-6">
                    <input
                        type="file"
                        accept="image/*"
                        id="qr-upload"
                        className="hidden"
                        onChange={handleImageUpload}
                    />
                    <label
                        htmlFor="qr-upload"
                        className="cursor-pointer px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full text-sm font-medium transition-colors flex items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
                        Upload from Gallery
                    </label>
                </div>
            </div>
        </div>
    );
}
