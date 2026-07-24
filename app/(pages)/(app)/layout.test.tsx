import { beforeEach, describe, expect, it, vi } from "vitest";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/server";
import AppLayout from "./layout";

vi.mock("@/lib/auth/server", () => ({
    getCurrentUser: vi.fn(),
}));

describe("protected app layout", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("redirects to login when valid claims no longer resolve to an Auth user", async () => {
        vi.mocked(getCurrentUser).mockResolvedValue(null);
        vi.mocked(redirect).mockImplementation(() => {
            throw new Error("NEXT_REDIRECT");
        });

        await expect(AppLayout({ children: <div>Protected content</div> })).rejects.toThrow(
            "NEXT_REDIRECT",
        );

        expect(getCurrentUser).toHaveBeenCalledOnce();
        expect(redirect).toHaveBeenCalledWith("/login");
    });
});
