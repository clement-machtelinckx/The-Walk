import { beforeEach, describe, expect, it, vi } from "vitest";

import { useNotificationStore } from "./notification-store";
import type { Notification } from "@/types/notification";

describe("useNotificationStore", () => {
    const notification: Notification = {
        id: "44444444-4444-4444-8444-444444444444",
        user_id: "22222222-2222-4222-8222-222222222222",
        type: "test",
        title: "Notification",
        body: null,
        resource_type: null,
        resource_id: null,
        href: null,
        data: null,
        is_read: false,
        created_at: "2026-06-12T12:00:00.000Z",
        read_at: null,
    };

    beforeEach(() => {
        vi.restoreAllMocks();
        useNotificationStore.setState({
            notifications: [],
            unreadCount: 0,
            isLoading: false,
            isMarkingAll: false,
            error: null,
        });
    });

    it("loads notifications and unread count", async () => {
        vi.stubGlobal(
            "fetch",
            vi
                .fn()
                .mockResolvedValueOnce({
                    ok: true,
                    json: vi.fn().mockResolvedValue({ data: [notification] }),
                })
                .mockResolvedValueOnce({
                    ok: true,
                    json: vi.fn().mockResolvedValue({ unreadCount: 1 }),
                }),
        );

        await useNotificationStore.getState().fetchNotifications();

        expect(fetch).toHaveBeenNthCalledWith(1, "/api/notifications?limit=20", undefined);
        expect(fetch).toHaveBeenNthCalledWith(2, "/api/notifications/unread-count", undefined);
        expect(useNotificationStore.getState()).toMatchObject({
            notifications: [notification],
            unreadCount: 1,
            isLoading: false,
            error: null,
        });
    });

    it("marks one notification as read and updates the count", async () => {
        const readNotification = {
            ...notification,
            is_read: true,
            read_at: "2026-06-12T12:05:00.000Z",
        };
        useNotificationStore.setState({ notifications: [notification], unreadCount: 1 });
        vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue({
                ok: true,
                json: vi.fn().mockResolvedValue({ notification: readNotification }),
            }),
        );

        const result = await useNotificationStore.getState().markAsRead(notification.id);

        expect(result).toEqual({ success: true });
        expect(fetch).toHaveBeenCalledWith(`/api/notifications/${notification.id}/read`, {
            method: "PATCH",
        });
        expect(useNotificationStore.getState()).toMatchObject({
            notifications: [readNotification],
            unreadCount: 0,
        });
    });

    it("surfaces API errors when marking all notifications as read", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue({
                ok: false,
                json: vi.fn().mockResolvedValue({ error: "Accès refusé" }),
            }),
        );

        const result = await useNotificationStore.getState().markAllAsRead();

        expect(result).toEqual({ success: false, error: "Accès refusé" });
        expect(useNotificationStore.getState()).toMatchObject({
            isMarkingAll: false,
            error: "Accès refusé",
        });
    });
});
