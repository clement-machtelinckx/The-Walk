import { describe, it, expect, vi, beforeEach } from "vitest";
import { InvitationService } from "./invitation-service";
import { InvitationRepository } from "@/lib/repositories/invitation-repository";
import { MembershipRepository } from "@/lib/repositories/membership-repository";
import { TableRepository } from "@/lib/repositories/table-repository";
import { TransactionalEmailService } from "@/lib/services/email/transactional-email-service";
import { ForbiddenError, ValidationError } from "@/lib/errors";
import { getServerClient } from "@/lib/db";

vi.mock("@/lib/repositories/invitation-repository");
vi.mock("@/lib/repositories/membership-repository");
vi.mock("@/lib/repositories/table-repository");
vi.mock("@/lib/services/email/transactional-email-service");
vi.mock("@/lib/db", () => ({
    getServerClient: vi.fn(),
}));

describe("InvitationService", () => {
    const mockUserId = "user-123";
    const mockTableId = "table-456";
    const mockToken = "token-789";
    const mockEmail = "test@example.com";
    type Membership = Awaited<ReturnType<typeof MembershipRepository.getByUserAndTable>>;
    type Invitation = Awaited<ReturnType<typeof InvitationRepository.getByToken>>;
    type CreatedInvitation = Awaited<ReturnType<typeof InvitationRepository.create>>;
    type ServerClient = Awaited<ReturnType<typeof getServerClient>>;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("create", () => {
        it("should create invitation if user is GM", async () => {
            const createdInvitation = {
                id: "inv-1",
                table_id: mockTableId,
                email: mockEmail,
                token: mockToken,
                role: "player",
            } as CreatedInvitation;

            vi.mocked(MembershipRepository.getByUserAndTable).mockResolvedValue({
                role: "gm",
            } as Membership);

            vi.mocked(InvitationRepository.create).mockResolvedValue(createdInvitation);
            vi.mocked(TableRepository.getById).mockResolvedValue({
                id: mockTableId,
                name: "Table Test",
            } as Awaited<ReturnType<typeof TableRepository.getById>>);
            vi.mocked(TransactionalEmailService.sendTableInvitationNonBlocking).mockResolvedValue();

            const result = await InvitationService.create(mockUserId, {
                table_id: mockTableId,
                email: mockEmail,
                role: "player",
            });

            expect(result).toEqual(createdInvitation);
            expect(InvitationRepository.create).toHaveBeenCalled();
            await vi.waitFor(() =>
                expect(
                    TransactionalEmailService.sendTableInvitationNonBlocking,
                ).toHaveBeenCalledWith(
                    expect.objectContaining({
                        senderUserId: mockUserId,
                        recipientEmail: mockEmail,
                        tableId: mockTableId,
                        invitationId: "inv-1",
                        invitationToken: mockToken,
                        tableName: "Table Test",
                        role: "player",
                    }),
                ),
            );
        });

        it("should not wait for email delivery to resolve", async () => {
            const createdInvitation = {
                id: "inv-1",
                table_id: mockTableId,
                email: mockEmail,
                token: mockToken,
                role: "player",
            } as CreatedInvitation;
            const pendingEmail = new Promise<void>(() => {});

            vi.mocked(MembershipRepository.getByUserAndTable).mockResolvedValue({
                role: "gm",
            } as Membership);
            vi.mocked(InvitationRepository.create).mockResolvedValue(createdInvitation);
            vi.mocked(TableRepository.getById).mockResolvedValue({
                id: mockTableId,
                name: "Table Test",
            } as Awaited<ReturnType<typeof TableRepository.getById>>);
            vi.mocked(TransactionalEmailService.sendTableInvitationNonBlocking).mockReturnValue(
                pendingEmail,
            );

            await expect(
                InvitationService.create(mockUserId, {
                    table_id: mockTableId,
                    email: mockEmail,
                    role: "player",
                }),
            ).resolves.toEqual(createdInvitation);

            await vi.waitFor(() =>
                expect(TransactionalEmailService.sendTableInvitationNonBlocking).toHaveBeenCalled(),
            );
        });

        it("should still return the created invitation when email sending fails", async () => {
            const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
            const createdInvitation = {
                id: "inv-1",
                table_id: mockTableId,
                email: mockEmail,
                token: mockToken,
                role: "player",
            } as CreatedInvitation;

            vi.mocked(MembershipRepository.getByUserAndTable).mockResolvedValue({
                role: "gm",
            } as Membership);
            vi.mocked(InvitationRepository.create).mockResolvedValue(createdInvitation);
            vi.mocked(TableRepository.getById).mockResolvedValue({
                id: mockTableId,
                name: "Table Test",
            } as Awaited<ReturnType<typeof TableRepository.getById>>);
            vi.mocked(TransactionalEmailService.sendTableInvitationNonBlocking).mockRejectedValue(
                new Error("Provider unavailable"),
            );

            await expect(
                InvitationService.create(mockUserId, {
                    table_id: mockTableId,
                    email: mockEmail,
                    role: "player",
                }),
            ).resolves.toEqual(createdInvitation);

            await vi.waitFor(() =>
                expect(TransactionalEmailService.sendTableInvitationNonBlocking).toHaveBeenCalled(),
            );
            await vi.waitFor(() =>
                expect(consoleErrorSpy).toHaveBeenCalledWith(
                    "[INVITATION_EMAIL]",
                    expect.any(Error),
                ),
            );

            consoleErrorSpy.mockRestore();
        });

        it("should throw ForbiddenError if user is not GM", async () => {
            vi.mocked(MembershipRepository.getByUserAndTable).mockResolvedValue({
                role: "player",
            } as Membership);

            await expect(
                InvitationService.create(mockUserId, {
                    table_id: mockTableId,
                    email: mockEmail,
                    role: "player",
                }),
            ).rejects.toThrow(ForbiddenError);
        });
    });

    describe("accept", () => {
        const mockUser = { id: mockUserId, email: mockEmail };

        beforeEach(() => {
            vi.mocked(getServerClient).mockResolvedValue({
                auth: {
                    getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
                },
            } as unknown as ServerClient);
        });

        it("should accept invitation if valid and email matches", async () => {
            vi.mocked(InvitationRepository.getByToken).mockResolvedValue({
                id: "inv-1",
                table_id: mockTableId,
                email: mockEmail,
                status: "pending",
                role: "player",
                expires_at: null,
            } as Invitation);

            vi.mocked(MembershipRepository.getByUserAndTable).mockResolvedValue(null);

            await InvitationService.accept(mockUserId, mockToken);

            expect(MembershipRepository.create).toHaveBeenCalledWith(
                mockTableId,
                mockUserId,
                "player",
            );
            expect(InvitationRepository.updateStatus).toHaveBeenCalledWith("inv-1", "accepted");
        });

        it("should throw ValidationError if invitation is expired", async () => {
            const pastDate = new Date();
            pastDate.setHours(pastDate.getHours() - 1);

            vi.mocked(InvitationRepository.getByToken).mockResolvedValue({
                id: "inv-1",
                status: "pending",
                expires_at: pastDate.toISOString(),
            } as Invitation);

            await expect(InvitationService.accept(mockUserId, mockToken)).rejects.toThrow(
                ValidationError,
            );
            expect(InvitationRepository.updateStatus).toHaveBeenCalledWith("inv-1", "expired");
        });

        it("should throw ValidationError if email does not match", async () => {
            vi.mocked(InvitationRepository.getByToken).mockResolvedValue({
                id: "inv-1",
                email: "other@example.com",
                status: "pending",
            } as Invitation);

            await expect(InvitationService.accept(mockUserId, mockToken)).rejects.toThrow(
                ValidationError,
            );
            expect(MembershipRepository.create).not.toHaveBeenCalled();
        });

        it("should throw ForbiddenError if not logged in", async () => {
            vi.mocked(getServerClient).mockResolvedValue({
                auth: {
                    getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
                },
            } as unknown as ServerClient);

            vi.mocked(InvitationRepository.getByToken).mockResolvedValue({
                id: "inv-1",
                email: mockEmail,
                status: "pending",
            } as Invitation);

            await expect(InvitationService.accept(mockUserId, mockToken)).rejects.toThrow(
                ForbiddenError,
            );
        });
    });
});
