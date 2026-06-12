"use client";

import { useEffect, useState } from "react";
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
import { useNotificationStore } from "@/store/notification-store";

export function NotificationCenter() {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [activeNotificationId, setActiveNotificationId] = useState<string | null>(null);
    const notifications = useNotificationStore((state) => state.notifications);
    const unreadCount = useNotificationStore((state) => state.unreadCount);
    const isLoading = useNotificationStore((state) => state.isLoading);
    const isMarkingAll = useNotificationStore((state) => state.isMarkingAll);
    const error = useNotificationStore((state) => state.error);
    const fetchUnreadCount = useNotificationStore((state) => state.fetchUnreadCount);
    const fetchNotifications = useNotificationStore((state) => state.fetchNotifications);
    const markNotificationAsRead = useNotificationStore((state) => state.markAsRead);
    const markAllNotificationsAsRead = useNotificationStore((state) => state.markAllAsRead);

    useEffect(() => {
        fetchUnreadCount();
    }, [fetchUnreadCount]);

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [fetchNotifications, isOpen]);

    const markAsRead = async (notification: Notification) => {
        setActiveNotificationId(notification.id);
        const result = await markNotificationAsRead(notification.id);

        if (result.success && notification.href) {
            setIsOpen(false);
            router.push(notification.href);
        }
        setActiveNotificationId(null);
    };

    const markAllAsRead = async () => {
        await markAllNotificationsAsRead();
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
