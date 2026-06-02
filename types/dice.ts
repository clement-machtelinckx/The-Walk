export interface DiceRollProfile {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
}

export interface DiceRollLog {
    id: string;
    table_id: string;
    session_id: string | null;
    user_id: string;
    dice_type: number;
    quantity: number;
    modifier: number;
    rolls: number[];
    total: number;
    roll_kind: string;
    created_at: string;
    profiles?: DiceRollProfile;
}
