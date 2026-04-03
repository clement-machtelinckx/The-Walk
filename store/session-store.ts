import { create } from "zustand";
import { Session } from "@/types/session";
import { CreateSessionInput, UpdateSessionInput } from "@/lib/validators/session";

interface SessionState {
    nextSessions: Record<string, Session | null>;
    isLoading: boolean;
    error: string | null;

    fetchNextSession: (tableId: string) => Promise<void>;
    createSession: (tableId: string, payload: CreateSessionInput) => Promise<{ success: boolean; session?: Session; error?: string }>;
    updateSession: (sessionId: string, payload: UpdateSessionInput) => Promise<{ success: boolean; session?: Session; error?: string }>;
}

export const useSessionStore = create<SessionState>((set, get) => ({
    nextSessions: {},
    isLoading: false,
    error: null,

    fetchNextSession: async (tableId: string) => {
        set({ isLoading: true, error: null });
        try {
            const res = await fetch(`/api/tables/${tableId}/sessions/next`);
            const data = await res.json();
            if (res.ok) {
                set((state) => ({
                    nextSessions: {
                        ...state.nextSessions,
                        [tableId]: data.session,
                    },
                    isLoading: false,
                }));
            } else {
                set({ error: data.error || "Erreur lors de la récupération de la session", isLoading: false });
            }
        } catch (err) {
            set({ error: "Erreur réseau", isLoading: false });
        }
    },

    createSession: async (tableId: string, payload: CreateSessionInput) => {
        set({ error: null });
        try {
            const res = await fetch(`/api/tables/${tableId}/sessions`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (res.ok) {
                // Optionally update nextSession if it's the new next session
                // For simplicity, we just clear it to force a re-fetch or let the component handle it
                set((state) => ({
                    nextSessions: {
                        ...state.nextSessions,
                        [tableId]: data.session, // Overwrite with new session
                    },
                }));
                return { success: true, session: data.session };
            } else {
                return { success: false, error: data.error || "Erreur lors de la création de la session" };
            }
        } catch (err) {
            return { success: false, error: "Erreur réseau" };
        }
    },

    updateSession: async (sessionId: string, payload: UpdateSessionInput) => {
        set({ error: null });
        try {
            const res = await fetch(`/api/sessions/${sessionId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (res.ok) {
                const updatedSession = data.session;
                // If it was stored as a next session, update it
                const tableId = updatedSession.table_id;
                if (get().nextSessions[tableId]?.id === sessionId) {
                    set((state) => ({
                        nextSessions: {
                            ...state.nextSessions,
                            [tableId]: updatedSession,
                        },
                    }));
                }
                return { success: true, session: updatedSession };
            } else {
                return { success: false, error: data.error || "Erreur lors de la modification de la session" };
            }
        } catch (err) {
            return { success: false, error: "Erreur réseau" };
        }
    },
}));
