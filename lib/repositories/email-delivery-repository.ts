import { getServiceRoleClient } from "@/lib/db";
import { handleDbError } from "./_shared/base";
import type {
    EmailDeliveryLog,
    EmailDeliveryStatus,
    EmailProviderName,
    TransactionalEmailType,
} from "@/types/email";

interface CreateEmailDeliveryLogInput {
    emailType: TransactionalEmailType;
    recipientEmail: string;
    senderUserId?: string | null;
    status: EmailDeliveryStatus;
    provider?: EmailProviderName | null;
    providerMessageId?: string | null;
    errorMessage?: string | null;
    metadata?: Record<string, unknown> | null;
}

export const EmailDeliveryRepository = {
    async create(input: CreateEmailDeliveryLogInput): Promise<EmailDeliveryLog> {
        const supabase = getServiceRoleClient();
        const { data, error } = await supabase
            .from("email_delivery_logs")
            .insert({
                email_type: input.emailType,
                recipient_email: input.recipientEmail,
                sender_user_id: input.senderUserId || null,
                status: input.status,
                provider: input.provider || null,
                provider_message_id: input.providerMessageId || null,
                error_message: input.errorMessage || null,
                metadata: input.metadata || null,
            })
            .select()
            .single();

        handleDbError(error, "EmailDeliveryRepository.create");
        return data;
    },

    async countSentByUserSince(userId: string, since: string): Promise<number> {
        const supabase = getServiceRoleClient();
        const { count, error } = await supabase
            .from("email_delivery_logs")
            .select("id", { count: "exact", head: true })
            .eq("sender_user_id", userId)
            .eq("status", "sent")
            .gte("created_at", since);

        handleDbError(error, "EmailDeliveryRepository.countSentByUserSince");
        return count || 0;
    },

    async countSentByTypeSince(
        userId: string,
        since: string,
    ): Promise<Array<{ emailType: TransactionalEmailType; count: number }>> {
        const supabase = getServiceRoleClient();
        const { data, error } = await supabase
            .from("email_delivery_logs")
            .select("email_type")
            .eq("sender_user_id", userId)
            .eq("status", "sent")
            .gte("created_at", since);

        handleDbError(error, "EmailDeliveryRepository.countSentByTypeSince");

        const counts = new Map<TransactionalEmailType, number>();
        (data || []).forEach((row: { email_type: TransactionalEmailType }) => {
            counts.set(row.email_type, (counts.get(row.email_type) || 0) + 1);
        });

        return Array.from(counts.entries()).map(([emailType, count]) => ({
            emailType,
            count,
        }));
    },
};
