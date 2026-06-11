export interface TableMessage {
    id: string;
    table_id: string;
    session_id: string | null;
    user_id: string | null;
    content: string;
    created_at: string;
    profiles?: {
        id: string;
        display_name: string | null;
        avatar_url: string | null;
        avatar_key: string | null;
    };
}

export interface TableDiscussionData {
    data: TableMessage[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
