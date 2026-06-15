import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SessionCard } from "./session-card";

const session = {
    id: "session-123",
    table_id: "table-123",
    title: "Le prochain chapitre",
    description: "Une longue description qui doit rester dans le détail.",
    status: "scheduled" as const,
    scheduled_at: "2026-06-20T18:00:00.000Z",
    started_at: null,
    ended_at: null,
    created_at: "2026-06-10T12:00:00.000Z",
    updated_at: "2026-06-10T12:00:00.000Z",
};

describe("SessionCard", () => {
    it("keeps the main card compact and renders RSVP in its footer", () => {
        render(<SessionCard session={session} canEdit={false} rsvp={<div>RSVP compact</div>} />);

        expect(screen.getByText("Le prochain chapitre")).toBeInTheDocument();
        expect(screen.getByText("RSVP compact")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Détails" })).toBeInTheDocument();
        expect(
            screen.queryByText("Une longue description qui doit rester dans le détail."),
        ).not.toBeInTheDocument();
    });
});
