import type { EmailAddress, EmailProvider } from "./types";
import { BrevoEmailProvider } from "./providers/brevo";
import { MailtrapEmailProvider } from "./providers/mailtrap";
import type { EmailProviderName } from "@/types/email";

export const DEFAULT_MONTHLY_EMAIL_QUOTA = 20;

export interface EmailRuntimeConfig {
    providerName: EmailProviderName;
    from: EmailAddress;
    monthlyQuota: number;
    alwaysMailTo: EmailAddress | null;
}

function resolveProviderName(): EmailProviderName {
    const configuredProvider = process.env.EMAIL_PROVIDER?.toLowerCase();
    if (configuredProvider === "mailtrap" || configuredProvider === "brevo") {
        return configuredProvider;
    }

    return process.env.NODE_ENV === "production" ? "brevo" : "mailtrap";
}

function resolveMonthlyQuota(): number {
    const quota = Number.parseInt(
        process.env.EMAIL_MONTHLY_QUOTA || String(DEFAULT_MONTHLY_EMAIL_QUOTA),
    );

    return Number.isFinite(quota) && quota > 0 ? quota : DEFAULT_MONTHLY_EMAIL_QUOTA;
}

function resolveAlwaysMailTo(): EmailAddress | null {
    const email = process.env.ALWAYS_MAIL_TO?.trim();

    return email ? { email } : null;
}

export function getEmailRuntimeConfig(): EmailRuntimeConfig {
    return {
        providerName: resolveProviderName(),
        from: {
            email: process.env.EMAIL_FROM_EMAIL || "noreply@the-walk.local",
            name: process.env.EMAIL_FROM_NAME || "The-Walk",
        },
        monthlyQuota: resolveMonthlyQuota(),
        alwaysMailTo: resolveAlwaysMailTo(),
    };
}

export function resolveEmailProvider(): EmailProvider {
    const config = getEmailRuntimeConfig();

    if (config.providerName === "brevo") {
        return new BrevoEmailProvider({
            apiKey: process.env.BREVO_API_KEY,
            apiUrl: process.env.BREVO_API_URL,
            defaultFrom: config.from,
        });
    }

    return new MailtrapEmailProvider({
        apiToken: process.env.MAILTRAP_API_TOKEN,
        apiUrl: process.env.MAILTRAP_API_URL,
        defaultFrom: config.from,
    });
}
