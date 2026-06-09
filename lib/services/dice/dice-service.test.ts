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
        vi.mocked(MembershipRepository.getByUserAndTable).mockResolvedValue({
            id: "membership-1",
        } as Membership);
        vi.mocked(SessionRepository.getById).mockResolvedValue({
            id: mockSessionId,
            table_id: mockTableId,
        } as SessionById);
        vi.mocked(DiceRepository.create).mockResolvedValue({
            id: "roll-1",
            table_id: mockTableId,
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
            table_id: mockTableId,
            session_id: mockSessionId,
            dice_type: 6,
            quantity: 2,
            modifier: 3,
            roll_kind: "standard",
        });

        expect(DiceRepository.create).toHaveBeenCalledWith(
            expect.objectContaining({
                session_id: mockSessionId,
                table_id: mockTableId,
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

    it("rejects rolls from users outside the table", async () => {
        vi.mocked(MembershipRepository.getByUserAndTable).mockResolvedValue(null);

        await expect(
            DiceService.createRoll(mockUserId, {
                table_id: mockTableId,
                dice_type: 20,
                quantity: 1,
                modifier: 0,
                roll_kind: "standard",
            }),
        ).rejects.toThrow(ForbiddenError);
        expect(DiceRepository.create).not.toHaveBeenCalled();
    });

    it("rejects a session that belongs to another table", async () => {
        vi.mocked(MembershipRepository.getByUserAndTable).mockResolvedValue({
            id: "membership-1",
        } as Membership);
        vi.mocked(SessionRepository.getById).mockResolvedValue({
            id: mockSessionId,
            table_id: "another-table",
        });

        await expect(
            DiceService.createRoll(mockUserId, {
                table_id: mockTableId,
                session_id: mockSessionId,
                dice_type: 20,
                quantity: 1,
                modifier: 0,
                roll_kind: "standard",
            }),
        ).rejects.toThrow("Cette session n'appartient pas à cette table.");

        expect(DiceRepository.create).not.toHaveBeenCalled();
    });

    it("lists only the latest table rolls through the repository limit", async () => {
        vi.mocked(MembershipRepository.getByUserAndTable).mockResolvedValue({
            id: "membership-1",
        });
        vi.mocked(DiceRepository.listByTable).mockResolvedValue([]);

        await DiceService.listRolls(mockUserId, mockTableId);

        expect(DiceRepository.listByTable).toHaveBeenCalledWith(mockTableId, 20);
    });
});
