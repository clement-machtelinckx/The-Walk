import { beforeEach, describe, expect, it, vi } from "vitest";

import { useEmailUsageStore } from "./email-usage-store";
import type { EmailUsageSummary } from "@/types/email";

describe("useEmailUsageStore", () => {
    const usage: EmailUsageSummary = {
        limit: 100,
        sentThisMonth: 20,
        remaining: 80,
        periodStart: "2026-06-01T00:00:00.000Z",
        byType: [],
    };

    beforeEach(() => {
        vi.restoreAllMocks();
        useEmailUsageStore.setState({
            usage: null,
            isLoading: false,
            error: null,
        });
    });

    it("loads email usage", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue({
                ok: true,
                json: vi.fn().mockResolvedValue({ usage }),
            }),
        );

        await useEmailUsageStore.getState().fetchUsage();

        expect(fetch).toHaveBeenCalledWith("/api/email/usage");
        expect(useEmailUsageStore.getState()).toMatchObject({
            usage,
            isLoading: false,
            error: null,
        });
    });

    it("surfaces network errors", async () => {
        vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));

        await useEmailUsageStore.getState().fetchUsage();

        expect(useEmailUsageStore.getState()).toMatchObject({
            usage: null,
            isLoading: false,
            error: "Impossible de charger l'usage email.",
        });
    });
});
