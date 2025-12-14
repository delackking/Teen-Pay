import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SuccessPage() {
    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 text-center">
            <div className="h-24 w-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
            <p className="text-gray-600 mb-8">Thank you for your purchase at Toy Store.</p>

            <div className="flex gap-4">
                <Link href="/external-store">
                    <Button variant="outline">Back to Store</Button>
                </Link>
                <Link href="/">
                    <Button className="bg-purple-600 hover:bg-purple-700">Go to Teen Pay App</Button>
                </Link>
            </div>
        </div>
    );
}
