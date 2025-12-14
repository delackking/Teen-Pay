"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { BalanceCard } from "@/components/BalanceCard";
import { QuickActions } from "@/components/QuickActions";
import { RecentTransactions } from "@/components/RecentTransactions";
import { PendingRequests } from "@/components/PendingRequests";
import { CreditCard } from "@/components/CreditCard";
import { Bell } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { currentUser, isAuthenticated, setCurrentUser } = useAppStore();

  useEffect(() => {
    const checkSession = async () => {
      if (!isAuthenticated) {
        try {
          const { getCurrentUser } = await import("@/app/actions");
          const user = await getCurrentUser();
          if (user) {
            // @ts-ignore
            setCurrentUser(user);
          } else {
            router.push("/login");
          }
        } catch (error) {
          router.push("/login");
        }
      }
    };
    checkSession();
  }, [isAuthenticated, router, setCurrentUser]);

  if (!currentUser) return null;

  return (
    <main className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between bg-background/80 p-4 backdrop-blur-lg">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary to-purple-500 p-[2px]">
            <div className="h-full w-full rounded-full bg-background p-1">
              {/* Placeholder for user image or initial */}
              <div className="flex h-full w-full items-center justify-center rounded-full bg-muted font-bold text-primary">
                {currentUser.name.charAt(0)}
              </div>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Welcome back,</p>
            <h1 className="font-bold">{currentUser.name}</h1>
          </div>
        </div>
        <button className="rounded-full bg-muted p-2 text-muted-foreground hover:bg-muted/80 hover:text-foreground">
          <Bell className="h-5 w-5" />
        </button>
      </header>

      <div className="px-4 space-y-6 mt-2">
        <BalanceCard balance={currentUser.balance} />
        {currentUser.cardNumber && (
          <CreditCard
            cardNumber={currentUser.cardNumber}
            cvv={currentUser.cvv || '***'}
            expiryDate={currentUser.expiryDate || '**/**'}
            name={currentUser.name}
          />
        )}
        <QuickActions />
        <PendingRequests />
        <RecentTransactions />
      </div>
    </main>
  );
}
