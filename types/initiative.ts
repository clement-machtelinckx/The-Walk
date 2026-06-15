export type InitiativeParticipantType = "member" | "custom";

export interface InitiativeProfile {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
    avatar_key: string | null;
}

export interface InitiativeEntry {
    id: string;
    session_id: string;
    table_id: string;
    participant_type: InitiativeParticipantType;
    user_id: string | null;
    label: string | null;
    initiative_score: number | null;
    initiative_modifier: number;
    initiative_requested_at: string | null;
    position: number;
    last_roll_id: string | null;
    created_by: string;
    created_at: string;
    updated_at: string;
    profile?: InitiativeProfile | null;
}

export interface InitiativeState {
    session_id: string;
    table_id: string;
    current_entry_id: string | null;
    initiative_requested_at: string | null;
    requested_by: string | null;
    created_at: string;
    updated_at: string;
}

export interface InitiativeEligibleMember {
    user_id: string;
    display_name: string | null;
    avatar_url: string | null;
    avatar_key: string | null;
}

export interface InitiativeSnapshot {
    state: InitiativeState | null;
    entries: InitiativeEntry[];
    eligible_members: InitiativeEligibleMember[];
}
