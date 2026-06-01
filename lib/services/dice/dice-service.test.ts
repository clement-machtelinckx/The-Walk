import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { DiceService } from "./dice-service";
import { DiceRepository } from "@/lib/repositories/dice-repository";
import { MembershipRepository } from "@/lib/repositories/membership-repository";
import { SessionRepository } from "@/lib/repositories/session-repository";
import { ForbiddenError } from "@/lib/errors";

vi.mock("@/lib/repositories/dice-repository");
vi.mock("@/lib/repositories/membership-repository");
vi.mock("@/lib/repositories/session-repository");

describe("DiceService", () => {
    const mockUserId = "user-123";
    const mockSessionId = "session-456";
    const mockTableId = "table-789";
    type SessionById = Awaited<ReturnType<typeof SessionRepository.getById>>;
    type Membership = Awaited<ReturnType<typeof MembershipRepository.getByUserAndTable>>;
    type DiceRoll = Awaited<ReturnType<typeof DiceRepository.create>>;

    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(Math, "random").mockReturnValueOnce(0).mockReturnValueOnce(0.999);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("calculates rolls server-side and persists the structured result", async () => {
        vi.mocked(SessionRepository.getById).mockResolvedValue({
            id: mockSessionId,
            table_id: mockTableId,
        } as SessionById);
        vi.mocked(MembershipRepository.getByUserAndTable).mockResolvedValue({
            id: "membership-1",
        } as Membership);
        vi.mocked(DiceRepository.create).mockResolvedValue({
            id: "roll-1",
            session_id: mockSessionId,
            user_id: mockUserId,
            dice_type: 6,
            quantity: 2,
            modifier: 3,
            rolls: [1, 6],
            total: 10,
            roll_kind: "standard",
            created_at: new Date().toISOString(),
        } as DiceRoll);

        const result = await DiceService.createRoll(mockUserId, {
            session_id: mockSessionId,
            dice_type: 6,
            quantity: 2,
            modifier: 3,
            roll_kind: "standard",
        });

        expect(DiceRepository.create).toHaveBeenCalledWith(
            expect.objectContaining({
                session_id: mockSessionId,
                dice_type: 6,
                quantity: 2,
                modifier: 3,
            }),
            mockUserId,
            [1, 6],
            10,
        );
        expect(result.total).toBe(10);
    });

    it("rejects rolls from users outside the session table", async () => {
        vi.mocked(SessionRepository.getById).mockResolvedValue({
            id: mockSessionId,
            table_id: mockTableId,
        } as SessionById);
        vi.mocked(MembershipRepository.getByUserAndTable).mockResolvedValue(null);

        await expect(
            DiceService.createRoll(mockUserId, {
                session_id: mockSessionId,
                dice_type: 20,
                quantity: 1,
                modifier: 0,
                roll_kind: "standard",
            }),
        ).rejects.toThrow(ForbiddenError);
        expect(DiceRepository.create).not.toHaveBeenCalled();
    });
});
