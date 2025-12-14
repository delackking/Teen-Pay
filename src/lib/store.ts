import { create } from 'zustand';

export type TransactionType = 'CREDIT' | 'DEBIT';

export interface Transaction {
    id: string;
    amount: number;
    type: TransactionType;
    date: string;
    description: string;
    relatedUserId?: string;
    relatedUserName?: string;
}

export interface User {
    id: string;
    name: string;
    teenId: string;
    pin: string;
    balance: number;
    qrCode: string;
    cardNumber?: string;
    cvv?: string;
    expiryDate?: string;
}

interface AppState {
    currentUser: User | null;
    isAuthenticated: boolean;

    // Actions
    setCurrentUser: (user: User | null) => void;
    logout: () => void;
}

export const useAppStore = create<AppState>((set) => ({
    currentUser: null,
    isAuthenticated: false,

    setCurrentUser: (user) => set({ currentUser: user, isAuthenticated: !!user }),
    logout: () => set({ currentUser: null, isAuthenticated: false }),
}));
