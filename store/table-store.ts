import { create } from "zustand";
import { CreateTableInput } from "@/lib/validators/table";
import { Table, TableRole } from "@/types/table";

interface TableState {
    isLoading: boolean;
    error: string | null;

    createTable: (
        payload: CreateTableInput,
    ) => Promise<{ success: boolean; table?: Table; error?: string }>;
    leaveTable: (tableId: string) => Promise<{ success: boolean; error?: string }>;
    removeMember: (
        tableId: string,
        memberId: string,
    ) => Promise<{ success: boolean; error?: string }>;
    updateMemberRole: (
        tableId: string,
        memberId: string,
        role: TableRole,
    ) => Promise<{ success: boolean; error?: string }>;
}

export const useTableStore = create<TableState>((set) => ({
    isLoading: false,
    error: null,

    createTable: async (payload: CreateTableInput) => {
        set({ isLoading: true, error: null });
        try {
            const res = await fetch("/api/tables", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (res.ok) {
                set({ isLoading: false });
                return { success: true, table: data.table };
            } else {
                set({ isLoading: false, error: data.error });
                return { success: false, error: data.error };
            }
        } catch (err) {
            set({ isLoading: false, error: "Erreur réseau" });
            return { success: false, error: "Erreur réseau" };
        }
    },

    leaveTable: async (tableId: string) => {
        set({ isLoading: true, error: null });
        try {
            const res = await fetch(`/api/tables/${tableId}/leave`, {
                method: "POST",
            });
            const data = await res.json();
            if (res.ok) {
                set({ isLoading: false });
                return { success: true };
            } else {
                set({ isLoading: false, error: data.error });
                return { success: false, error: data.error };
            }
        } catch (err) {
            set({ isLoading: false, error: "Erreur réseau" });
            return { success: false, error: "Erreur réseau" };
        }
    },

    removeMember: async (tableId: string, memberId: string) => {
        set({ isLoading: true, error: null });
        try {
            const res = await fetch(`/api/tables/${tableId}/members/${memberId}/remove`, {
                method: "POST",
            });
            const data = await res.json();
            if (res.ok) {
                set({ isLoading: false });
                return { success: true };
            } else {
                set({ isLoading: false, error: data.error });
                return { success: false, error: data.error };
            }
        } catch (err) {
            set({ isLoading: false, error: "Erreur réseau" });
            return { success: false, error: "Erreur réseau" };
        }
    },

    updateMemberRole: async (tableId: string, memberId: string, role: TableRole) => {
        set({ isLoading: true, error: null });
        try {
            const res = await fetch(`/api/tables/${tableId}/members/${memberId}/role`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role }),
            });
            const data = await res.json();
            if (res.ok) {
                set({ isLoading: false });
                return { success: true };
            } else {
                set({ isLoading: false, error: data.error });
                return { success: false, error: data.error };
            }
        } catch (err) {
            set({ isLoading: false, error: "Erreur réseau" });
            return { success: false, error: "Erreur réseau" };
        }
    },
}));
