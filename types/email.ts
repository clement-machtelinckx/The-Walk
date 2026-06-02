export type TransactionalEmailType =
    | "invitation"
    | "group_invitation"
    | "signup_confirmation"
    | "session_reminder"
    | "login_token"
    | "password_changed"
    | "generic";

export type EmailDeliveryStatus = "sent" | "failed" | "quota_blocked";

export type EmailProviderName = "mailtrap" | "brevo";

export interface EmailDeliveryLog {
    id: string;
    email_type: TransactionalEmailType;
    recipient_email: string;
    sender_user_id: string | null;
    status: EmailDeliveryStatus;
    provider: EmailProviderName | null;
    provider_message_id: string | null;
    error_message: string | null;
    metadata: Record<string, unknown> | null;
    created_at: string;
}

export interface EmailUsageSummary {
    limit: number;
    sentThisMonth: number;
    remaining: number;
    periodStart: string;
    byType: Array<{
        emailType: TransactionalEmailType;
        count: number;
    }>;
}
