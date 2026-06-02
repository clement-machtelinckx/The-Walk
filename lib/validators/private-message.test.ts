import { describe, it, expect } from "vitest";
import {
    createPrivateMessageSchema,
    privateMessageRecipientSchema,
} from "@/lib/validators/private-message";

describe("private message validators", () => {
    const tableId = "44444444-4444-4444-8444-444444444444";
    const recipientId = "22222222-2222-4222-8222-222222222222";
    const sessionId = "33333333-3333-4333-8333-333333333333";

    it("accepts table messages without session context", () => {
        const parsed = createPrivateMessageSchema.parse({
            table_id: tableId,
            recipient_user_id: recipientId,
            content: "  Secret  ",
        });

        expect(parsed).toEqual({
            table_id: tableId,
            recipient_user_id: recipientId,
            content: "Secret",
        });
    });

    it("accepts optional session context", () => {
        const parsed = createPrivateMessageSchema.parse({
            table_id: tableId,
            session_id: sessionId,
            recipient_user_id: recipientId,
            content: "Secret",
        });

        expect(parsed.session_id).toBe(sessionId);
    });

    it("rejects empty content", () => {
        const result = createPrivateMessageSchema.safeParse({
            table_id: tableId,
            recipient_user_id: recipientId,
            content: "   ",
        });

        expect(result.success).toBe(false);
    });

    it("rejects too long content", () => {
        const result = createPrivateMessageSchema.safeParse({
            table_id: tableId,
            recipient_user_id: recipientId,
            content: "a".repeat(2001),
        });

        expect(result.success).toBe(false);
    });

    it("rejects invalid identifiers", () => {
        expect(
            privateMessageRecipientSchema.safeParse({ recipient_user_id: "not-a-uuid" }).success,
        ).toBe(false);
        expect(
            createPrivateMessageSchema.safeParse({
                table_id: "not-a-table",
                recipient_user_id: recipientId,
                content: "Secret",
            }).success,
        ).toBe(false);
    });
});
