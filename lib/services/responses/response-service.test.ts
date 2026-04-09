import { describe, it, expect, vi, beforeEach } from "vitest";
import { ResponseService } from "./response-service";
import { SessionRepository } from "@/lib/repositories/session-repository";
import { MembershipRepository } from "@/lib/repositories/membership-repository";
import { ForbiddenError } from "@/lib/errors";

vi.mock("@/lib/repositories/session-repository");
vi.mock("@/lib/repositories/membership-repository");

describe("ResponseService", () => {
  const mockUserId = "user-123";
  const mockSessionId = "session-789";
  const mockTableId = "table-456";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("respondToSession", () => {
    it("should save response if user is a member", async () => {
      vi.mocked(SessionRepository.getById).mockResolvedValue({ table_id: mockTableId } as any);
      vi.mocked(MembershipRepository.getByUserAndTable).mockResolvedValue({ id: "mem-1" } as any);
      vi.mocked(SessionRepository.upsertResponse).mockResolvedValue({ status: "going" } as any);

      await ResponseService.respondToSession(mockUserId, mockSessionId, { status: "going" });

      expect(SessionRepository.upsertResponse).toHaveBeenCalledWith(mockSessionId, mockUserId, { status: "going" });
    });

    it("should throw ForbiddenError if user is not a member", async () => {
      vi.mocked(SessionRepository.getById).mockResolvedValue({ table_id: mockTableId } as any);
      vi.mocked(MembershipRepository.getByUserAndTable).mockResolvedValue(null);

      await expect(ResponseService.respondToSession(mockUserId, mockSessionId, { status: "going" }))
        .rejects.toThrow(ForbiddenError);
    });
  });

  describe("getSessionResponses", () => {
    it("should calculate summary and non-responders correctly", async () => {
      vi.mocked(SessionRepository.getById).mockResolvedValue({ table_id: mockTableId } as any);
      vi.mocked(MembershipRepository.getByUserAndTable).mockResolvedValue({ id: "mem-1" } as any);
      
      vi.mocked(SessionRepository.listResponses).mockResolvedValue([
        { user_id: "u1", status: "going" },
        { user_id: "u2", status: "declined" },
      ] as any);

      vi.mocked(MembershipRepository.listByTable).mockResolvedValue([
        { user_id: "u1", profiles: { id: "u1", display_name: "U1" } },
        { user_id: "u2", profiles: { id: "u2", display_name: "U2" } },
        { user_id: "u3", profiles: { id: "u3", display_name: "U3" } },
      ] as any);

      const result = await ResponseService.getSessionResponses(mockUserId, mockSessionId);

      expect(result.summary.going).toBe(1);
      expect(result.summary.declined).toBe(1);
      expect(result.summary.pending).toBe(1);
      expect(result.summary.total).toBe(3);
      expect(result.non_responders).toHaveLength(1);
      expect(result.non_responders[0].id).toBe("u3");
    });
  });
});
