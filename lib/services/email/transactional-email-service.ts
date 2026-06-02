import { EmailService } from "@/lib/services/email/email-service";
import {
    buildSessionReminderEmail,
    buildSignupConfirmationEmail,
    buildTableInvitationEmail,
} from "@/lib/email/templates";
import { MembershipService } from "@/lib/services/memberships/membership-service";
import { SessionRepository } from "@/lib/repositories/session-repository";
import { TableRepository } from "@/lib/repositories/table-repository";
import { ForbiddenError, ValidationError } from "@/lib/errors";
import type { TableRole } from "@/types/table";

function getAppUrl(): string {
    const configuredUrl =
        process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || process.env.VERCEL_URL;

    if (!configuredUrl) {
        return "http://localhost:3000";
    }

    return configuredUrl.startsWith("http") ? configuredUrl : `https://${configuredUrl}`;
}

function buildAppUrl(path: string): string {
    const baseUrl = getAppUrl().replace(/\/$/, "");
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `${baseUrl}${normalizedPath}`;
}

async function sendAndLogNonBlocking(sendEmail: () => Promise<unknown>, context: string) {
    try {
        await sendEmail();
    } catch (error) {
        console.error(`[TRANSACTIONAL_EMAIL:${context}]`, error);
    }
}

export interface SessionReminderSummary {
    sent: number;
    failed: number;
    skipped: number;
}

export interface TableInvitationEmailInput {
    senderUserId: string;
    recipientEmail: string;
    tableId: string;
    invitationId: string;
    invitationToken: string;
    tableName: string;
    role: TableRole;
}

export interface SignupConfirmationEmailInput {
    recipientEmail: string;
}

export interface SessionReminderEmailInput {
    senderUserId: string;
    recipientEmail: string;
    recipientName?: string | null;
    tableId: string;
    sessionId: string;
    tableName: string;
    sessionTitle: string;
    scheduledAt: string | null;
}

export const TransactionalEmailService = {
    async sendTableInvitation(input: TableInvitationEmailInput) {
        const invitationUrl = buildAppUrl(`/invitation/${input.invitationToken}`);
        const content = buildTableInvitationEmail({
            tableName: input.tableName,
            role: input.role,
            invitationUrl,
        });

        return EmailService.sendTransactionalEmail({
            emailType: "invitation",
            to: { email: input.recipientEmail },
            subject: content.subject,
            html: content.html,
            text: content.text,
            senderUserId: input.senderUserId,
            metadata: {
                tableId: input.tableId,
                invitationId: input.invitationId,
            },
        });
    },

    async sendTableInvitationNonBlocking(input: TableInvitationEmailInput): Promise<void> {
        await sendAndLogNonBlocking(() => this.sendTableInvitation(input), "table_invitation");
    },

    async sendSignupConfirmation(input: SignupConfirmationEmailInput) {
        const appUrl = buildAppUrl("/tables");
        const content = buildSignupConfirmationEmail({ appUrl });

        return EmailService.sendTransactionalEmail({
            emailType: "signup_confirmation",
            to: { email: input.recipientEmail },
            subject: content.subject,
            html: content.html,
            text: content.text,
            metadata: {
                source: "signup",
            },
        });
    },

    async sendSignupConfirmationNonBlocking(input: SignupConfirmationEmailInput): Promise<void> {
        await sendAndLogNonBlocking(
            () => this.sendSignupConfirmation(input),
            "signup_confirmation",
        );
    },

    async sendSessionReminder(input: SessionReminderEmailInput) {
        const sessionUrl = buildAppUrl(`/tables/${input.tableId}`);
        const content = buildSessionReminderEmail({
            tableName: input.tableName,
            sessionTitle: input.sessionTitle,
            scheduledAt: input.scheduledAt,
            sessionUrl,
        });

        return EmailService.sendTransactionalEmail({
            emailType: "session_reminder",
            to: {
                email: input.recipientEmail,
                name: input.recipientName || undefined,
            },
            subject: content.subject,
            html: content.html,
            text: content.text,
            senderUserId: input.senderUserId,
            metadata: {
                tableId: input.tableId,
                sessionId: input.sessionId,
            },
        });
    },

    async sendReminderForSession(
        actorUserId: string,
        sessionId: string,
    ): Promise<SessionReminderSummary> {
        const session = await SessionRepository.getById(sessionId);
        if (session.status !== "scheduled") {
            throw new ValidationError(
                "Un rappel ne peut être envoyé que pour une session planifiée.",
            );
        }

        const actorMembership = await MembershipService.requireMembership(
            actorUserId,
            session.table_id,
        );

        if (actorMembership.role !== "gm") {
            throw new ForbiddenError("Seul le Maître du Jeu peut envoyer un rappel de session.");
        }

        const [table, members] = await Promise.all([
            TableRepository.getById(session.table_id),
            MembershipService.listMembers(session.table_id),
        ]);

        const summary: SessionReminderSummary = {
            sent: 0,
            failed: 0,
            skipped: 0,
        };

        for (const member of members) {
            if (!member.profile?.email) {
                summary.skipped += 1;
                continue;
            }

            try {
                await this.sendSessionReminder({
                    senderUserId: actorUserId,
                    recipientEmail: member.profile.email,
                    recipientName: member.profile.display_name,
                    tableId: session.table_id,
                    sessionId: session.id,
                    tableName: table.name,
                    sessionTitle: session.title,
                    scheduledAt: session.scheduled_at,
                });
                summary.sent += 1;
            } catch (error) {
                console.error("[TRANSACTIONAL_EMAIL:session_reminder]", error);
                summary.failed += 1;
            }
        }

        return summary;
    },
};
