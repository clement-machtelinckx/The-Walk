import { create } from "zustand";

import type { InitiativeActionInput } from "@/lib/validators/initiative";
import type { InitiativeSnapshot } from "@/types/initiative";

type InitiativeActionResult = { success: boolean; error?: string };

interface InitiativeStore {
    initiatives: Record<string, InitiativeSnapshot | null>;
    isLoading: boolean;
    isMutating: boolean;
    error: string | null;
    fetchInitiative: (sessionId: string) => Promise<void>;
    requestInitiative: (sessionId: string) => Promise<InitiativeActionResult>;
    addMember: (sessionId: string, userId: string) => Promise<InitiativeActionResult>;
    addCustomParticipant: (
        sessionId: string,
        label: string,
        modifier: number,
    ) => Promise<InitiativeActionResult>;
    rollInitiative: (
        sessionId: string,
        entryId: string,
        modifier?: number,
    ) => Promise<InitiativeActionResult>;
    rollCustomMissing: (sessionId: string) => Promise<InitiativeActionResult>;
    updateEntry: (
        sessionId: string,
        entryId: string,
        updates: { score?: number | null; modifier?: number },
    ) => Promise<InitiativeActionResult>;
    moveEntry: (
        sessionId: string,
        entryId: string,
        direction: "up" | "down",
    ) => Promise<InitiativeActionResult>;
    setCurrent: (sessionId: string, entryId: string | null) => Promise<InitiativeActionResult>;
    removeEntry: (sessionId: string, entryId: string) => Promise<InitiativeActionResult>;
    reset: (sessionId: string) => Promise<InitiativeActionResult>;
    clearError: () => void;
}

function initiativeErrorMessage(error: unknown, fallback: string): string {
    if (typeof error !== "string" || !error.trim()) return fallback;

    if (error.includes("Players can only submit their own pending initiative")) {
        return "Votre jet d'initiative n'a pas pu être enregistré. Actualisez puis réessayez.";
    }

    return error;
}

export const useInitiativeStore = create<InitiativeStore>((set, get) => {
    const runAction = async (
        sessionId: string,
        input: InitiativeActionInput,
    ): Promise<InitiativeActionResult> => {
        if (get().isMutating) {
            return { success: false, error: "Une action d'initiative est déjà en cours." };
        }

        set({ isMutating: true, error: null });

        try {
            const response = await fetch(`/api/sessions/${sessionId}/initiative`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(input),
            });
            const data = await response.json();

            if (response.ok) {
                set((state) => ({
                    initiatives: {
                        ...state.initiatives,
                        [sessionId]: data.initiative,
                    },
                }));
                return { success: true };
            }

            const error = initiativeErrorMessage(
                data.error,
                "Impossible de mettre à jour l'initiative.",
            );
            set({ error });
            return { success: false, error };
        } catch {
            const error = "Erreur réseau pendant la mise à jour de l'initiative.";
            set({ error });
            return { success: false, error };
        } finally {
            set({ isMutating: false });
        }
    };

    return {
        initiatives: {},
        isLoading: false,
        isMutating: false,
        error: null,

        fetchInitiative: async (sessionId: string) => {
            set({ isLoading: get().initiatives[sessionId] === undefined, error: null });

            try {
                const response = await fetch(`/api/sessions/${sessionId}/initiative`);
                const data = await response.json();

                if (response.ok) {
                    set((state) => ({
                        initiatives: {
                            ...state.initiatives,
                            [sessionId]: data.initiative,
                        },
                        isLoading: false,
                        error: null,
                    }));
                    return;
                }

                set({
                    error: initiativeErrorMessage(
                        data.error,
                        "Impossible de charger l'initiative.",
                    ),
                    isLoading: false,
                });
            } catch {
                set({
                    error: "Erreur réseau pendant le chargement de l'initiative.",
                    isLoading: false,
                });
            }
        },
        requestInitiative: (sessionId) => runAction(sessionId, { action: "request" }),
        addMember: (sessionId, userId) =>
            runAction(sessionId, { action: "add_member", user_id: userId }),
        addCustomParticipant: (sessionId, label, modifier) =>
            runAction(sessionId, { action: "add_custom", label, modifier }),
        rollInitiative: (sessionId, entryId, modifier) =>
            runAction(sessionId, {
                action: "roll",
                entry_id: entryId,
                ...(modifier !== undefined ? { modifier } : {}),
            }),
        rollCustomMissing: (sessionId) => runAction(sessionId, { action: "roll_custom_missing" }),
        updateEntry: (sessionId, entryId, updates) =>
            runAction(sessionId, { action: "update_entry", entry_id: entryId, ...updates }),
        moveEntry: (sessionId, entryId, direction) =>
            runAction(sessionId, { action: "move", entry_id: entryId, direction }),
        setCurrent: (sessionId, entryId) =>
            runAction(sessionId, { action: "set_current", entry_id: entryId }),
        removeEntry: (sessionId, entryId) =>
            runAction(sessionId, { action: "remove", entry_id: entryId }),
        reset: (sessionId) => runAction(sessionId, { action: "reset" }),
        clearError: () => set({ error: null }),
    };
});
