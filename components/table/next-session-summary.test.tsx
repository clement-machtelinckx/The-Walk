import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextSessionSummary } from "./next-session-summary";
import { useSessionStore } from "@/store/session-store";

type SessionStoreSnapshot = ReturnType<typeof useSessionStore>;

vi.mock("@/store/session-store");
vi.mock("next/navigation", () => ({
    useRouter: () => ({ push: vi.fn() }),
}));
vi.mock("@/components/session/session-card", () => ({
    SessionCard: ({ session }: { session: { title: string } }) => <div>{session.title}</div>,
}));
vi.mock("@/components/session/session-form", () => ({
    SessionForm: ({ onSuccess }: { onSuccess: (session: unknown) => void }) => (
        <button
            onClick={() =>
                onSuccess({
                    id: "session-created",
                    table_id: "table-123",
                    title: "Session créée",
                    description: null,
                    status: "scheduled",
                    scheduled_at: "2026-06-20T18:00:00.000Z",
                    started_at: null,
                    ended_at: null,
                    created_at: "2026-06-10T12:00:00.000Z",
                    updated_at: "2026-06-10T12:00:00.000Z",
                })
            }
        >
            Valider le formulaire
        </button>
    ),
}));
vi.mock("@/components/session/response-block", () => ({
    ResponseBlock: () => <div>RSVP interactif</div>,
}));
vi.mock("@/components/session/response-summary", () => ({
    ResponseSummary: () => <div>Résumé des réponses</div>,
}));
describe("NextSessionSummary", () => {
    const defaultStore = {
        startSession: vi.fn(),
        cancelSession: vi.fn(),
        deleteSession: vi.fn(),
        isStartingSession: false,
        isCancellingSession: false,
        isDeletingSession: false,
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useSessionStore).mockReturnValue(defaultStore as unknown as SessionStoreSnapshot);
    });

    it("allows the GM to create a session without leaving the table", () => {
        render(
            <NextSessionSummary
                tableId="table-123"
                session={null}
                activeSession={null}
                myRole="gm"
            />,
        );

        fireEvent.click(screen.getByRole("button", { name: "Planifier une session" }));
        fireEvent.click(screen.getByRole("button", { name: "Valider le formulaire" }));

        expect(screen.getByText("Session créée")).toBeInTheDocument();
        expect(screen.getByText("RSVP interactif")).toBeInTheDocument();
        expect(screen.queryByText("Discussion de table")).not.toBeInTheDocument();
    });

    it("shows session preparation directly to players", () => {
        render(
            <NextSessionSummary
                tableId="table-123"
                session={{
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
                }}
                activeSession={null}
                myRole="player"
            />,
        );

        expect(screen.getByText("Le prochain chapitre")).toBeInTheDocument();
        expect(screen.getByText("RSVP interactif")).toBeInTheDocument();
        expect(screen.getByText("Résumé des réponses")).toBeInTheDocument();
        expect(screen.queryByText("Discussion de table")).not.toBeInTheDocument();
        expect(screen.queryByText("Démarrer la session live")).not.toBeInTheDocument();
    });
});
