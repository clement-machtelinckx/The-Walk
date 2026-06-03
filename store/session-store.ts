import { create } from "zustand";
import {
    Session,
    SessionResponsesSummary,
    SessionPrechatData,
    SessionLiveChatData,
    RollCallMember,
    PresenceSummary,
    TablePrivateMessageData,
} from "@/types/session";
import { PersonalNote, GroupNote } from "@/types/note";
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

export interface SessionHistoryItem {
    session: Session;
    presenceSummary: PresenceSummary | null;
}

interface SessionState {
    // Data
    nextSessions: Record<string, Session | null>;
    activeSessions: Record<string, Session | null>;
    sessionHistories: Record<string, SessionHistoryItem[]>;
    responses: Record<string, SessionResponsesSummary | null>;
    prechats: Record<string, SessionPrechatData | null>;
    livechats: Record<string, SessionLiveChatData | null>;
    privateMessages: Record<string, TablePrivateMessageData | null>;
    presenceData: Record<string, PresenceStateData | null>;
    personalNotes: Record<string, PersonalNote | null>;
    groupNotes: Record<string, GroupNote | null>;

    // Loading states
    isLoadingSession: boolean;
    isLoadingActiveSession: boolean;
    isLoadingHistory: boolean;
    isLoadingResponses: boolean;
    isLoadingPrechat: boolean;
    isLoadingLivechat: boolean;
    isLoadingPrivateMessages: boolean;
    isLoadingPresence: boolean;
    isLoadingPersonalNote: boolean;
    isLoadingGroupNote: boolean;
    isResponding: boolean;
    isSendingMessage: boolean;
    isSendingLiveMessage: boolean;
    isSendingPrivateMessage: boolean;
    isStartingSession: boolean;
    isEndingSession: boolean;
    isCancellingSession: boolean;
    isDeletingSession: boolean;
    isSavingPresence: boolean;
    isSavingPersonalNote: boolean;
    isSavingGroupNote: boolean;
    error: string | null;

    // Actions
    fetchNextSession: (tableId: string) => Promise<void>;
    fetchActiveSession: (tableId: string) => Promise<void>;
    fetchSessionHistory: (tableId: string) => Promise<void>;
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

    fetchLivechatMessages: (sessionId: string, page?: number) => Promise<void>;
    sendLivechatMessage: (
        sessionId: string,
        content: string,
    ) => Promise<{ success: boolean; error?: string }>;
    fetchPrivateMessages: (
        tableId: string,
        recipientUserId: string,
        page?: number,
    ) => Promise<void>;
    sendPrivateMessage: (
        tableId: string,
        recipientUserId: string,
        content: string,
        sessionId?: string,
    ) => Promise<{ success: boolean; error?: string }>;

    startSession: (
        sessionId: string,
    ) => Promise<{ success: boolean; session?: Session; error?: string }>;
    endSession: (
        sessionId: string,
    ) => Promise<{ success: boolean; session?: Session; error?: string }>;
    cancelSession: (
        sessionId: string,
    ) => Promise<{ success: boolean; session?: Session; error?: string }>;
    deleteSession: (sessionId: string) => Promise<{ success: boolean; error?: string }>;

    fetchPresence: (sessionId: string) => Promise<PresenceStateData | null>;
    savePresence: (
        sessionId: string,
        payload: RollCallInput,
    ) => Promise<{ success: boolean; error?: string }>;

    fetchPersonalNote: (sessionId: string) => Promise<void>;
    savePersonalNote: (
        sessionId: string,
        content: string,
    ) => Promise<{ success: boolean; error?: string }>;

    fetchGroupNote: (sessionId: string) => Promise<GroupNote | null | undefined>;
    saveGroupNote: (
        sessionId: string,
        content: string,
        expectedUpdatedAt: string | null,
    ) => Promise<{
        success: boolean;
        note?: GroupNote;
        error?: string;
        code?: string;
    }>;
}

export const useSessionStore = create<SessionState>((set, get) => ({
    // Initial State
    nextSessions: {},
    activeSessions: {},
    sessionHistories: {},
    responses: {},
    prechats: {},
    livechats: {},
    privateMessages: {},
    presenceData: {},
    personalNotes: {},
    groupNotes: {},
    isLoadingSession: false,
    isLoadingActiveSession: false,
    isLoadingHistory: false,
    isLoadingResponses: false,
    isLoadingPrechat: false,
    isLoadingLivechat: false,
    isLoadingPrivateMessages: false,
    isLoadingPresence: false,
    isLoadingPersonalNote: false,
    isLoadingGroupNote: false,
    isResponding: false,
    isSendingMessage: false,
    isSendingLiveMessage: false,
    isSendingPrivateMessage: false,
    isStartingSession: false,
    isEndingSession: false,
    isCancellingSession: false,
    isDeletingSession: false,
    isSavingPresence: false,
    isSavingPersonalNote: false,
    isSavingGroupNote: false,
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
        } catch {
            set({ error: "Erreur réseau", isLoadingSession: false });
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
        } catch {
            set({ error: "Erreur réseau", isLoadingActiveSession: false });
        }
    },

    fetchSessionHistory: async (tableId: string) => {
        set({ isLoadingHistory: true, error: null });
        try {
            const res = await fetch(`/api/tables/${tableId}/sessions/history`);
            const data = await res.json();
            if (res.ok) {
                set((state) => ({
                    sessionHistories: {
                        ...state.sessionHistories,
                        [tableId]: data.history,
                    },
                    isLoadingHistory: false,
                }));
            } else {
                set({
                    error: data.error || "Erreur lors de la récupération de l'historique",
                    isLoadingHistory: false,
                });
            }
        } catch {
            set({ error: "Erreur réseau", isLoadingHistory: false });
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
        } catch {
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
        } catch {
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
        } catch {
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
        } catch {
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
        } catch {
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
        } catch {
            set({ isSendingMessage: false, error: "Erreur réseau" });
            return { success: false, error: "Erreur réseau" };
        }
    },

    fetchLivechatMessages: async (sessionId: string, page = 1) => {
        set({ isLoadingLivechat: true, error: null });
        try {
            const res = await fetch(`/api/sessions/${sessionId}/livechat?page=${page}`);
            const data = await res.json();
            if (res.ok) {
                set((state) => ({
                    livechats: {
                        ...state.livechats,
                        [sessionId]: data,
                    },
                    isLoadingLivechat: false,
                }));
            } else {
                set({
                    error: data.error || "Erreur lors de la récupération des messages",
                    isLoadingLivechat: false,
                });
            }
        } catch {
            set({ error: "Erreur réseau", isLoadingLivechat: false });
        }
    },

    sendLivechatMessage: async (sessionId: string, content: string) => {
        set({ isSendingLiveMessage: true, error: null });
        try {
            const res = await fetch(`/api/sessions/${sessionId}/livechat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content }),
            });
            const data = await res.json();
            if (res.ok) {
                await get().fetchLivechatMessages(sessionId);
                set({ isSendingLiveMessage: false });
                return { success: true };
            } else {
                set({ isSendingLiveMessage: false, error: data.error });
                return {
                    success: false,
                    error: data.error || "Erreur lors de l'envoi du message",
                };
            }
        } catch {
            set({ isSendingLiveMessage: false, error: "Erreur réseau" });
            return { success: false, error: "Erreur réseau" };
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
        } catch {
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
                await get().fetchSessionHistory(session.table_id);
                return { success: true, session };
            } else {
                set({ isEndingSession: false, error: data.error });
                return { success: false, error: data.error };
            }
        } catch {
            set({ isEndingSession: false, error: "Erreur réseau" });
            return { success: false, error: "Erreur réseau" };
        }
    },

    cancelSession: async (sessionId: string) => {
        set({ isCancellingSession: true, error: null });
        try {
            const res = await fetch(`/api/sessions/${sessionId}/cancel`, {
                method: "POST",
            });
            const data = await res.json();
            if (res.ok) {
                const session = data.session;
                set((state) => ({
                    activeSessions: {
                        ...state.activeSessions,
                        [session.table_id]:
                            state.activeSessions[session.table_id]?.id === sessionId
                                ? null
                                : state.activeSessions[session.table_id],
                    },
                    nextSessions: {
                        ...state.nextSessions,
                        [session.table_id]:
                            state.nextSessions[session.table_id]?.id === sessionId
                                ? null
                                : state.nextSessions[session.table_id],
                    },
                    isCancellingSession: false,
                }));
                await get().fetchNextSession(session.table_id);
                await get().fetchActiveSession(session.table_id);
                await get().fetchSessionHistory(session.table_id);
                return { success: true, session };
            } else {
                set({ isCancellingSession: false, error: data.error });
                return { success: false, error: data.error };
            }
        } catch {
            set({ isCancellingSession: false, error: "Erreur réseau" });
            return { success: false, error: "Erreur réseau" };
        }
    },

    deleteSession: async (sessionId: string) => {
        set({ isDeletingSession: true, error: null });
        try {
            const sessionState = get();
            const tableId = Object.entries(sessionState.nextSessions).find(
                ([, session]) => session?.id === sessionId,
            )?.[0];
            const res = await fetch(`/api/sessions/${sessionId}`, {
                method: "DELETE",
            });
            const data = await res.json();

            if (res.ok) {
                if (tableId) {
                    set((state) => ({
                        nextSessions: {
                            ...state.nextSessions,
                            [tableId]: null,
                        },
                        isDeletingSession: false,
                    }));
                    await get().fetchNextSession(tableId);
                    await get().fetchSessionHistory(tableId);
                } else {
                    set({ isDeletingSession: false });
                }

                return { success: true };
            } else {
                set({ isDeletingSession: false, error: data.error });
                return { success: false, error: data.error };
            }
        } catch {
            set({ isDeletingSession: false, error: "Erreur réseau" });
            return { success: false, error: "Erreur réseau" };
        }
    },

    fetchPrivateMessages: async (tableId: string, recipientUserId: string, page = 1) => {
        const conversationKey = `${tableId}:${recipientUserId}`;
        set({ isLoadingPrivateMessages: true, error: null });
        try {
            const params = new URLSearchParams({
                recipient_user_id: recipientUserId,
                page: String(page),
            });
            const res = await fetch(`/api/tables/${tableId}/private-messages?${params}`);
            const data = await res.json();
            if (res.ok) {
                set((state) => ({
                    privateMessages: {
                        ...state.privateMessages,
                        [conversationKey]: data,
                    },
                    isLoadingPrivateMessages: false,
                }));
            } else {
                set({
                    error: data.error || "Erreur lors de la récupération des messages privés",
                    isLoadingPrivateMessages: false,
                });
            }
        } catch {
            set({ error: "Erreur réseau", isLoadingPrivateMessages: false });
        }
    },

    sendPrivateMessage: async (
        tableId: string,
        recipientUserId: string,
        content: string,
        sessionId?: string,
    ) => {
        set({ isSendingPrivateMessage: true, error: null });
        try {
            const res = await fetch(`/api/tables/${tableId}/private-messages`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    recipient_user_id: recipientUserId,
                    content,
                    session_id: sessionId || null,
                }),
            });
            const data = await res.json();
            if (res.ok) {
                await get().fetchPrivateMessages(tableId, recipientUserId);
                set({ isSendingPrivateMessage: false });
                return { success: true };
            } else {
                set({ isSendingPrivateMessage: false, error: data.error });
                return {
                    success: false,
                    error: data.error || "Erreur lors de l'envoi du message privé",
                };
            }
        } catch {
            set({ isSendingPrivateMessage: false, error: "Erreur réseau" });
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
                return data;
            } else {
                set({
                    error: data.error || "Erreur lors de la récupération de la présence",
                    isLoadingPresence: false,
                });
                return null;
            }
        } catch {
            set({ error: "Erreur réseau", isLoadingPresence: false });
            return null;
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
        } catch {
            set({ isSavingPresence: false, error: "Erreur réseau" });
            return { success: false, error: "Erreur réseau" };
        }
    },

    fetchPersonalNote: async (sessionId: string) => {
        set({ isLoadingPersonalNote: true, error: null });
        try {
            const res = await fetch(`/api/sessions/${sessionId}/notes/personal`);
            const data = await res.json();
            if (res.ok) {
                set((state) => ({
                    personalNotes: {
                        ...state.personalNotes,
                        [sessionId]: data.note,
                    },
                    isLoadingPersonalNote: false,
                }));
            } else {
                set({
                    error: data.error || "Erreur lors de la récupération de votre note",
                    isLoadingPersonalNote: false,
                });
            }
        } catch {
            set({ error: "Erreur réseau", isLoadingPersonalNote: false });
        }
    },

    savePersonalNote: async (sessionId: string, content: string) => {
        set({ isSavingPersonalNote: true, error: null });
        try {
            const res = await fetch(`/api/sessions/${sessionId}/notes/personal`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content }),
            });
            const data = await res.json();
            if (res.ok) {
                set((state) => ({
                    personalNotes: {
                        ...state.personalNotes,
                        [sessionId]: data.note,
                    },
                    isSavingPersonalNote: false,
                }));
                return { success: true };
            } else {
                set({ isSavingPersonalNote: false, error: data.error });
                return { success: false, error: data.error };
            }
        } catch {
            set({ isSavingPersonalNote: false, error: "Erreur réseau" });
            return { success: false, error: "Erreur réseau" };
        }
    },

    fetchGroupNote: async (sessionId: string) => {
        set({ isLoadingGroupNote: true, error: null });
        try {
            const res = await fetch(`/api/sessions/${sessionId}/notes/group`);
            const data = await res.json();
            if (res.ok) {
                set((state) => ({
                    groupNotes: {
                        ...state.groupNotes,
                        [sessionId]: data.note,
                    },
                    isLoadingGroupNote: false,
                }));
                return data.note;
            } else {
                set({
                    error: data.error || "Erreur lors de la récupération de la note de groupe",
                    isLoadingGroupNote: false,
                });
                return undefined;
            }
        } catch {
            set({ error: "Erreur réseau", isLoadingGroupNote: false });
            return undefined;
        }
    },

    saveGroupNote: async (sessionId: string, content: string, expectedUpdatedAt: string | null) => {
        set({ isSavingGroupNote: true, error: null });
        try {
            const res = await fetch(`/api/sessions/${sessionId}/notes/group`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content, expectedUpdatedAt }),
            });
            const data = await res.json();
            if (res.ok) {
                set((state) => ({
                    groupNotes: {
                        ...state.groupNotes,
                        [sessionId]: data.note,
                    },
                    isSavingGroupNote: false,
                }));
                return { success: true, note: data.note };
            } else {
                set({ isSavingGroupNote: false, error: data.error });
                return {
                    success: false,
                    error: data.error,
                    code: data.code,
                };
            }
        } catch {
            set({ isSavingGroupNote: false, error: "Erreur réseau" });
            return { success: false, error: "Erreur réseau" };
        }
    },
}));
