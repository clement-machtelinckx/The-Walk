import { create } from "zustand";

import type { CreateDiceRollInput } from "@/lib/validators/dice";
import type { DiceRollLog } from "@/types/dice";

interface DiceStore {
    rolls: Record<string, DiceRollLog[]>;
    isLoading: boolean;
    isRolling: boolean;
    error: string | null;
    fetchRolls: (tableId: string) => Promise<void>;
    rollDice: (
        tableId: string,
        input: CreateDiceRollInput,
    ) => Promise<{ success: boolean; error?: string }>;
    clearError: () => void;
}

export const useDiceStore = create<DiceStore>((set, get) => ({
    rolls: {},
    isLoading: false,
    isRolling: false,
    error: null,

    fetchRolls: async (tableId: string) => {
        set({ isLoading: get().rolls[tableId] === undefined, error: null });

        try {
            const response = await fetch(`/api/tables/${tableId}/dice`);
            const data = await response.json();

            if (!response.ok) {
                set({
                    error: data.error || "Impossible de charger les lancers.",
                    isLoading: false,
                });
                return;
            }

            set((state) => ({
                rolls: {
                    ...state.rolls,
                    [tableId]: data.rolls || [],
                },
                isLoading: false,
                error: null,
            }));
        } catch {
            set({ error: "Erreur réseau pendant le chargement des lancers.", isLoading: false });
        }
    },

    rollDice: async (tableId: string, input: CreateDiceRollInput) => {
        if (get().isRolling) {
            return { success: false, error: "Un lancer est déjà en cours." };
        }

        set({ isRolling: true, error: null });

        try {
            const response = await fetch(`/api/tables/${tableId}/dice`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(input),
            });
            const data = await response.json();

            if (!response.ok) {
                const error = data.error || "Le lancer a échoué.";
                set({ error });
                return { success: false, error };
            }

            set((state) => ({
                rolls: {
                    ...state.rolls,
                    [tableId]: [
                        data.roll,
                        ...(state.rolls[tableId] || []).filter((roll) => roll.id !== data.roll.id),
                    ],
                },
            }));
            return { success: true };
        } catch {
            const error = "Erreur réseau pendant le lancer.";
            set({ error });
            return { success: false, error };
        } finally {
            set({ isRolling: false, isLoading: false });
        }
    },

    clearError: () => set({ error: null }),
}));
