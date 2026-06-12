import { create } from "zustand";
import { TableDiscussionData, TableMessage } from "@/types/discussion";

function mergeMessages(...messageGroups: TableMessage[][]): TableMessage[] {
    const messagesById = new Map<string, TableMessage>();

    for (const messages of messageGroups) {
        for (const message of messages) {
            messagesById.set(message.id, message);
        }
    }

    return [...messagesById.values()].sort((left, right) => {
        const dateComparison = left.created_at.localeCompare(right.created_at);
        return dateComparison || left.id.localeCompare(right.id);
    });
}

interface DiscussionState {
    discussions: Record<string, TableDiscussionData | null>;
    isLoadingDiscussion: boolean;
    isLoadingDiscussionHistory: boolean;
    isSendingDiscussionMessage: boolean;
    error: string | null;
    fetchDiscussionMessages: (tableId: string) => Promise<void>;
    loadOlderDiscussionMessages: (tableId: string) => Promise<void>;
    sendDiscussionMessage: (
        tableId: string,
        content: string,
        sessionId?: string,
    ) => Promise<{ success: boolean; error?: string }>;
}

export const useDiscussionStore = create<DiscussionState>((set, get) => ({
    discussions: {},
    isLoadingDiscussion: false,
    isLoadingDiscussionHistory: false,
    isSendingDiscussionMessage: false,
    error: null,

    fetchDiscussionMessages: async (tableId: string) => {
        set({ isLoadingDiscussion: true, error: null });
        try {
            const res = await fetch(`/api/tables/${tableId}/discussion?page=1`);
            const data = await res.json();
            if (res.ok) {
                set((state) => ({
                    discussions: {
                        ...state.discussions,
                        [tableId]: {
                            ...data,
                            data: mergeMessages(state.discussions[tableId]?.data || [], data.data),
                            page: Math.max(state.discussions[tableId]?.page || 1, 1),
                        },
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

    loadOlderDiscussionMessages: async (tableId: string) => {
        const discussion = get().discussions[tableId];
        if (
            !discussion ||
            discussion.page >= discussion.totalPages ||
            get().isLoadingDiscussionHistory
        ) {
            return;
        }

        const nextPage = discussion.page + 1;
        set({ isLoadingDiscussionHistory: true, error: null });

        try {
            const res = await fetch(`/api/tables/${tableId}/discussion?page=${nextPage}`);
            const data = await res.json();
            if (res.ok) {
                set((state) => {
                    const currentDiscussion = state.discussions[tableId];
                    return {
                        discussions: {
                            ...state.discussions,
                            [tableId]: {
                                ...data,
                                data: mergeMessages(data.data, currentDiscussion?.data || []),
                                page: Math.max(currentDiscussion?.page || 1, data.page),
                            },
                        },
                        isLoadingDiscussionHistory: false,
                    };
                });
            } else {
                set({
                    error: data.error || "Erreur lors de la récupération des anciens messages",
                    isLoadingDiscussionHistory: false,
                });
            }
        } catch {
            set({ error: "Erreur réseau", isLoadingDiscussionHistory: false });
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
