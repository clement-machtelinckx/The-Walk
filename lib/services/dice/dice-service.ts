import { DiceRepository } from "@/lib/repositories/dice-repository";
import { MembershipRepository } from "@/lib/repositories/membership-repository";
import { SessionRepository } from "@/lib/repositories/session-repository";
import { DiceRollInput } from "@/lib/validators/dice";
import { ForbiddenError, NotFoundError } from "@/lib/errors";
import { DiceRollLog } from "@/types/dice";

function rollDice(quantity: number, diceType: number): number[] {
    return Array.from({ length: quantity }, () => Math.floor(Math.random() * diceType) + 1);
}

export const DiceService = {
    async listRolls(userId: string, tableId: string): Promise<DiceRollLog[]> {
        const membership = await MembershipRepository.getByUserAndTable(userId, tableId);
        if (!membership) {
            throw new ForbiddenError("Seuls les membres de la table peuvent voir les lancers.");
        }

        return DiceRepository.listByTable(tableId, 20);
    },

    async createRoll(userId: string, input: DiceRollInput): Promise<DiceRollLog> {
        const membership = await MembershipRepository.getByUserAndTable(userId, input.table_id);
        if (!membership) {
            throw new ForbiddenError("Seuls les membres de la table peuvent lancer les dés.");
        }

        if (input.session_id) {
            const session = await SessionRepository.getById(input.session_id);
            if (!session) throw new NotFoundError("Session", input.session_id);
            if (session.table_id !== input.table_id) {
                throw new ForbiddenError("Cette session n'appartient pas à cette table.");
            }
        }

        const rolls = rollDice(input.quantity, input.dice_type);
        const total = rolls.reduce((sum, value) => sum + value, 0) + input.modifier;

        return DiceRepository.create(input, userId, rolls, total);
    },
};
