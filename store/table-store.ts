import { create } from "zustand";
import { CreateTableInput } from "@/lib/validators/table";
import { Table, TableRole } from "@/types/table";
import type { TableMemberDTO } from "@/lib/services/memberships/membership-service";

interface TableState {
    isLoading: boolean;
    loadingMembersByTable: Record<string, boolean>;
    error: string | null;
    membersByTable: Record<string, TableMemberDTO[]>;

    createTable: (
        payload: CreateTableInput,
    ) => Promise<{ success: boolean; table?: Table; error?: string }>;
    deleteTable: (tableId: string) => Promise<{ success: boolean; error?: string }>;
    fetchMembers: (tableId: string) => Promise<TableMemberDTO[]>;
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
    loadingMembersByTable: {},
    error: null,
    membersByTable: {},

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
        } catch {
            set({ isLoading: false, error: "Erreur réseau" });
            return { success: false, error: "Erreur réseau" };
        }
    },

    deleteTable: async (tableId: string) => {
        set({ isLoading: true, error: null });
        try {
            const res = await fetch(`/api/tables/${tableId}`, {
                method: "DELETE",
            });
            const data = await res.json();
            if (res.ok) {
                set((state) => ({
                    isLoading: false,
                    membersByTable: Object.fromEntries(
                        Object.entries(state.membersByTable).filter(([id]) => id !== tableId),
                    ),
                }));
                return { success: true };
            }

            set({ isLoading: false, error: data.error });
            return { success: false, error: data.error };
        } catch {
            set({ isLoading: false, error: "Erreur réseau" });
            return { success: false, error: "Erreur réseau" };
        }
    },

    fetchMembers: async (tableId: string) => {
        set((state) => ({
            loadingMembersByTable: { ...state.loadingMembersByTable, [tableId]: true },
            error: null,
        }));
        try {
            const res = await fetch(`/api/tables/${tableId}/members`);
            const data = await res.json();
            if (res.ok) {
                const members = data.members || [];
                set((state) => ({
                    membersByTable: { ...state.membersByTable, [tableId]: members },
                    loadingMembersByTable: {
                        ...state.loadingMembersByTable,
                        [tableId]: false,
                    },
                }));
                return members;
            }

            set((state) => ({
                error: data.error || "Erreur lors de la récupération des membres",
                loadingMembersByTable: {
                    ...state.loadingMembersByTable,
                    [tableId]: false,
                },
            }));
            return [];
        } catch {
            set((state) => ({
                error: "Erreur réseau",
                loadingMembersByTable: {
                    ...state.loadingMembersByTable,
                    [tableId]: false,
                },
            }));
            return [];
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
        } catch {
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
        } catch {
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
        } catch {
            set({ isLoading: false, error: "Erreur réseau" });
            return { success: false, error: "Erreur réseau" };
        }
    },
}));
