import type { EmailAddress, EmailProvider, SendEmailPayload } from "../types";

interface BrevoEmailProviderConfig {
    apiKey?: string;
    apiUrl?: string;
    defaultFrom: EmailAddress;
}

interface BrevoResponse {
    messageId?: string;
    messageIds?: string[];
    message?: string;
}

export class BrevoEmailProvider implements EmailProvider {
    name = "brevo" as const;

    private readonly apiKey?: string;
    private readonly apiUrl: string;
    private readonly defaultFrom: EmailAddress;

    constructor(config: BrevoEmailProviderConfig) {
        this.apiKey = config.apiKey;
        this.apiUrl = config.apiUrl || "https://api.brevo.com/v3/smtp/email";
        this.defaultFrom = config.defaultFrom;
    }

    async send(payload: SendEmailPayload) {
        if (!this.apiKey) {
            throw new Error("BREVO_API_KEY is required to send transactional emails.");
        }

        const response = await fetch(this.apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "api-key": this.apiKey,
            },
            body: JSON.stringify({
                sender: payload.from || this.defaultFrom,
                to: [payload.to],
                subject: payload.subject,
                htmlContent: payload.html,
                textContent: payload.text,
            }),
        });

        const data = (await response.json().catch(() => ({}))) as BrevoResponse;

        if (!response.ok) {
            throw new Error(data.message || `Brevo send failed with status ${response.status}`);
        }

        return {
            providerMessageId: data.messageId || data.messageIds?.[0],
        };
    }
}
