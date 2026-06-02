import type { EmailAddress, EmailProvider, SendEmailPayload } from "../types";

interface MailtrapEmailProviderConfig {
    apiToken?: string;
    apiUrl?: string;
    defaultFrom: EmailAddress;
}

interface MailtrapResponse {
    message_ids?: string[];
    message_id?: string;
}

export class MailtrapEmailProvider implements EmailProvider {
    name = "mailtrap" as const;

    private readonly apiToken?: string;
    private readonly apiUrl: string;
    private readonly defaultFrom: EmailAddress;

    constructor(config: MailtrapEmailProviderConfig) {
        this.apiToken = config.apiToken;
        this.apiUrl = config.apiUrl || "https://send.api.mailtrap.io/api/send";
        this.defaultFrom = config.defaultFrom;
    }

    async send(payload: SendEmailPayload) {
        if (!this.apiToken) {
            throw new Error("MAILTRAP_API_TOKEN is required to send transactional emails.");
        }

        const response = await fetch(this.apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.apiToken}`,
            },
            body: JSON.stringify({
                from: payload.from || this.defaultFrom,
                to: [payload.to],
                subject: payload.subject,
                html: payload.html,
                text: payload.text,
            }),
        });

        const data = (await response.json().catch(() => ({}))) as MailtrapResponse & {
            message?: string;
        };

        if (!response.ok) {
            throw new Error(data.message || `Mailtrap send failed with status ${response.status}`);
        }

        return {
            providerMessageId: data.message_ids?.[0] || data.message_id,
        };
    }
}
