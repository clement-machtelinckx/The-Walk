import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextSessionAdminBlock } from "./next-session-admin-block";
import { useSessionStore } from "@/store/session-store";

type SessionStoreSnapshot = ReturnType<typeof useSessionStore>;

vi.mock("@/store/session-store");
vi.mock("@/components/session/session-details-sheet", () => ({
    SessionDetailsSheet: () => <button>Détails</button>,
}));

describe("NextSessionAdminBlock", () => {
    const fetchNextSession = vi.fn();
    const sendSessionReminder = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useSessionStore).mockReturnValue({
            nextSessions: {
                "table-123": {
                    id: "session-123",
                    table_id: "table-123",
                    title: "Le prochain chapitre",
                    description: "Briefing",
                    status: "scheduled",
                    scheduled_at: "2026-06-20T18:00:00.000Z",
                    started_at: null,
                    ended_at: null,
                    created_at: "2026-06-10T12:00:00.000Z",
                    updated_at: "2026-06-10T12:00:00.000Z",
                },
            },
            isLoadingSession: false,
            fetchNextSession,
            sendSessionReminder,
        } as unknown as SessionStoreSnapshot);
    });

    it("shows an admin summary without live-tool actions", () => {
        render(<NextSessionAdminBlock tableId="table-123" />);

        expect(screen.getByText("Résumé admin")).toBeInTheDocument();
        expect(screen.getByText("Prochaine session")).toBeInTheDocument();
        expect(screen.getByText("Planifiée")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Détails" })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /Ouvrir sur la table/ })).toHaveAttribute(
            "href",
            "/tables/table-123",
        );
        expect(screen.queryByText("Outils du live")).not.toBeInTheDocument();
        expect(screen.queryByText("Démarrer la session")).not.toBeInTheDocument();
    });
});
