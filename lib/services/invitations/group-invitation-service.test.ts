import { describe, it, expect, vi, beforeEach } from "vitest";
import { GroupInvitationService } from "./group-invitation-service";
import { GroupInvitationRepository } from "@/lib/repositories/group-invitation-repository";
import { MembershipRepository } from "@/lib/repositories/membership-repository";
import { ForbiddenError, ValidationError } from "@/lib/errors";

vi.mock("@/lib/repositories/group-invitation-repository");
vi.mock("@/lib/repositories/membership-repository");
vi.mock("@/lib/repositories/table-repository");

describe("GroupInvitationService", () => {
  const mockUserId = "user-123";
  const mockTableId = "table-456";
  const mockToken = "token-789";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("create", () => {
    it("should create invitation if user is GM", async () => {
      vi.mocked(MembershipRepository.getByUserAndTable).mockResolvedValue({
        role: "gm",
      } as any);

      vi.mocked(GroupInvitationRepository.create).mockResolvedValue({ id: "inv-1" } as any);

      await GroupInvitationService.create(mockUserId, mockTableId, "player", 24);

      expect(GroupInvitationRepository.create).toHaveBeenCalled();
    });

    it("should throw ForbiddenError if user is not GM", async () => {
      vi.mocked(MembershipRepository.getByUserAndTable).mockResolvedValue({
        role: "player",
      } as any);

      await expect(GroupInvitationService.create(mockUserId, mockTableId, "player", 24))
        .rejects.toThrow(ForbiddenError);
    });
  });

  describe("accept", () => {
    it("should create membership if invitation is valid", async () => {
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 1);

      vi.mocked(GroupInvitationRepository.getByToken).mockResolvedValue({
        table_id: mockTableId,
        role: "player",
        expires_at: futureDate.toISOString(),
      } as any);

      vi.mocked(MembershipRepository.getByUserAndTable).mockResolvedValue(null);

      await GroupInvitationService.accept(mockUserId, mockToken);

      expect(MembershipRepository.create).toHaveBeenCalledWith(mockTableId, mockUserId, "player");
    });

    it("should throw ValidationError if invitation is expired", async () => {
      const pastDate = new Date();
      pastDate.setHours(pastDate.getHours() - 1);

      vi.mocked(GroupInvitationRepository.getByToken).mockResolvedValue({
        expires_at: pastDate.toISOString(),
      } as any);

      await expect(GroupInvitationService.accept(mockUserId, mockToken))
        .rejects.toThrow(ValidationError);
      expect(MembershipRepository.create).not.toHaveBeenCalled();
    });

    it("should return tableId without creating new membership if user is already a member", async () => {
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 1);

      vi.mocked(GroupInvitationRepository.getByToken).mockResolvedValue({
        table_id: mockTableId,
        expires_at: futureDate.toISOString(),
      } as any);

      vi.mocked(MembershipRepository.getByUserAndTable).mockResolvedValue({ id: "existing" } as any);

      const result = await GroupInvitationService.accept(mockUserId, mockToken);

      expect(result.tableId).toBe(mockTableId);
      expect(MembershipRepository.create).not.toHaveBeenCalled();
    });
  });
});
