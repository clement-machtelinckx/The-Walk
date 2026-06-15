import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SessionToolsDrawer } from "./session-tools-drawer";

vi.mock("./dice-log-block", () => ({
    DiceLogBlock: () => <div>Journal de dés</div>,
}));
vi.mock("./live-module-settings", () => ({
    LiveModuleSettings: () => <div>Réglages des modules</div>,
}));
vi.mock("./player-presence-panel", () => ({
    PlayerPresencePanel: () => <div>Vue joueurs</div>,
}));

describe("SessionToolsDrawer", () => {
    it("uses tool categories and marks planned items as non-actionable", () => {
        render(<SessionToolsDrawer isGM tableId="table-123" context="table" />);

        fireEvent.click(screen.getByRole("button", { name: "Ouvrir Joueurs et échanges" }));

        expect(screen.getByText("Outils de table")).toBeInTheDocument();
        expect(screen.getByText("Joueurs et échanges")).toBeInTheDocument();
        expect(
            screen.getByText("Messages privés de table").closest("[aria-disabled=true]"),
        ).not.toBe(null);
        expect(screen.queryByText("Prochaine session")).not.toBeInTheDocument();
    });

    it("uses a distinct live context title", () => {
        render(<SessionToolsDrawer isGM={false} tableId="table-123" context="live" />);

        fireEvent.click(screen.getByRole("button", { name: "Ouvrir Outils live" }));

        expect(screen.getByText("Outils du live")).toBeInTheDocument();
        expect(screen.getByText("Outils live")).toBeInTheDocument();
        expect(screen.getByText("Journal de dés")).toBeInTheDocument();
        expect(screen.queryByText("Résumé admin")).not.toBeInTheDocument();
    });
});
