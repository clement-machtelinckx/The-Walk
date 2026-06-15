import { beforeEach, describe, expect, it, vi } from "vitest";

import { useInvitationStore } from "./invitation-store";

describe("useInvitationStore acceptance actions", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        useInvitationStore.setState({ error: null });
    });

    it("accepts a targeted invitation", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue({
                ok: true,
                json: vi.fn().mockResolvedValue({ redirectTo: "/tables/table-1" }),
            }),
        );

        const result = await useInvitationStore.getState().acceptInvitation("target-token");

        expect(result).toEqual({ success: true, redirectTo: "/tables/table-1" });
        expect(fetch).toHaveBeenCalledWith("/api/invitations/target-token/accept", {
            method: "POST",
        });
    });

    it("surfaces group invitation API errors", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue({
                ok: false,
                json: vi.fn().mockResolvedValue({ error: "Invitation expirée" }),
            }),
        );

        const result = await useInvitationStore.getState().acceptGroupInvitation("group-token");

        expect(result).toEqual({ success: false, error: "Invitation expirée" });
        expect(useInvitationStore.getState().error).toBe("Invitation expirée");
    });

    it("surfaces targeted invitation network errors", async () => {
        vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));

        const result = await useInvitationStore.getState().acceptInvitation("target-token");

        expect(result).toEqual({ success: false, error: "Erreur réseau ou serveur." });
    });
});
