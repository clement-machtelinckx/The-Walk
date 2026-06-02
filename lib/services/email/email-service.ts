import { ValidationError } from "@/lib/errors";
import { getEmailRuntimeConfig, resolveEmailProvider } from "@/lib/email/config";
import type { EmailAddress, EmailProvider } from "@/lib/email/types";
import { EmailDeliveryRepository } from "@/lib/repositories/email-delivery-repository";
import type { EmailUsageSummary, TransactionalEmailType } from "@/types/email";

export interface TransactionalEmailInput {
    emailType: TransactionalEmailType;
    to: EmailAddress;
    subject: string;
    html?: string;
    text?: string;
    senderUserId?: string | null;
    metadata?: Record<string, unknown> | null;
}

function getCurrentMonthStart(): string {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
}

function getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : "Erreur inconnue lors de l'envoi email.";
}

function resolveDeliveryTarget(
    originalRecipient: EmailAddress,
    alwaysMailTo: EmailAddress | null,
    metadata?: Record<string, unknown> | null,
) {
    if (!alwaysMailTo) {
        return {
            recipient: originalRecipient,
            metadata,
        };
    }

    return {
        recipient: alwaysMailTo,
        metadata: {
            ...metadata,
            originalRecipientEmail: originalRecipient.email,
            originalRecipientName: originalRecipient.name || null,
            effectiveRecipientEmail: alwaysMailTo.email,
            alwaysMailToApplied: true,
        },
    };
}

export const EmailService = {
    async sendTransactionalEmail(
        input: TransactionalEmailInput,
        provider: EmailProvider = resolveEmailProvider(),
    ) {
        if (!input.html && !input.text) {
            throw new ValidationError("Un email transactionnel doit contenir du HTML ou du texte.");
        }

        const config = getEmailRuntimeConfig();
        const deliveryTarget = resolveDeliveryTarget(input.to, config.alwaysMailTo, input.metadata);
        const monthStart = getCurrentMonthStart();

        if (input.senderUserId) {
            const sentThisMonth = await EmailDeliveryRepository.countSentByUserSince(
                input.senderUserId,
                monthStart,
            );

            if (sentThisMonth >= config.monthlyQuota) {
                await EmailDeliveryRepository.create({
                    emailType: input.emailType,
                    recipientEmail: deliveryTarget.recipient.email,
                    senderUserId: input.senderUserId,
                    status: "quota_blocked",
                    provider: provider.name,
                    errorMessage: `Quota mensuel dépassé (${config.monthlyQuota} emails).`,
                    metadata: deliveryTarget.metadata,
                });

                throw new ValidationError(
                    `Quota mensuel d'emails atteint (${config.monthlyQuota}/${config.monthlyQuota}).`,
                );
            }
        }

        try {
            const result = await provider.send({
                to: deliveryTarget.recipient,
                subject: input.subject,
                html: input.html,
                text: input.text,
                from: config.from,
            });

            const log = await EmailDeliveryRepository.create({
                emailType: input.emailType,
                recipientEmail: deliveryTarget.recipient.email,
                senderUserId: input.senderUserId,
                status: "sent",
                provider: provider.name,
                providerMessageId: result.providerMessageId,
                metadata: deliveryTarget.metadata,
            });

            return {
                success: true,
                log,
            };
        } catch (error) {
            await EmailDeliveryRepository.create({
                emailType: input.emailType,
                recipientEmail: deliveryTarget.recipient.email,
                senderUserId: input.senderUserId,
                status: "failed",
                provider: provider.name,
                errorMessage: getErrorMessage(error),
                metadata: deliveryTarget.metadata,
            });

            throw error;
        }
    },

    async getUsageForUser(userId: string): Promise<EmailUsageSummary> {
        const config = getEmailRuntimeConfig();
        const monthStart = getCurrentMonthStart();
        const [sentThisMonth, byType] = await Promise.all([
            EmailDeliveryRepository.countSentByUserSince(userId, monthStart),
            EmailDeliveryRepository.countSentByTypeSince(userId, monthStart),
        ]);

        return {
            limit: config.monthlyQuota,
            sentThisMonth,
            remaining: Math.max(config.monthlyQuota - sentThisMonth, 0),
            periodStart: monthStart,
            byType,
        };
    },
};
