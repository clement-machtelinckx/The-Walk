export type TableRole = "gm" | "player" | "observer";
export type InvitationStatus = "pending" | "accepted" | "declined" | "expired";

export interface Table {
    id: string;
    name: string;
    description: string | null;
    owner_id: string;
    created_at: string;
    updated_at: string;
}

export interface TableMember {
    id: string;
    table_id: string;
    user_id: string;
    role: TableRole;
    joined_at: string;
}

export interface TableMemberWithProfile extends TableMember {
    profiles: {
        id: string;
        display_name: string | null;
        avatar_url: string | null;
    };
}

export interface Invitation {
    id: string;
    table_id: string;
    inviter_id: string;
    email: string;
    role: TableRole;
    status: InvitationStatus;
    token: string;
    expires_at: string | null;
    created_at: string;
    updated_at: string;
}
