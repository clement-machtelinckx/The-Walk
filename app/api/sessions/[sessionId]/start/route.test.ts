import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { requireAuth } from "@/lib/auth/server";
import { SessionService } from "@/lib/services/sessions/session-service";
import { ForbiddenError } from "@/lib/errors";
import { NextResponse } from "next/server";

vi.mock("@/lib/auth/server");
vi.mock("@/lib/services/sessions/session-service");

describe("POST /api/sessions/[sessionId]/start", () => {
  const mockSessionId = "session-123";
  const mockUser = { id: "user-456" };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 200 and session when start is successful", async () => {
    vi.mocked(requireAuth).mockResolvedValue(mockUser as any);
    const mockSession = { id: mockSessionId, status: "active" };
    vi.mocked(SessionService.startSession).mockResolvedValue(mockSession as any);

    const request = new Request("http://localhost/api/sessions/session-123/start", {
      method: "POST",
    });
    const params = Promise.resolve({ sessionId: mockSessionId });

    const response = await POST(request, { params });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.session).toEqual(mockSession);
    expect(SessionService.startSession).toHaveBeenCalledWith(mockUser.id, mockSessionId);
  });

  it("should return AppError status when SessionService throws", async () => {
    vi.mocked(requireAuth).mockResolvedValue(mockUser as any);
    vi.mocked(SessionService.startSession).mockRejectedValue(new ForbiddenError("Access denied"));

    const request = new Request("http://localhost/api/sessions/session-123/start", {
      method: "POST",
    });
    const params = Promise.resolve({ sessionId: mockSessionId });

    const response = await POST(request, { params });
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.error).toBe("Access denied");
  });

  it("should return 500 when an unexpected error occurs", async () => {
    vi.mocked(requireAuth).mockResolvedValue(mockUser as any);
    vi.mocked(SessionService.startSession).mockRejectedValue(new Error("Unexpected"));

    const request = new Request("http://localhost/api/sessions/session-123/start", {
      method: "POST",
    });
    const params = Promise.resolve({ sessionId: mockSessionId });

    const response = await POST(request, { params });
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe("Une erreur interne est survenue");
  });
});
