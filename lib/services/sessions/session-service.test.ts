import { describe, it, expect, vi, beforeEach } from "vitest";
import { SessionService } from "./session-service";
import { SessionRepository } from "@/lib/repositories/session-repository";
import { MembershipService } from "@/lib/services/memberships/membership-service";
import { ForbiddenError, ValidationError } from "@/lib/errors";

vi.mock("@/lib/repositories/session-repository");
vi.mock("@/lib/services/memberships/membership-service");
vi.mock("@/lib/services/presence/presence-service");

describe("SessionService", () => {
  const mockUserId = "user-123";
  const mockTableId = "table-456";
  const mockSessionId = "session-789";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("startSession", () => {
    it("should start a session if user is GM and session is scheduled", async () => {
      // Setup
      vi.mocked(SessionRepository.getById).mockResolvedValue({
        id: mockSessionId,
        table_id: mockTableId,
        status: "scheduled",
        title: "Test Session",
      } as any);

      vi.mocked(MembershipService.requireMembership).mockResolvedValue({
        role: "gm",
      } as any);

      vi.mocked(SessionRepository.getActiveSessionByTable).mockResolvedValue(null);
      vi.mocked(SessionRepository.update).mockResolvedValue({ status: "active" } as any);

      // Execute
      await SessionService.startSession(mockUserId, mockSessionId);

      // Verify
      expect(SessionRepository.update).toHaveBeenCalledWith(mockSessionId, expect.objectContaining({
        status: "active"
      }));
    });

    it("should throw ForbiddenError if user is not GM", async () => {
      vi.mocked(SessionRepository.getById).mockResolvedValue({
        id: mockSessionId,
        table_id: mockTableId,
        status: "scheduled",
      } as any);

      vi.mocked(MembershipService.requireMembership).mockResolvedValue({
        role: "player",
      } as any);

      await expect(SessionService.startSession(mockUserId, mockSessionId))
        .rejects.toThrow(ForbiddenError);
    });

    it("should throw ValidationError if another session is already active", async () => {
      vi.mocked(SessionRepository.getById).mockResolvedValue({
        id: mockSessionId,
        table_id: mockTableId,
        status: "scheduled",
      } as any);

      vi.mocked(MembershipService.requireMembership).mockResolvedValue({
        role: "gm",
      } as any);

      vi.mocked(SessionRepository.getActiveSessionByTable).mockResolvedValue({ id: "other-session" } as any);

      await expect(SessionService.startSession(mockUserId, mockSessionId))
        .rejects.toThrow(ValidationError);
      expect(SessionRepository.update).not.toHaveBeenCalled();
    });

    it("should throw ValidationError if session is not scheduled", async () => {
      vi.mocked(SessionRepository.getById).mockResolvedValue({
        id: mockSessionId,
        table_id: mockTableId,
        status: "completed",
      } as any);

      vi.mocked(MembershipService.requireMembership).mockResolvedValue({
        role: "gm",
      } as any);

      await expect(SessionService.startSession(mockUserId, mockSessionId))
        .rejects.toThrow(ValidationError);
    });
  });

  describe("endSession", () => {
    it("should end a session if user is GM and session is active", async () => {
      vi.mocked(SessionRepository.getById).mockResolvedValue({
        id: mockSessionId,
        table_id: mockTableId,
        status: "active",
      } as any);

      vi.mocked(MembershipService.requireMembership).mockResolvedValue({
        role: "gm",
      } as any);

      vi.mocked(SessionRepository.update).mockResolvedValue({ status: "completed" } as any);

      await SessionService.endSession(mockUserId, mockSessionId);

      expect(SessionRepository.update).toHaveBeenCalledWith(mockSessionId, expect.objectContaining({
        status: "completed"
      }));
    });

    it("should throw ValidationError if session is not active", async () => {
      vi.mocked(SessionRepository.getById).mockResolvedValue({
        id: mockSessionId,
        table_id: mockTableId,
        status: "scheduled",
      } as any);

      vi.mocked(MembershipService.requireMembership).mockResolvedValue({
        role: "gm",
      } as any);

      await expect(SessionService.endSession(mockUserId, mockSessionId))
        .rejects.toThrow(ValidationError);
    });
  });
});
