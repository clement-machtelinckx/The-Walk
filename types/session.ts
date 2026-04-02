export type SessionStatus = "scheduled" | "live" | "completed" | "cancelled";

export interface Session {
    id: string;
    tableId: string;
    title: string;
    status: SessionStatus;
    scheduledAt: string;
    startedAt?: string;
    endedAt?: string;
    notes?: string;
}

export interface SessionEvent {
    id: string;
    sessionId: string;
    type: string;
    payload: Record<string, unknown>;
    createdAt: string;
}
