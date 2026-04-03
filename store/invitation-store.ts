import { create } from "zustand";
import { Invitation } from "@/types/table";
import { InvitationWithTable } from "@/lib/services/invitations/invitation-service";
import { CreateInvitationInput } from "@/lib/validators/invitation";

interface InvitationState {
    pendingInvitations: InvitationWithTable[];
    tableInvitations: Record<string, Invitation[]>;
    isLoading: boolean;
    error: string | null;

    fetchPendingInvitations: () => Promise<void>;
    fetchTableInvitations: (tableId: string) => Promise<void>;
    createInvitation: (tableId: string, payload: Omit<CreateInvitationInput, 'table_id'>) => Promise<{ success: boolean; invitation?: Invitation; error?: string }>;
}

export const useInvitationStore = create<InvitationState>((set, get) => ({
    pendingInvitations: [],
    tableInvitations: {},
    isLoading: false,
    error: null,

    fetchPendingInvitations: async () => {
        set({ isLoading: true, error: null });
        try {
            const res = await fetch("/api/invitations");
            const data = await res.json();
            if (res.ok) {
                set({ pendingInvitations: data.invitations, isLoading: false });
            } else {
                set({ error: data.error || "Erreur lors de la récupération des invitations", isLoading: false });
            }
        } catch (err) {
            set({ error: "Erreur réseau", isLoading: false });
        }
    },

    fetchTableInvitations: async (tableId: string) => {
        set({ isLoading: true, error: null });
        try {
            const res = await fetch(`/api/tables/${tableId}/invitations`);
            const data = await res.json();
            if (res.ok) {
                set((state) => ({
                    tableInvitations: {
                        ...state.tableInvitations,
                        [tableId]: data.invitations,
                    },
                    isLoading: false,
                }));
            } else {
                set({ error: data.error || "Erreur lors de la récupération des invitations de la table", isLoading: false });
            }
        } catch (err) {
            set({ error: "Erreur réseau", isLoading: false });
        }
    },

    createInvitation: async (tableId: string, payload: Omit<CreateInvitationInput, 'table_id'>) => {
        set({ error: null });
        try {
            const res = await fetch(`/api/tables/${tableId}/invitations`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (res.ok) {
                // Update local list if we have it
                const currentTableInvitations = get().tableInvitations[tableId] || [];
                set((state) => ({
                    tableInvitations: {
                        ...state.tableInvitations,
                        [tableId]: [data.invitation, ...currentTableInvitations],
                    },
                }));
                return { success: true, invitation: data.invitation };
            } else {
                return { success: false, error: data.error || "Erreur lors de la création de l'invitation" };
            }
        } catch (err) {
            return { success: false, error: "Erreur réseau" };
        }
    },
}));
