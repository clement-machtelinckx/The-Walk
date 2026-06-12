import { beforeEach, describe, expect, it, vi } from "vitest";

import { requireAuth } from "@/lib/auth/server";
import { DatabaseError, ForbiddenError } from "@/lib/errors";
import { InitiativeService } from "@/lib/services/initiative/initiative-service";
import { GET, POST } from "./route";

vi.mock("@/lib/auth/server");
vi.mock("@/lib/services/initiative/initiative-service");

describe("/api/sessions/[sessionId]/initiative", () => {
    const sessionId = "00000000-0000-4000-8000-000000000001";
    const user = { id: "00000000-0000-4000-8000-000000000002" };
    const params = Promise.resolve({ sessionId });
    const snapshot = {
        state: null,
        entries: [],
        eligible_members: [],
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(requireAuth).mockResolvedValue(user as Awaited<ReturnType<typeof requireAuth>>);
    });

    it("returns the initiative snapshot", async () => {
        vi.mocked(InitiativeService.getSnapshot).mockResolvedValue(snapshot);

        const response = await GET(
            new Request(`http://localhost/api/sessions/${sessionId}/initiative`),
            { params },
        );

        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({ initiative: snapshot });
    });

    it("validates and delegates initiative actions", async () => {
        vi.mocked(InitiativeService.executeAction).mockResolvedValue(snapshot);

        const response = await POST(
            new Request(`http://localhost/api/sessions/${sessionId}/initiative`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "add_custom", label: "Boss", modifier: 4 }),
            }),
            { params },
        );

        expect(response.status).toBe(200);
        expect(InitiativeService.executeAction).toHaveBeenCalledWith(user.id, sessionId, {
            action: "add_custom",
            label: "Boss",
            modifier: 4,
        });
    });

    it("rejects invalid actions and exposes service permission errors", async () => {
        const invalidResponse = await POST(
            new Request(`http://localhost/api/sessions/${sessionId}/initiative`, {
                method: "POST",
                body: JSON.stringify({ action: "unknown" }),
            }),
            { params },
        );
        expect(invalidResponse.status).toBe(400);

        vi.mocked(InitiativeService.executeAction).mockRejectedValue(new ForbiddenError());
        const forbiddenResponse = await POST(
            new Request(`http://localhost/api/sessions/${sessionId}/initiative`, {
                method: "POST",
                body: JSON.stringify({ action: "reset" }),
            }),
            { params },
        );
        expect(forbiddenResponse.status).toBe(403);
    });

    it("does not expose raw database errors", async () => {
        vi.mocked(InitiativeService.executeAction).mockRejectedValue(
            new DatabaseError("Players can only submit their own pending initiative"),
        );

        const response = await POST(
            new Request(`http://localhost/api/sessions/${sessionId}/initiative`, {
                method: "POST",
                body: JSON.stringify({ action: "reset" }),
            }),
            { params },
        );

        expect(response.status).toBe(500);
        expect(await response.json()).toEqual({
            error: "Impossible de mettre à jour l'initiative pour le moment.",
        });
    });
});
