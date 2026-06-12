import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TableDiscussionBlock } from "./table-discussion-block";
import { useDiscussionStore } from "@/store/discussion-store";
import { useAuthStore } from "@/store/auth-store";

type DiscussionStoreSnapshot = ReturnType<typeof useDiscussionStore>;
type AuthStoreSnapshot = ReturnType<typeof useAuthStore>;

vi.mock("@/store/discussion-store");
vi.mock("@/store/auth-store");
vi.mock("@/lib/hooks/use-polling", () => ({
    usePolling: vi.fn(),
}));
vi.mock("@/components/session/message-thread", () => ({
    MessageThread: () => <div>Fil de messages</div>,
}));

describe("TableDiscussionBlock", () => {
    const loadOlderDiscussionMessages = vi.fn();
    const defaultStore = {
        discussions: {},
        fetchDiscussionMessages: vi.fn(),
        loadOlderDiscussionMessages,
        sendDiscussionMessage: vi.fn(),
        isLoadingDiscussion: false,
        isLoadingDiscussionHistory: false,
        isSendingDiscussionMessage: false,
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useAuthStore).mockReturnValue({ user: { id: "user-123" } } as AuthStoreSnapshot);
    });

    it("shows the history control only when another page exists", () => {
        vi.mocked(useDiscussionStore).mockReturnValue({
            ...defaultStore,
            discussions: {
                "table-123": {
                    data: [],
                    total: 60,
                    page: 1,
                    limit: 50,
                    totalPages: 2,
                },
            },
        } as unknown as DiscussionStoreSnapshot);

        render(<TableDiscussionBlock tableId="table-123" />);
        fireEvent.click(screen.getByRole("button", { name: "Charger les messages plus anciens" }));

        expect(loadOlderDiscussionMessages).toHaveBeenCalledWith("table-123");
    });

    it("hides the history control when the full discussion is loaded", () => {
        vi.mocked(useDiscussionStore).mockReturnValue({
            ...defaultStore,
            discussions: {
                "table-123": {
                    data: [],
                    total: 20,
                    page: 1,
                    limit: 50,
                    totalPages: 1,
                },
            },
        } as unknown as DiscussionStoreSnapshot);

        render(<TableDiscussionBlock tableId="table-123" />);

        expect(
            screen.queryByRole("button", { name: "Charger les messages plus anciens" }),
        ).not.toBeInTheDocument();
    });
});
