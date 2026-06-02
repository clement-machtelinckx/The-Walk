import type { EmailProviderName } from "@/types/email";

export interface EmailAddress {
    email: string;
    name?: string;
}

export interface SendEmailPayload {
    to: EmailAddress;
    subject: string;
    html?: string;
    text?: string;
    from?: EmailAddress;
}

export interface EmailProviderSendResult {
    providerMessageId?: string;
}

export interface EmailProvider {
    name: EmailProviderName;
    send(payload: SendEmailPayload): Promise<EmailProviderSendResult>;
}
