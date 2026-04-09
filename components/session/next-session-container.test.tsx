import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextSessionContainer } from "./next-session-container";
import { useSessionStore } from "@/store/session-store";

vi.mock("@/store/session-store");
vi.mock("@/lib/hooks/use-polling", () => ({
  usePolling: vi.fn(),
}));

// Mock sub-components to focus on NextSessionContainer logic
vi.mock("./session-card", () => ({
  SessionCard: ({ onEdit, canEdit }: any) => (
    <div data-testid="session-card">
      {canEdit && <button onClick={onEdit}>Edit</button>}
    </div>
  ),
}));
vi.mock("./session-form", () => ({
  SessionForm: ({ onCancel }: any) => (
    <div data-testid="session-form">
      <button onClick={onCancel}>Cancel</button>
    </div>
  ),
}));
vi.mock("./next-session-empty-state", () => ({
  NextSessionEmptyState: ({ onCreate, canCreate }: any) => (
    <div data-testid="empty-state">
      {canCreate && <button onClick={onCreate}>Create</button>}
    </div>
  ),
}));
vi.mock("./response-block", () => ({ ResponseBlock: () => <div /> }));
vi.mock("./response-summary", () => ({ ResponseSummary: () => <div /> }));
vi.mock("./prechat-block", () => ({ PrechatBlock: () => <div /> }));

describe("NextSessionContainer", () => {
  const mockTableId = "table-123";
  const defaultStore = {
    nextSessions: {},
    activeSessions: {},
    isLoadingSession: false,
    isLoadingActiveSession: false,
    fetchNextSession: vi.fn(),
    fetchActiveSession: vi.fn(),
    fetchSessionResponses: vi.fn(),
    startSession: vi.fn(),
    isStartingSession: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSessionStore).mockReturnValue(defaultStore as any);
  });

  it("should show loader when loading", () => {
    vi.mocked(useSessionStore).mockReturnValue({
      ...defaultStore,
      isLoadingSession: true,
      nextSessions: { [mockTableId]: undefined },
    } as any);

    render(<NextSessionContainer tableId={mockTableId} myRole="player" />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("should show empty state when no session exists", () => {
    vi.mocked(useSessionStore).mockReturnValue({
      ...defaultStore,
      nextSessions: { [mockTableId]: null },
      activeSessions: { [mockTableId]: null },
    } as any);

    render(<NextSessionContainer tableId={mockTableId} myRole="player" />);
    expect(screen.getByTestId("empty-state")).toBeInTheDocument();
  });

  it("should show session card when a session is scheduled", () => {
    vi.mocked(useSessionStore).mockReturnValue({
      ...defaultStore,
      nextSessions: { [mockTableId]: { id: "sess-1", title: "Scheduled" } },
      activeSessions: { [mockTableId]: null },
    } as any);

    render(<NextSessionContainer tableId={mockTableId} myRole="player" />);
    expect(screen.getByTestId("session-card")).toBeInTheDocument();
  });

  it("should show 'Rejoindre le Live' when a session is active", () => {
    vi.mocked(useSessionStore).mockReturnValue({
      ...defaultStore,
      nextSessions: { [mockTableId]: null },
      activeSessions: { [mockTableId]: { id: "sess-2", title: "Active" } },
    } as any);

    render(<NextSessionContainer tableId={mockTableId} myRole="player" />);
    expect(screen.getByText(/Session en cours/i)).toBeInTheDocument();
    expect(screen.getByText(/Rejoindre le Live/i)).toBeInTheDocument();
  });

  it("should show GM actions only if user is GM", () => {
    vi.mocked(useSessionStore).mockReturnValue({
      ...defaultStore,
      nextSessions: { [mockTableId]: { id: "sess-1" } },
      activeSessions: { [mockTableId]: null },
    } as any);

    const { rerender } = render(<NextSessionContainer tableId={mockTableId} myRole="player" />);
    expect(screen.queryByText(/Démarrer la session live/i)).not.toBeInTheDocument();

    rerender(<NextSessionContainer tableId={mockTableId} myRole="gm" />);
    expect(screen.getByText(/Démarrer la session live/i)).toBeInTheDocument();
  });

  it("should handle session start correctly", async () => {
    const startSession = vi.fn().mockResolvedValue({ success: true, session: { id: "sess-1" } });
    window.confirm = vi.fn().mockReturnValue(true);

    vi.mocked(useSessionStore).mockReturnValue({
      ...defaultStore,
      nextSessions: { [mockTableId]: { id: "sess-1" } },
      startSession,
    } as any);

    render(<NextSessionContainer tableId={mockTableId} myRole="gm" />);
    fireEvent.click(screen.getByText(/Démarrer la session live/i));

    expect(startSession).toHaveBeenCalledWith("sess-1");
  });
});
