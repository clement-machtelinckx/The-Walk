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
    async listRolls(userId: string, sessionId: string): Promise<DiceRollLog[]> {
        const session = await SessionRepository.getById(sessionId);
        if (!session) throw new NotFoundError("Session", sessionId);

        const membership = await MembershipRepository.getByUserAndTable(userId, session.table_id);
        if (!membership) {
            throw new ForbiddenError("Seuls les membres de la table peuvent voir les lancers.");
        }

        return DiceRepository.listBySession(sessionId);
    },

    async createRoll(userId: string, input: DiceRollInput): Promise<DiceRollLog> {
        const session = await SessionRepository.getById(input.session_id);
        if (!session) throw new NotFoundError("Session", input.session_id);

        const membership = await MembershipRepository.getByUserAndTable(userId, session.table_id);
        if (!membership) {
            throw new ForbiddenError("Seuls les membres de la table peuvent lancer les dés.");
        }

        const rolls = rollDice(input.quantity, input.dice_type);
        const total = rolls.reduce((sum, value) => sum + value, 0) + input.modifier;

        return DiceRepository.create(input, userId, rolls, total);
    },
};
