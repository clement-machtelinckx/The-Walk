import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, PATCH } from "./route";
import { requireAuth } from "@/lib/auth/server";
import { ForbiddenError, UnauthorizedError } from "@/lib/errors";
import { LiveModuleSettingsService } from "@/lib/services/sessions/live-module-settings-service";

vi.mock("@/lib/auth/server");
vi.mock("@/lib/services/sessions/live-module-settings-service");

describe("/api/sessions/[sessionId]/modules", () => {
    const sessionId = "session-123";
    const user = { id: "user-123" };
    const params = Promise.resolve({ sessionId });
    type AuthUser = Awaited<ReturnType<typeof requireAuth>>;
    type Settings = Awaited<ReturnType<typeof LiveModuleSettingsService.getSettings>>;

    const settings: Settings = {
        session_id: sessionId,
        enabled_modules: ["dice"],
        is_configured: true,
        group_notes: false,
        dice: true,
        initiative: false,
        presence: false,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("GET returns the current module settings", async () => {
        vi.mocked(requireAuth).mockResolvedValue(user as AuthUser);
        vi.mocked(LiveModuleSettingsService.getSettings).mockResolvedValue(settings);

        const response = await GET(
            new Request(`http://localhost/api/sessions/${sessionId}/modules`),
            {
                params,
            },
        );
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.settings).toEqual(settings);
        expect(LiveModuleSettingsService.getSettings).toHaveBeenCalledWith(user.id, sessionId);
    });

    it("GET returns auth errors with their status", async () => {
        vi.mocked(requireAuth).mockRejectedValue(new UnauthorizedError());

        const response = await GET(
            new Request(`http://localhost/api/sessions/${sessionId}/modules`),
            {
                params,
            },
        );
        const body = await response.json();

        expect(response.status).toBe(401);
        expect(body.error).toBe("Non authentifié");
    });

    it("PATCH accepts a valid V1 projection update", async () => {
        vi.mocked(requireAuth).mockResolvedValue(user as AuthUser);
        vi.mocked(LiveModuleSettingsService.updateSettings).mockResolvedValue({
            ...settings,
            dice: false,
            enabled_modules: [],
        });

        const request = new Request(`http://localhost/api/sessions/${sessionId}/modules`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ dice: false }),
        });

        const response = await PATCH(request, { params });
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.success).toBe(true);
        expect(body.settings.dice).toBe(false);
        expect(LiveModuleSettingsService.updateSettings).toHaveBeenCalledWith(user.id, sessionId, {
            dice: false,
        });
    });

    it("PATCH accepts a single module_key toggle", async () => {
        vi.mocked(requireAuth).mockResolvedValue(user as AuthUser);
        vi.mocked(LiveModuleSettingsService.updateModule).mockResolvedValue({
            ...settings,
            enabled_modules: ["dice", "initiative"],
        });

        const request = new Request(`http://localhost/api/sessions/${sessionId}/modules`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ module_key: "initiative", enabled: true }),
        });

        const response = await PATCH(request, { params });
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.settings.enabled_modules).toContain("initiative");
        expect(LiveModuleSettingsService.updateModule).toHaveBeenCalledWith(
            user.id,
            sessionId,
            "initiative",
            true,
        );
    });

    it("PATCH rejects invalid payloads", async () => {
        vi.mocked(requireAuth).mockResolvedValue(user as AuthUser);

        const request = new Request(`http://localhost/api/sessions/${sessionId}/modules`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ dice: "yes" }),
        });

        const response = await PATCH(request, { params });
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body.error).toBe("Données invalides");
        expect(LiveModuleSettingsService.updateSettings).not.toHaveBeenCalled();
        expect(LiveModuleSettingsService.updateModule).not.toHaveBeenCalled();
    });

    it("PATCH rejects undeclared module keys", async () => {
        vi.mocked(requireAuth).mockResolvedValue(user as AuthUser);

        const request = new Request(`http://localhost/api/sessions/${sessionId}/modules`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ module_key: "unknown_module", enabled: true }),
        });

        const response = await PATCH(request, { params });

        expect(response.status).toBe(400);
        expect(LiveModuleSettingsService.updateModule).not.toHaveBeenCalled();
    });

    it("PATCH returns forbidden errors for non-GM updates", async () => {
        vi.mocked(requireAuth).mockResolvedValue(user as AuthUser);
        vi.mocked(LiveModuleSettingsService.updateSettings).mockRejectedValue(
            new ForbiddenError("Seul le Maître du Jeu peut modifier les modules live."),
        );

        const request = new Request(`http://localhost/api/sessions/${sessionId}/modules`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ dice: false }),
        });

        const response = await PATCH(request, { params });
        const body = await response.json();

        expect(response.status).toBe(403);
        expect(body.error).toBe("Seul le Maître du Jeu peut modifier les modules live.");
    });
});
