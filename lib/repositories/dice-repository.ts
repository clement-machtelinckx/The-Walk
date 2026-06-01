import { getServerClient } from "@/lib/db";
import { handleDbError } from "./_shared/base";
import { DiceRollInput } from "@/lib/validators/dice";
import { DiceRollLog } from "@/types/dice";

export const DiceRepository = {
    async create(
        input: DiceRollInput,
        userId: string,
        rolls: number[],
        total: number,
    ): Promise<DiceRollLog> {
        const supabase = await getServerClient();
        const { data, error } = await supabase
            .from("session_dice_rolls")
            .insert({
                table_id: input.table_id,
                session_id: input.session_id ?? null,
                user_id: userId,
                dice_type: input.dice_type,
                quantity: input.quantity,
                modifier: input.modifier,
                rolls,
                total,
                roll_kind: input.roll_kind,
            })
            .select("*, profiles!inner(id, display_name, avatar_url)")
            .single();

        handleDbError(error, "DiceRepository.create");
        return data as DiceRollLog;
    },

    async listByTable(tableId: string, limit = 20): Promise<DiceRollLog[]> {
        const supabase = await getServerClient();
        const { data, error } = await supabase
            .from("session_dice_rolls")
            .select("*, profiles!inner(id, display_name, avatar_url)")
            .eq("table_id", tableId)
            .order("created_at", { ascending: false })
            .limit(limit);

        handleDbError(error, "DiceRepository.listByTable");
        return (data as DiceRollLog[]) || [];
    },
};
