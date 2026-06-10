import { describe, expect, it } from "vitest";
import { isPastDate } from "./date";

describe("isPastDate", () => {
    const referenceDate = new Date("2026-06-10T14:00:00.000Z");

    it("returns false before the planned time", () => {
        expect(isPastDate("2026-06-10T15:00:00.000Z", referenceDate)).toBe(false);
    });

    it("returns true after the planned time", () => {
        expect(isPastDate("2026-06-10T13:00:00.000Z", referenceDate)).toBe(true);
    });

    it("returns false when no planned time exists", () => {
        expect(isPastDate(null, referenceDate)).toBe(false);
    });
});
