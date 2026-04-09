import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { requireAuth } from "@/lib/auth/server";
import { InvitationService } from "@/lib/services/invitations/invitation-service";
import { ValidationError } from "@/lib/errors";

vi.mock("@/lib/auth/server");
vi.mock("@/lib/services/invitations/invitation-service");

describe("POST /api/invitations/[token]/accept", () => {
  const mockToken = "token-123";
  const mockUser = { id: "user-456" };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 200 and redirect path when acceptance is successful", async () => {
    vi.mocked(requireAuth).mockResolvedValue(mockUser as any);
    vi.mocked(InvitationService.accept).mockResolvedValue({ tableId: "table-789" });

    const request = new Request("http://localhost/api/invitations/token-123/accept", {
      method: "POST",
    });
    const params = Promise.resolve({ token: mockToken });

    const response = await POST(request, { params });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.redirectTo).toBe("/tables/table-789");
    expect(InvitationService.accept).toHaveBeenCalledWith(mockUser.id, mockToken);
  });

  it("should return ValidationError status when InvitationService throws", async () => {
    vi.mocked(requireAuth).mockResolvedValue(mockUser as any);
    vi.mocked(InvitationService.accept).mockRejectedValue(new ValidationError("Invitation invalid"));

    const request = new Request("http://localhost/api/invitations/token-123/accept", {
      method: "POST",
    });
    const params = Promise.resolve({ token: mockToken });

    const response = await POST(request, { params });
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Invitation invalid");
  });
});
