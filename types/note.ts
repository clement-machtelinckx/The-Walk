export interface PersonalNote {
    id: string;
    user_id: string;
    table_id: string | null;
    session_id: string | null;
    content: string;
    created_at: string;
    updated_at: string;
}

export interface GroupNote {
    id: string;
    table_id: string;
    session_id: string | null;
    content: string;
    created_at: string;
    updated_at: string;
}
