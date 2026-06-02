import { describe, expect, it, vi } from "vitest";
import { DatabaseError } from "@/lib/errors";
import { applyPagination, handleDbError } from "./base";

describe("repository shared helpers", () => {
    it("throws project database errors with context when Supabase returns an error", () => {
        const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
        const dbError = { message: "bad query", code: "PGRST001" };

        expect(() => handleDbError(dbError as never, "TestRepository.query")).toThrow(
            DatabaseError,
        );
        expect(consoleSpy).toHaveBeenCalledWith("Database Error [TestRepository.query]:", dbError);

        consoleSpy.mockRestore();
    });

    it("does nothing when there is no database error", () => {
        expect(() => handleDbError(null, "Noop")).not.toThrow();
    });

    it("applies default pagination and ascending sort", () => {
        const query = {
            order: vi.fn().mockReturnThis(),
            range: vi.fn().mockReturnThis(),
        };

        const result = applyPagination(query, {});

        expect(result).toBe(query);
        expect(query.order).toHaveBeenCalledWith("created_at", { ascending: true });
        expect(query.range).toHaveBeenCalledWith(0, 19);
    });

    it("applies custom pagination, sort and descending order", () => {
        const query = {
            order: vi.fn().mockReturnThis(),
            range: vi.fn().mockReturnThis(),
        };

        applyPagination(query, {
            page: 3,
            limit: 10,
            sortBy: "scheduled_at",
            ascending: false,
        });

        expect(query.order).toHaveBeenCalledWith("scheduled_at", { ascending: false });
        expect(query.range).toHaveBeenCalledWith(20, 29);
    });
});
