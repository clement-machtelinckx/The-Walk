import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DeleteTableDangerZone } from "./delete-table-danger-zone";
import { useTableStore } from "@/store/table-store";

const push = vi.fn();
const refresh = vi.fn();

vi.mock("next/navigation", () => ({
    useRouter: () => ({ push, refresh }),
}));

vi.mock("@/store/table-store");

describe("DeleteTableDangerZone", () => {
    const deleteTable = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        deleteTable.mockResolvedValue({ success: true });
        vi.mocked(useTableStore).mockReturnValue({
            deleteTable,
            isLoading: false,
        } as unknown as ReturnType<typeof useTableStore>);
    });

    it("uses a stable confirmation word instead of the table name", async () => {
        render(
            <DeleteTableDangerZone
                tableId="table-123"
                tableName={'La table des héros / été 2026 !'}
            />,
        );

        fireEvent.click(screen.getByRole("button", { name: "Supprimer la table" }));

        const confirmationInput = screen.getByPlaceholderText("SUPPRIMER");
        const deleteButton = screen.getByRole("button", { name: "Supprimer définitivement" });

        expect(deleteButton).toBeDisabled();

        fireEvent.change(confirmationInput, {
            target: { value: "La table des héros / été 2026 !" },
        });
        expect(deleteButton).toBeDisabled();

        fireEvent.change(confirmationInput, { target: { value: "SUPPRIMER" } });
        expect(deleteButton).toBeEnabled();

        fireEvent.click(deleteButton);

        await waitFor(() => {
            expect(deleteTable).toHaveBeenCalledWith("table-123");
            expect(push).toHaveBeenCalledWith("/tables");
            expect(refresh).toHaveBeenCalled();
        });
    });
});
