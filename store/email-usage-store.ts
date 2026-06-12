import { create } from "zustand";

import type { EmailUsageSummary } from "@/types/email";

interface EmailUsageStore {
    usage: EmailUsageSummary | null;
    isLoading: boolean;
    error: string | null;
    fetchUsage: () => Promise<void>;
}

export const useEmailUsageStore = create<EmailUsageStore>((set) => ({
    usage: null,
    isLoading: true,
    error: null,

    fetchUsage: async () => {
        set({ isLoading: true, error: null });

        try {
            const response = await fetch("/api/email/usage");
            const payload = (await response.json()) as {
                usage?: EmailUsageSummary;
                error?: string;
            };

            if (!response.ok || !payload.usage) {
                set({
                    error: payload.error || "Impossible de charger l'usage email.",
                    isLoading: false,
                });
                return;
            }

            set({ usage: payload.usage, isLoading: false });
        } catch {
            set({ error: "Impossible de charger l'usage email.", isLoading: false });
        }
    },
}));
