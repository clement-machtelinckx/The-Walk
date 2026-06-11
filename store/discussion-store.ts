import { create } from "zustand";
import { TableDiscussionData } from "@/types/discussion";

interface DiscussionState {
    discussions: Record<string, TableDiscussionData | null>;
    isLoadingDiscussion: boolean;
    isSendingDiscussionMessage: boolean;
    error: string | null;
    fetchDiscussionMessages: (tableId: string, page?: number) => Promise<void>;
    sendDiscussionMessage: (
        tableId: string,
        content: string,
        sessionId?: string,
    ) => Promise<{ success: boolean; error?: string }>;
}

export const useDiscussionStore = create<DiscussionState>((set, get) => ({
    discussions: {},
    isLoadingDiscussion: false,
    isSendingDiscussionMessage: false,
    error: null,

    fetchDiscussionMessages: async (tableId: string, page = 1) => {
        set({ isLoadingDiscussion: true, error: null });
        try {
            const res = await fetch(`/api/tables/${tableId}/discussion?page=${page}`);
            const data = await res.json();
            if (res.ok) {
                set((state) => ({
                    discussions: {
                        ...state.discussions,
                        [tableId]: data,
                    },
                    isLoadingDiscussion: false,
                }));
            } else {
                set({
                    error: data.error || "Erreur lors de la récupération des messages",
                    isLoadingDiscussion: false,
                });
            }
        } catch {
            set({ error: "Erreur réseau", isLoadingDiscussion: false });
        }
    },

    sendDiscussionMessage: async (tableId: string, content: string, sessionId?: string) => {
        set({ isSendingDiscussionMessage: true, error: null });
        try {
            const res = await fetch(`/api/tables/${tableId}/discussion`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content, session_id: sessionId || null }),
            });
            const data = await res.json();
            if (res.ok) {
                await get().fetchDiscussionMessages(tableId);
                set({ isSendingDiscussionMessage: false });
                return { success: true };
            }

            set({ isSendingDiscussionMessage: false, error: data.error });
            return {
                success: false,
                error: data.error || "Erreur lors de l'envoi du message",
            };
        } catch {
            set({ isSendingDiscussionMessage: false, error: "Erreur réseau" });
            return { success: false, error: "Erreur réseau" };
        }
    },
}));
