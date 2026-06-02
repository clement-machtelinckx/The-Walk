import { beforeEach, describe, expect, it, vi } from "vitest";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { getServerClient, getServiceRoleClient } from "./index";

vi.mock("@/lib/supabase/server", () => ({
    createClient: vi.fn(),
}));

vi.mock("@supabase/supabase-js", () => ({
    createClient: vi.fn(),
}));

describe("db client helpers", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
        process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key";
    });

    it("returns the project server client", async () => {
        const serverClient = { from: vi.fn() };
        vi.mocked(createServerClient).mockResolvedValue(serverClient as never);

        await expect(getServerClient()).resolves.toBe(serverClient);
    });

    it("creates a service role client with token persistence disabled", () => {
        const serviceClient = { from: vi.fn() };
        vi.mocked(createClient).mockReturnValue(serviceClient as never);

        const result = getServiceRoleClient();

        expect(result).toBe(serviceClient);
        expect(createClient).toHaveBeenCalledWith(
            "https://example.supabase.co",
            "service-role-key",
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false,
                },
            },
        );
    });
});
