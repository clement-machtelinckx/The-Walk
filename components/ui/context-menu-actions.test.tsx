import { fireEvent, render, screen } from "@testing-library/react";
import { Trash2 } from "lucide-react";
import { describe, expect, it, vi } from "vitest";

import { ContextMenuActions } from "@/components/ui/context-menu-actions";

describe("ContextMenuActions", () => {
    it("renders callback, link, disabled and destructive actions", () => {
        const onEdit = vi.fn();
        const onDisabled = vi.fn();

        render(
            <ContextMenuActions
                label="Ouvrir les actions de test"
                actions={[
                    {
                        id: "edit",
                        label: "Modifier",
                        onSelect: onEdit,
                    },
                    {
                        id: "details",
                        label: "Voir les détails",
                        href: "/tables/table-123",
                    },
                    {
                        id: "disabled",
                        label: "Action indisponible",
                        disabled: true,
                        onSelect: onDisabled,
                    },
                    {
                        id: "delete",
                        label: "Supprimer",
                        icon: Trash2,
                        destructive: true,
                        separatorBefore: true,
                        onSelect: vi.fn(),
                    },
                ]}
            />,
        );

        const openMenu = () =>
            fireEvent.pointerDown(
                screen.getByRole("button", { name: "Ouvrir les actions de test" }),
                { button: 0, ctrlKey: false },
            );

        openMenu();
        fireEvent.click(screen.getByRole("menuitem", { name: "Modifier" }));
        expect(onEdit).toHaveBeenCalledOnce();

        openMenu();

        expect(screen.getByRole("menuitem", { name: "Voir les détails" })).toHaveAttribute(
            "href",
            "/tables/table-123",
        );
        expect(screen.getByRole("menuitem", { name: "Action indisponible" })).toHaveAttribute(
            "data-disabled",
        );
        expect(screen.getByRole("menuitem", { name: "Supprimer" })).toHaveAttribute(
            "data-variant",
            "destructive",
        );

        fireEvent.click(screen.getByRole("menuitem", { name: "Action indisponible" }));
        expect(onDisabled).not.toHaveBeenCalled();
    });
});
