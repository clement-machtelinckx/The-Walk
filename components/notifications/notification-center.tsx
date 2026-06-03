"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Check, CheckCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { formatShortDate } from "@/lib/utils/date";
import { cn } from "@/lib/utils";
import type { Notification } from "@/types/notification";

interface NotificationsResponse {
    data: Notification[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

interface UnreadCountResponse {
    unreadCount: number;
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
    const response = await fetch(url, init);
    const payload = (await response.json()) as T & { error?: string };

    if (!response.ok) {
        throw new Error(payload.error || "Une erreur est survenue.");
    }

    return payload;
}

export function NotificationCenter() {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isMarkingAll, setIsMarkingAll] = useState(false);
    const [activeNotificationId, setActiveNotificationId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const refreshUnreadCount = useCallback(async () => {
        const data = await fetchJson<UnreadCountResponse>("/api/notifications/unread-count");
        setUnreadCount(data.unreadCount);
    }, []);

    const refreshNotifications = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const data = await fetchJson<NotificationsResponse>("/api/notifications?limit=20");
            setNotifications(data.data);
            await refreshUnreadCount();
        } catch (fetchError) {
            setError(
                fetchError instanceof Error
                    ? fetchError.message
                    : "Impossible de charger les notifications.",
            );
        } finally {
            setIsLoading(false);
        }
    }, [refreshUnreadCount]);

    useEffect(() => {
        refreshUnreadCount().catch(() => {
            setUnreadCount(0);
        });
    }, [refreshUnreadCount]);

    useEffect(() => {
        if (isOpen) {
            refreshNotifications();
        }
    }, [isOpen, refreshNotifications]);

    const markAsRead = async (notification: Notification) => {
        setActiveNotificationId(notification.id);
        setError(null);

        try {
            if (!notification.is_read) {
                await fetchJson<{ notification: Notification }>(
                    `/api/notifications/${notification.id}/read`,
                    { method: "PATCH" },
                );
                setNotifications((current) =>
                    current.map((item) =>
                        item.id === notification.id
                            ? { ...item, is_read: true, read_at: new Date().toISOString() }
                            : item,
                    ),
                );
                setUnreadCount((current) => Math.max(current - 1, 0));
            }

            if (notification.href) {
                setIsOpen(false);
                router.push(notification.href);
            }
        } catch (markError) {
            setError(
                markError instanceof Error
                    ? markError.message
                    : "Impossible de marquer la notification comme lue.",
            );
        } finally {
            setActiveNotificationId(null);
        }
    };

    const markAllAsRead = async () => {
        setIsMarkingAll(true);
        setError(null);

        try {
            await fetchJson<{ updatedCount: number }>("/api/notifications/read-all", {
                method: "PATCH",
            });
            setNotifications((current) =>
                current.map((notification) => ({
                    ...notification,
                    is_read: true,
                    read_at: notification.read_at || new Date().toISOString(),
                })),
            );
            setUnreadCount(0);
        } catch (markError) {
            setError(
                markError instanceof Error
                    ? markError.message
                    : "Impossible de marquer les notifications comme lues.",
            );
        } finally {
            setIsMarkingAll(false);
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon-sm"
                    className="relative"
                    aria-label="Ouvrir les notifications"
                >
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                        <span className="bg-destructive text-destructive-foreground absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent className="w-full gap-0 p-0 sm:max-w-md">
                <SheetHeader className="border-b p-4">
                    <div className="flex items-start justify-between gap-4 pr-8">
                        <div>
                            <SheetTitle>Notifications</SheetTitle>
                            <SheetDescription>
                                Les derniers signaux importants de votre espace.
                            </SheetDescription>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={markAllAsRead}
                            disabled={unreadCount === 0 || isMarkingAll}
                        >
                            {isMarkingAll ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <CheckCheck className="h-4 w-4" />
                            )}
                            Tout lu
                        </Button>
                    </div>
                </SheetHeader>

                <div className="min-h-0 flex-1 overflow-y-auto">
                    {isLoading ? (
                        <div className="text-muted-foreground flex items-center justify-center gap-2 p-8 text-sm">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Chargement des notifications...
                        </div>
                    ) : error ? (
                        <div className="text-destructive p-4 text-sm font-medium">{error}</div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                            <div className="bg-muted mb-3 rounded-full p-3">
                                <Bell className="text-muted-foreground h-5 w-5" />
                            </div>
                            <p className="font-semibold">Aucune notification</p>
                            <p className="text-muted-foreground mt-1 text-sm">
                                Les prochains événements importants apparaîtront ici.
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {notifications.map((notification) => {
                                const isActive = activeNotificationId === notification.id;

                                return (
                                    <button
                                        key={notification.id}
                                        type="button"
                                        onClick={() => markAsRead(notification)}
                                        className={cn(
                                            "hover:bg-muted/60 flex w-full gap-3 px-4 py-3 text-left transition-colors",
                                            !notification.is_read && "bg-primary/5",
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                "mt-1 h-2 w-2 shrink-0 rounded-full",
                                                notification.is_read
                                                    ? "bg-muted-foreground/25"
                                                    : "bg-primary",
                                            )}
                                        />
                                        <span className="min-w-0 flex-1 space-y-1">
                                            <span className="flex items-start justify-between gap-3">
                                                <span className="line-clamp-2 text-sm font-semibold">
                                                    {notification.title}
                                                </span>
                                                {isActive ? (
                                                    <Loader2 className="text-muted-foreground h-4 w-4 shrink-0 animate-spin" />
                                                ) : notification.is_read ? (
                                                    <Check className="text-muted-foreground h-4 w-4 shrink-0" />
                                                ) : null}
                                            </span>
                                            {notification.body && (
                                                <span className="text-muted-foreground line-clamp-2 text-sm">
                                                    {notification.body}
                                                </span>
                                            )}
                                            <span className="text-muted-foreground block text-xs">
                                                {formatShortDate(notification.created_at)}
                                            </span>
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
