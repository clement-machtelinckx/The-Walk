import { beforeEach, describe, expect, it, vi } from "vitest";

import { useInitiativeStore } from "./initiative-store";
import type { InitiativeSnapshot } from "@/types/initiative";

describe("useInitiativeStore", () => {
    const sessionId = "33333333-3333-4333-8333-333333333333";
    const entryId = "44444444-4444-4444-8444-444444444444";
    const snapshot: InitiativeSnapshot = {
        state: null,
        entries: [],
        eligible_members: [],
    };

    beforeEach(() => {
        vi.restoreAllMocks();
        useInitiativeStore.setState({
            initiatives: {},
            isLoading: false,
            isMutating: false,
            error: null,
        });
    });

    it("loads and stores an initiative snapshot", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue({
                ok: true,
                json: vi.fn().mockResolvedValue({ initiative: snapshot }),
            }),
        );

        await useInitiativeStore.getState().fetchInitiative(sessionId);

        expect(fetch).toHaveBeenCalledWith(`/api/sessions/${sessionId}/initiative`);
        expect(useInitiativeStore.getState().initiatives[sessionId]).toEqual(snapshot);
        expect(useInitiativeStore.getState().isLoading).toBe(false);
    });

    it("centralizes initiative actions and stores the returned snapshot", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue({
                ok: true,
                json: vi.fn().mockResolvedValue({ initiative: snapshot }),
            }),
        );

        const result = await useInitiativeStore.getState().rollInitiative(sessionId, entryId, 3);

        expect(result).toEqual({ success: true });
        expect(fetch).toHaveBeenCalledWith(`/api/sessions/${sessionId}/initiative`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "roll", entry_id: entryId, modifier: 3 }),
        });
        expect(useInitiativeStore.getState().initiatives[sessionId]).toEqual(snapshot);
    });

    it("translates the known raw RLS error into French", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue({
                ok: false,
                json: vi.fn().mockResolvedValue({
                    error: "Players can only submit their own pending initiative",
                }),
            }),
        );

        const result = await useInitiativeStore.getState().rollInitiative(sessionId, entryId, 3);

        expect(result.success).toBe(false);
        expect(result.error).toBe(
            "Votre jet d'initiative n'a pas pu être enregistré. Actualisez puis réessayez.",
        );
        expect(useInitiativeStore.getState().error).not.toContain("Players can only submit");
    });
});
