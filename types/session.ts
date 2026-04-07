export type SessionStatus = "scheduled" | "active" | "completed" | "cancelled";
export type ResponseStatus = "going" | "maybe" | "declined" | "pending";
export type PresenceStatus = "present" | "absent" | "late" | "excused";

export interface Session {
    id: string;
    table_id: string;
    title: string;
    description: string | null;
    status: SessionStatus;
    scheduled_at: string | null;
    started_at: string | null;
    ended_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface SessionResponse {
    id: string;
    session_id: string;
    user_id: string;
    status: ResponseStatus;
    updated_at: string;
}

export interface SessionResponseWithProfile extends SessionResponse {
    profiles: {
        id: string;
        display_name: string | null;
        avatar_url: string | null;
    };
}

export interface SessionResponsesSummary {
    responses: SessionResponseWithProfile[];
    summary: {
        going: number;
        maybe: number;
        declined: number;
        pending: number;
        total: number;
    };
    non_responders: Array<{
        id: string;
        display_name: string | null;
        avatar_url: string | null;
    }>;
}

export interface SessionPresence {
    id: string;
    session_id: string;
    user_id: string;
    status: PresenceStatus;
    last_seen_at: string;
}

export interface SessionMessage {
    id: string;
    session_id: string;
    user_id: string | null;
    content: string;
    created_at: string;
}
