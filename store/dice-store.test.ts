import { beforeEach, describe, expect, it, vi } from "vitest";

import { useDiceStore } from "./dice-store";
import type { DiceRollLog } from "@/types/dice";

describe("useDiceStore", () => {
    const tableId = "44444444-4444-4444-8444-444444444444";
    const sessionId = "33333333-3333-4333-8333-333333333333";
    const roll: DiceRollLog = {
        id: "55555555-5555-4555-8555-555555555555",
        table_id: tableId,
        session_id: sessionId,
        user_id: "22222222-2222-4222-8222-222222222222",
        dice_type: 20,
        quantity: 1,
        modifier: 3,
        rolls: [14],
        total: 17,
        roll_kind: "standard",
        created_at: "2026-06-12T12:00:00.000Z",
    };

    beforeEach(() => {
        vi.restoreAllMocks();
        useDiceStore.setState({
            rolls: {},
            isLoading: false,
            isRolling: false,
            error: null,
        });
    });

    it("loads dice rolls by table", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue({
                ok: true,
                json: vi.fn().mockResolvedValue({ rolls: [roll] }),
            }),
        );

        await useDiceStore.getState().fetchRolls(tableId);

        expect(fetch).toHaveBeenCalledWith(`/api/tables/${tableId}/dice`);
        expect(useDiceStore.getState().rolls[tableId]).toEqual([roll]);
    });

    it("rolls dice and prepends the returned result", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue({
                ok: true,
                json: vi.fn().mockResolvedValue({ roll }),
            }),
        );

        const result = await useDiceStore.getState().rollDice(tableId, {
            session_id: sessionId,
            dice_type: 20,
            quantity: 1,
            modifier: 3,
        });

        expect(result).toEqual({ success: true });
        expect(fetch).toHaveBeenCalledWith(`/api/tables/${tableId}/dice`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                session_id: sessionId,
                dice_type: 20,
                quantity: 1,
                modifier: 3,
            }),
        });
        expect(useDiceStore.getState().rolls[tableId]).toEqual([roll]);
        expect(useDiceStore.getState().isRolling).toBe(false);
    });
});
