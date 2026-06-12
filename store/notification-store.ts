import { create } from "zustand";

import type { Notification } from "@/types/notification";

interface NotificationsResponse {
    data: Notification[];
}

interface NotificationStore {
    notifications: Notification[];
    unreadCount: number;
    isLoading: boolean;
    isMarkingAll: boolean;
    error: string | null;
    fetchUnreadCount: () => Promise<void>;
    fetchNotifications: () => Promise<void>;
    markAsRead: (notificationId: string) => Promise<{ success: boolean; error?: string }>;
    markAllAsRead: () => Promise<{ success: boolean; error?: string }>;
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
    const response = await fetch(url, init);
    const payload = (await response.json()) as T & { error?: string };

    if (!response.ok) {
        throw new Error(payload.error || "Une erreur est survenue.");
    }

    return payload;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    isMarkingAll: false,
    error: null,

    fetchUnreadCount: async () => {
        try {
            const data = await fetchJson<{ unreadCount: number }>(
                "/api/notifications/unread-count",
            );
            set({ unreadCount: data.unreadCount });
        } catch {
            set({ unreadCount: 0 });
        }
    },

    fetchNotifications: async () => {
        set({ isLoading: true, error: null });

        try {
            const notifications = await fetchJson<NotificationsResponse>(
                "/api/notifications?limit=20",
            );
            set({ notifications: notifications.data });

            const unread = await fetchJson<{ unreadCount: number }>(
                "/api/notifications/unread-count",
            );
            set({ unreadCount: unread.unreadCount, isLoading: false });
        } catch (error) {
            set({
                error:
                    error instanceof Error
                        ? error.message
                        : "Impossible de charger les notifications.",
                isLoading: false,
            });
        }
    },

    markAsRead: async (notificationId: string) => {
        set({ error: null });
        const notification = get().notifications.find((item) => item.id === notificationId);
        if (notification?.is_read) return { success: true };

        try {
            const data = await fetchJson<{ notification: Notification }>(
                `/api/notifications/${notificationId}/read`,
                { method: "PATCH" },
            );
            set((state) => ({
                notifications: state.notifications.map((item) =>
                    item.id === notificationId ? data.notification : item,
                ),
                unreadCount: Math.max(state.unreadCount - 1, 0),
            }));
            return { success: true };
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Impossible de marquer la notification comme lue.";
            set({ error: message });
            return { success: false, error: message };
        }
    },

    markAllAsRead: async () => {
        set({ isMarkingAll: true, error: null });

        try {
            await fetchJson<{ updatedCount: number }>("/api/notifications/read-all", {
                method: "PATCH",
            });
            set((state) => ({
                notifications: state.notifications.map((notification) => ({
                    ...notification,
                    is_read: true,
                    read_at: notification.read_at || new Date().toISOString(),
                })),
                unreadCount: 0,
                isMarkingAll: false,
            }));
            return { success: true };
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Impossible de marquer les notifications comme lues.";
            set({ error: message, isMarkingAll: false });
            return { success: false, error: message };
        }
    },
}));
