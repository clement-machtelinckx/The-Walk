import { create } from "zustand";
import {
    Session,
    SessionResponsesSummary,
    SessionPrechatData,
    RollCallMember,
    PresenceSummary,
} from "@/types/session";
import {
    CreateSessionInput,
    UpdateSessionInput,
    SessionResponseInput,
} from "@/lib/validators/session";
import { RollCallInput } from "@/lib/validators/presence";

interface PresenceStateData {
    rollCall: RollCallMember[];
    summary: PresenceSummary;
}

interface SessionState {
    // Data
    nextSessions: Record<string, Session | null>;
    activeSessions: Record<string, Session | null>;
    responses: Record<string, SessionResponsesSummary | null>;
    prechats: Record<string, SessionPrechatData | null>;
    presenceData: Record<string, PresenceStateData | null>;

    // Loading states
    isLoadingSession: boolean;
    isLoadingActiveSession: boolean;
    isLoadingResponses: boolean;
    isLoadingPrechat: boolean;
    isLoadingPresence: boolean;
    isResponding: boolean;
    isSendingMessage: boolean;
    isStartingSession: boolean;
    isEndingSession: boolean;
    isSavingPresence: boolean;
    error: string | null;

    // Actions
    fetchNextSession: (tableId: string) => Promise<void>;
    fetchActiveSession: (tableId: string) => Promise<void>;
    createSession: (
        tableId: string,
        payload: CreateSessionInput,
    ) => Promise<{ success: boolean; session?: Session; error?: string }>;
    updateSession: (
        sessionId: string,
        payload: UpdateSessionInput,
    ) => Promise<{ success: boolean; session?: Session; error?: string }>;

    fetchSessionResponses: (sessionId: string) => Promise<void>;
    respondToSession: (
        sessionId: string,
        payload: SessionResponseInput,
    ) => Promise<{ success: boolean; error?: string }>;

    fetchPrechatMessages: (sessionId: string, page?: number) => Promise<void>;
    sendPrechatMessage: (
        sessionId: string,
        content: string,
    ) => Promise<{ success: boolean; error?: string }>;

    startSession: (
        sessionId: string,
    ) => Promise<{ success: boolean; session?: Session; error?: string }>;
    endSession: (
        sessionId: string,
    ) => Promise<{ success: boolean; session?: Session; error?: string }>;

    fetchPresence: (sessionId: string) => Promise<void>;
    savePresence: (
        sessionId: string,
        payload: RollCallInput,
    ) => Promise<{ success: boolean; error?: string }>;
}

export const useSessionStore = create<SessionState>((set, get) => ({
    // Initial State
    nextSessions: {},
    activeSessions: {},
    responses: {},
    prechats: {},
    presenceData: {},
    isLoadingSession: false,
    isLoadingActiveSession: false,
    isLoadingResponses: false,
    isLoadingPrechat: false,
    isLoadingPresence: false,
    isResponding: false,
    isSendingMessage: false,
    isStartingSession: false,
    isEndingSession: false,
    isSavingPresence: false,
    error: null,

    // Actions
    fetchNextSession: async (tableId: string) => {
        set({ isLoadingSession: true, error: null });
        try {
            const res = await fetch(`/api/tables/${tableId}/sessions/next`);
            const data = await res.json();
            if (res.ok) {
                set((state) => ({
                    nextSessions: {
                        ...state.nextSessions,
                        [tableId]: data.session,
                    },
                    isLoadingSession: false,
                }));
            } else {
                set({
                    error: data.error || "Erreur lors de la récupération de la session",
                    isLoadingSession: false,
                });
            }
        } catch (err) {
            set({ error: "Erreur réseau", isLoadingSession: false });
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
                set((state) => ({
                    nextSessions: {
                        ...state.nextSessions,
                        [tableId]: data.session,
                    },
                }));
                return { success: true, session: data.session };
            } else {
                return {
                    success: false,
                    error: data.error || "Erreur lors de la création de la session",
                };
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
                return {
                    success: false,
                    error: data.error || "Erreur lors de la modification de la session",
                };
            }
        } catch (err) {
            return { success: false, error: "Erreur réseau" };
        }
    },

    fetchSessionResponses: async (sessionId: string) => {
        set({ isLoadingResponses: true, error: null });
        try {
            const res = await fetch(`/api/sessions/${sessionId}/responses`);
            const data = await res.json();
            if (res.ok) {
                set((state) => ({
                    responses: {
                        ...state.responses,
                        [sessionId]: data,
                    },
                    isLoadingResponses: false,
                }));
            } else {
                set({
                    error: data.error || "Erreur lors de la récupération des réponses",
                    isLoadingResponses: false,
                });
            }
        } catch (err) {
            set({ error: "Erreur réseau", isLoadingResponses: false });
        }
    },

    respondToSession: async (sessionId: string, payload: SessionResponseInput) => {
        set({ isResponding: true, error: null });
        try {
            const res = await fetch(`/api/sessions/${sessionId}/respond`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (res.ok) {
                await get().fetchSessionResponses(sessionId);
                set({ isResponding: false });
                return { success: true };
            } else {
                set({ isResponding: false, error: data.error });
                return {
                    success: false,
                    error: data.error || "Erreur lors de l'enregistrement de la réponse",
                };
            }
        } catch (err) {
            set({ isResponding: false, error: "Erreur réseau" });
            return { success: false, error: "Erreur réseau" };
        }
    },

    fetchPrechatMessages: async (sessionId: string, page = 1) => {
        set({ isLoadingPrechat: true, error: null });
        try {
            const res = await fetch(`/api/sessions/${sessionId}/prechat?page=${page}`);
            const data = await res.json();
            if (res.ok) {
                set((state) => ({
                    prechats: {
                        ...state.prechats,
                        [sessionId]: data,
                    },
                    isLoadingPrechat: false,
                }));
            } else {
                set({
                    error: data.error || "Erreur lors de la récupération des messages",
                    isLoadingPrechat: false,
                });
            }
        } catch (err) {
            set({ error: "Erreur réseau", isLoadingPrechat: false });
        }
    },

    sendPrechatMessage: async (sessionId: string, content: string) => {
        set({ isSendingMessage: true, error: null });
        try {
            const res = await fetch(`/api/sessions/${sessionId}/prechat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content }),
            });
            const data = await res.json();
            if (res.ok) {
                await get().fetchPrechatMessages(sessionId);
                set({ isSendingMessage: false });
                return { success: true };
            } else {
                set({ isSendingMessage: false, error: data.error });
                return {
                    success: false,
                    error: data.error || "Erreur lors de l'envoi du message",
                };
            }
        } catch (err) {
            set({ isSendingMessage: false, error: "Erreur réseau" });
            return { success: false, error: "Erreur réseau" };
        }
    },

    fetchActiveSession: async (tableId: string) => {
        set({ isLoadingActiveSession: true, error: null });
        try {
            const res = await fetch(`/api/tables/${tableId}/sessions/active`);
            const data = await res.json();
            if (res.ok) {
                set((state) => ({
                    activeSessions: {
                        ...state.activeSessions,
                        [tableId]: data.session,
                    },
                    isLoadingActiveSession: false,
                }));
            } else {
                set({
                    error: data.error || "Erreur lors de la récupération de la session active",
                    isLoadingActiveSession: false,
                });
            }
        } catch (err) {
            set({ error: "Erreur réseau", isLoadingActiveSession: false });
        }
    },

    startSession: async (sessionId: string) => {
        set({ isStartingSession: true, error: null });
        try {
            const res = await fetch(`/api/sessions/${sessionId}/start`, {
                method: "POST",
            });
            const data = await res.json();
            if (res.ok) {
                const session = data.session;
                set((state) => ({
                    activeSessions: {
                        ...state.activeSessions,
                        [session.table_id]: session,
                    },
                    nextSessions: {
                        ...state.nextSessions,
                        [session.table_id]: null,
                    },
                    isStartingSession: false,
                }));
                return { success: true, session };
            } else {
                set({ isStartingSession: false, error: data.error });
                return { success: false, error: data.error };
            }
        } catch (err) {
            set({ isStartingSession: false, error: "Erreur réseau" });
            return { success: false, error: "Erreur réseau" };
        }
    },

    endSession: async (sessionId: string) => {
        set({ isEndingSession: true, error: null });
        try {
            const res = await fetch(`/api/sessions/${sessionId}/end`, {
                method: "POST",
            });
            const data = await res.json();
            if (res.ok) {
                const session = data.session;
                set((state) => ({
                    activeSessions: {
                        ...state.activeSessions,
                        [session.table_id]: null,
                    },
                    isEndingSession: false,
                }));
                await get().fetchNextSession(session.table_id);
                return { success: true, session };
            } else {
                set({ isEndingSession: false, error: data.error });
                return { success: false, error: data.error };
            }
        } catch (err) {
            set({ isEndingSession: false, error: "Erreur réseau" });
            return { success: false, error: "Erreur réseau" };
        }
    },

    fetchPresence: async (sessionId: string) => {
        set({ isLoadingPresence: true, error: null });
        try {
            const res = await fetch(`/api/sessions/${sessionId}/presence`);
            const data = await res.json();
            if (res.ok) {
                set((state) => ({
                    presenceData: {
                        ...state.presenceData,
                        [sessionId]: data,
                    },
                    isLoadingPresence: false,
                }));
            } else {
                set({
                    error: data.error || "Erreur lors de la récupération de la présence",
                    isLoadingPresence: false,
                });
            }
        } catch (err) {
            set({ error: "Erreur réseau", isLoadingPresence: false });
        }
    },

    savePresence: async (sessionId: string, payload: RollCallInput) => {
        set({ isSavingPresence: true, error: null });
        try {
            const res = await fetch(`/api/sessions/${sessionId}/presence`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (res.ok) {
                await get().fetchPresence(sessionId);
                set({ isSavingPresence: false });
                return { success: true };
            } else {
                set({ isSavingPresence: false, error: data.error });
                return {
                    success: false,
                    error: data.error || "Erreur lors de l'enregistrement de l'appel",
                };
            }
        } catch (err) {
            set({ isSavingPresence: false, error: "Erreur réseau" });
            return { success: false, error: "Erreur réseau" };
        }
    },
}));
