export interface Notification {
    id: string;
    user_id: string;
    type: string;
    title: string;
    body: string | null;
    resource_type: string | null;
    resource_id: string | null;
    href: string | null;
    data: Record<string, unknown> | null;
    is_read: boolean;
    created_at: string;
    read_at: string | null;
}

export interface NotificationUnreadCount {
    unreadCount: number;
}
